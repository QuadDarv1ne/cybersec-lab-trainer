import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { logger } from "@/lib/logger";
import { validateCsrfToken, setCsrfCookie } from "@/lib/csrf-server";
import { getCsrfCookieName, getCsrfHeaderName } from "@/lib/csrf-constants";
import { rateLimit, getClientIP, addRateLimitHeaders } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const { error, userId } = await requireRole(['TEACHER', 'ADMIN']);
  if (error) return error;

  const rateLimitResult = await rateLimit(getClientIP(request));
  if (rateLimitResult.response) return rateLimitResult.response;

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'students';

    const { db } = await import('@/lib/db');
    await setCsrfCookie();

    switch (action) {
      case 'students': {
        const search = url.searchParams.get('search') || '';
        const students = await db.user.findMany({
          where: {
            role: 'STUDENT',
            ...(search ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
              ],
            } : {}),
          },
          orderBy: { updatedAt: 'desc' },
          take: 200,
        });

        // Get group membership info for these students
        const studentIds = students.map((s: { id: string }) => s.id);
        const memberships = await db.groupMember.findMany({
          where: { userId: { in: studentIds } },
          include: { group: { select: { id: true, name: true, teacherId: true } } },
        });

        const membershipMap: Record<string, { id: string; name: string }[]> = {};
        for (const m of memberships) {
          if (!membershipMap[m.userId]) membershipMap[m.userId] = [];
          membershipMap[m.userId].push({ id: m.group.id, name: m.group.name });
        }

        const studentsWithGroups = students.map((s: { id: string }) => ({
          ...s,
          groups: membershipMap[s.id] || [],
        }));

        const response = NextResponse.json({
          students: studentsWithGroups,
          csrfCookieName: getCsrfCookieName(),
          csrfHeaderName: getCsrfHeaderName(),
        });
        return response;
      }

      case 'student-progress': {
        const studentId = url.searchParams.get('studentId');
        if (!studentId) {
          return NextResponse.json({ error: "studentId required" }, { status: 400 });
        }
        const [progress, quizResults, labProgress, studySessions, memberships] = await Promise.all([
          db.progress.findMany({ where: { userId: studentId } }),
          db.quizResult.findMany({ where: { userId: studentId } }),
          db.labProgress.findMany({ where: { userId: studentId } }),
          db.studySession.findMany({ where: { userId: studentId } }),
          db.groupMember.findMany({
            where: { userId: studentId },
            include: { group: { select: { id: true, name: true } } },
          }),
        ]);

        const student = await db.user.findUnique({ where: { id: studentId } });

        const response = NextResponse.json({
          student,
          progress,
          quizResults,
          labProgress,
          studySessions,
          groups: memberships.map((m: { group: { id: string; name: string } }) => m.group),
          totalStudyTime: studySessions.reduce((sum: number, s: { durationMs: number }) => sum + s.durationMs, 0),
          csrfCookieName: getCsrfCookieName(),
          csrfHeaderName: getCsrfHeaderName(),
        });
        return response;
      }

      case 'groups': {
        const groups = await db.teacherGroup.findMany({
          where: { teacherId: userId! },
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true, image: true } } },
            },
            _count: { select: { members: true, assignments: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        const response = NextResponse.json({
          groups,
          csrfCookieName: getCsrfCookieName(),
          csrfHeaderName: getCsrfHeaderName(),
        });
        return response;
      }

      case 'assignments': {
        const groupId = url.searchParams.get('groupId') || undefined;
        const where: Record<string, unknown> = { teacherId: userId };
        if (groupId) where.groupId = groupId;
        const assignments = await db.assignment.findMany({
          where,
          include: {
            _count: { select: { submissions: true } },
            group: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        const response = NextResponse.json({
          assignments,
          csrfCookieName: getCsrfCookieName(),
          csrfHeaderName: getCsrfHeaderName(),
        });
        return response;
      }

      case 'assignment-submissions': {
        const assignmentId = url.searchParams.get('assignmentId');
        if (!assignmentId) {
          return NextResponse.json({ error: "assignmentId required" }, { status: 400 });
        }
        const submissions = await db.assignmentSubmission.findMany({
          where: { assignmentId },
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
          orderBy: { submittedAt: 'desc' },
        });
        const assignment = await db.assignment.findUnique({
          where: { id: assignmentId },
          select: { id: true, title: true, maxScore: true },
        });
        const response = NextResponse.json({
          submissions,
          assignment,
          csrfCookieName: getCsrfCookieName(),
          csrfHeaderName: getCsrfHeaderName(),
        });
        return response;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    logger.error('[TEACHER API] Error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error, userId } = await requireRole(['TEACHER', 'ADMIN']);
  if (error) return error;

  const rateLimitResult = await rateLimit(getClientIP(request));
  if (rateLimitResult.response) return rateLimitResult.response;

  try {
    // Reject oversized payloads before parsing to prevent memory exhaustion DoS
    const contentLength = request.headers.get('content-length');
    const contentLengthNum = contentLength ? Number(contentLength) : NaN;
    if (!isNaN(contentLengthNum) && contentLengthNum > 512_000) {
      return NextResponse.json({ error: 'Request body too large (max 512 KB)' }, { status: 413 });
    }

    // Validate CSRF token
    const csrfValid = await validateCsrfToken(request);
    if (!csrfValid) {
      return NextResponse.json({ error: "Invalid or missing CSRF token" }, { status: 403 });
    }

    const body = await request.json();
    const { action, payload } = body;
    const { db } = await import('@/lib/db');

    switch (action) {
      case 'create-group': {
        const { name, description } = payload;
        if (!name) {
          return NextResponse.json({ error: "Group name required" }, { status: 400 });
        }
        const group = await db.teacherGroup.create({
          data: { name, description, teacherId: userId! },
        });
        return NextResponse.json({ group, message: "Group created" });
      }

      case 'update-group': {
        const { groupId, name, description } = payload;
        if (!groupId) {
          return NextResponse.json({ error: "groupId required" }, { status: 400 });
        }
        const group = await db.teacherGroup.update({
          where: { id: groupId, teacherId: userId! },
          data: { ...(name ? { name } : {}), ...(description !== undefined ? { description } : {}) },
        });
        return NextResponse.json({ group, message: "Group updated" });
      }

      case 'delete-group': {
        const { groupId } = payload;
        if (!groupId) {
          return NextResponse.json({ error: "groupId required" }, { status: 400 });
        }
        await db.teacherGroup.delete({ where: { id: groupId, teacherId: userId! } });
        return NextResponse.json({ message: "Group deleted" });
      }

      case 'add-student': {
        const { groupId, studentId } = payload;
        if (!groupId || !studentId) {
          return NextResponse.json({ error: "groupId and studentId required" }, { status: 400 });
        }
        // Verify group ownership
        const group = await db.teacherGroup.findUnique({ where: { id: groupId }, select: { teacherId: true } });
        if (!group || group.teacherId !== userId) {
          return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }
        await db.groupMember.create({
          data: { groupId, userId: studentId },
        });
        return NextResponse.json({ message: "Student added to group" });
      }

      case 'remove-student': {
        const { groupId, studentId } = payload;
        if (!groupId || !studentId) {
          return NextResponse.json({ error: "groupId and studentId required" }, { status: 400 });
        }
        // Verify group ownership (use deleteMany's own where clause — it only deletes
        // if the group belongs to this teacher due to schema relations, but we still
        // check explicitly for a clear error message)
        const group = await db.teacherGroup.findUnique({ where: { id: groupId }, select: { teacherId: true } });
        if (!group || group.teacherId !== userId) {
          return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }
        await db.groupMember.deleteMany({
          where: { groupId, userId: studentId },
        });
        return NextResponse.json({ message: "Student removed from group" });
      }

      case 'create-assignment': {
        const { title, description, moduleId, groupId, dueDate, maxScore } = payload;
        if (!title) {
          return NextResponse.json({ error: "Title required" }, { status: 400 });
        }
        // Verify group ownership if groupId is provided
        if (groupId) {
          const group = await db.teacherGroup.findUnique({ where: { id: groupId }, select: { teacherId: true } });
          if (!group || group.teacherId !== userId) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
          }
        }
        const assignment = await db.assignment.create({
          data: {
            title,
            description,
            moduleId,
            groupId,
            teacherId: userId!,
            dueDate: dueDate ? new Date(dueDate) : null,
            maxScore: maxScore || 100,
          },
        });
        return NextResponse.json({ assignment, message: "Assignment created" });
      }

      case 'delete-assignment': {
        const { assignmentId } = payload;
        if (!assignmentId) {
          return NextResponse.json({ error: "assignmentId required" }, { status: 400 });
        }
        await db.assignment.delete({ where: { id: assignmentId, teacherId: userId! } });
        return NextResponse.json({ message: "Assignment deleted" });
      }

      case 'grade-submission': {
        const { submissionId, score, comment } = payload;
        if (!submissionId || score === undefined) {
          return NextResponse.json({ error: "submissionId and score required" }, { status: 400 });
        }
        const submission = await db.assignmentSubmission.update({
          where: { id: submissionId },
          data: { score, comment, gradedAt: new Date() },
        });
        return NextResponse.json({ submission, message: "Submission graded" });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    logger.error('[TEACHER API] Error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
