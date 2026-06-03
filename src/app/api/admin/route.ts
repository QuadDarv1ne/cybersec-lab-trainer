import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getDbAdapter } from "@/lib/db-adapter";
import { logger } from "@/lib/logger";
import { validateCsrfToken, setCsrfCookie } from "@/lib/csrf-server";
import { getCsrfCookieName, getCsrfHeaderName } from "@/lib/csrf-constants";

export async function GET(request: Request) {
  const { error, userId: _userId } = await requireRole(['ADMIN']);
  if (error) return error;

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'stats';

    const _adapter = getDbAdapter();

    switch (action) {
      case 'users': {
        const search = url.searchParams.get('search') || '';
        const role = url.searchParams.get('role') || '';
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
        const skip = (page - 1) * limit;
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { db } = require('@/lib/db');
        const [users, total] = await Promise.all([
          db.user.findMany({
            where: {
              ...(search ? {
                OR: [
                  { name: { contains: search } },
                  { email: { contains: search } },
                ],
              } : {}),
              ...(role ? { role } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
          db.user.count({
            where: {
              ...(search ? {
                OR: [
                  { name: { contains: search } },
                  { email: { contains: search } },
                ],
              } : {}),
              ...(role ? { role } : {}),
            },
          }),
        ]);
        await setCsrfCookie();
        const response = NextResponse.json({ users, total, page, limit, totalPages: Math.ceil(total / limit), csrfCookieName: getCsrfCookieName(), csrfHeaderName: getCsrfHeaderName() });
        return response;
      }

      case 'user': {
        const targetUserId = url.searchParams.get('id');
        if (!targetUserId) {
          return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { db } = require('@/lib/db');
        const user = await db.user.findUnique({
          where: { id: targetUserId },
          include: {
            progress: true,
            quizResults: true,
            studySessions: true,
            labProgress: true,
            groupMemberships: {
              include: { group: { select: { id: true, name: true } } },
            },
          },
        });
        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        await setCsrfCookie();
        const response = NextResponse.json({ user, csrfCookieName: getCsrfCookieName(), csrfHeaderName: getCsrfHeaderName() });
        return response;
      }

      case 'stats': {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { db } = require('@/lib/db');
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
        const [
          totalUsers, studentsCount, teachersCount,
          totalModulesProgress, totalQuizResults, totalLabsStarted,
          recentUsers, monthlyUsers,
        ] = await Promise.all([
          db.user.count(),
          db.user.count({ where: { role: 'STUDENT' } }),
          db.user.count({ where: { role: 'TEACHER' } }),
          db.progress.count(),
          db.quizResult.count(),
          db.labProgress.count(),
          db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
          db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        ]);

        // Audit log: get recent admin actions
        const recentActions = await db.adminAction.findMany
          ? await db.adminAction.findMany({ orderBy: { createdAt: 'desc' }, take: 20 })
          : [];

        await setCsrfCookie();
        const response = NextResponse.json({
          stats: { totalUsers, studentsCount, teachersCount, totalModulesProgress, totalQuizResults, totalLabsStarted, recentUsers, monthlyUsers },
          recentActions,
          csrfCookieName: getCsrfCookieName(), csrfHeaderName: getCsrfHeaderName(),
        });
        return response;
      }

      case 'audit-log': {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { db } = require('@/lib/db');
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
        const skip = (page - 1) * limit;
        const [actions, total] = await Promise.all([
          db.adminAction.findMany
            ? db.adminAction.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit })
            : [],
          db.adminAction.count ? db.adminAction.count() : 0,
        ]);
        await setCsrfCookie();
        const response = NextResponse.json({ actions, total, page, limit, totalPages: Math.ceil(total / limit), csrfCookieName: getCsrfCookieName(), csrfHeaderName: getCsrfHeaderName() });
        return response;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    logger.error('[ADMIN API] Error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error, userId } = await requireRole(['ADMIN']);
  if (error) return error;

  try {
    // Validate CSRF token
    const csrfValid = await validateCsrfToken(request);
    if (!csrfValid) {
      return NextResponse.json({ error: "Invalid or missing CSRF token" }, { status: 403 });
    }

    const body = await request.json();
    const { action, payload } = body;

    const adapter = getDbAdapter();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { db } = require('@/lib/db');

    // Helper to log admin actions
    const logAction = async (actionName: string, targetUserId: string, details: Record<string, unknown> = {}) => {
      try {
        if (db.adminAction?.create) {
          await db.adminAction.create({
            data: {
              adminId: userId,
              action: actionName,
              targetUserId,
              details: JSON.stringify(details),
              createdAt: new Date(),
            },
          });
        }
      } catch (e) {
        logger.warn('[ADMIN] Failed to log action:', e);
      }
    };

    switch (action) {
      case 'update-role': {
        const { userId: targetUserId, role: newRole } = payload;
        if (!targetUserId || !newRole) {
          return NextResponse.json({ error: "userId and role required" }, { status: 400 });
        }
        if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(newRole)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        const updated = await db.user.update({
          where: { id: targetUserId },
          data: { role: newRole },
        });
        await logAction('update-role', targetUserId, { oldRole: updated.role, newRole });
        logger.info(`[ADMIN] User ${userId} changed role of ${targetUserId} to ${newRole}`);
        return NextResponse.json({ user: updated, message: "Role updated" });
      }

      case 'delete-user': {
        const { userId: targetUserId } = payload;
        if (!targetUserId) {
          return NextResponse.json({ error: "userId required" }, { status: 400 });
        }
        const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        await adapter.deleteAllForUser(targetUserId);
        await db.user.delete({ where: { id: targetUserId } });
        await logAction('delete-user', targetUserId, { deletedUser: targetUser.email });
        logger.info(`[ADMIN] User ${userId} deleted user ${targetUserId}`);
        return NextResponse.json({ message: "User deleted" });
      }

      case 'bulk-update-role': {
        const { userIds, newRole } = payload;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !newRole) {
          return NextResponse.json({ error: "userIds array and role required" }, { status: 400 });
        }
        if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(newRole)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        const result = await db.user.updateMany({
          where: { id: { in: userIds } },
          data: { role: newRole },
        });
        for (const uid of userIds) {
          await logAction('bulk-update-role', uid, { newRole });
        }
        logger.info(`[ADMIN] User ${userId} bulk-updated ${result.count} users to ${newRole}`);
        return NextResponse.json({ message: `Updated ${result.count} users` });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    logger.error('[ADMIN API] Error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
