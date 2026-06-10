'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Trash2,
  Loader2, GraduationCap,
  UserPlus, UserMinus, FileText, Search, Star, Eye,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

type StudentInfo = {
  id: string; name: string | null; email: string | null;
  image: string | null; groups: { id: string; name: string }[];
};

type GroupMemberInfo = { id: string; name: string | null; email: string | null; image: string | null };

type GroupInfo = {
  id: string; name: string; description: string | null;
  members: { user: GroupMemberInfo }[];
  _count: { members: number; assignments: number };
};

type SubInfo = { id: string; user: { id: string; name: string | null; email: string | null; image: string | null }; score: number | null; comment: string | null; submittedAt: string; gradedAt: string | null };

type AssignmentInfo = {
  id: string; title: string; description: string | null;
  moduleId: string | null; dueDate: string | null;
  maxScore: number; createdAt: string;
  group: { id: string; name: string } | null;
  _count: { submissions: number };
};

export default function TeacherDashboard() {
  const [tab, setTab] = useState<'students' | 'groups' | 'assignments'>('students');
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [assignments, setAssignments] = useState<AssignmentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');

  // Group form
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');

  // Add student to group
  const [addStudentGroupId, setAddStudentGroupId] = useState<string | null>(null);
  const [addStudentSearch, setAddStudentSearch] = useState('');
  const [addStudentResults, setAddStudentResults] = useState<StudentInfo[]>([]);

  // Assignment form
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignGroup, setAssignGroup] = useState('');
  const [assignDue, setAssignDue] = useState('');

  // Submissions view
  const [viewSubmissionsFor, setViewSubmissionsFor] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<SubInfo[]>([]);
  const [submissionsAssignment, setSubmissionsAssignment] = useState<{ id: string; title: string; maxScore: number } | null>(null);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Grading
  const [gradeSubmissionId, setGradeSubmissionId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeComment, setGradeComment] = useState('');

  const loadStudents = useCallback(async (search = '') => {
    try {
      const params = new URLSearchParams({ action: 'students' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/teacher?${params}`);
      const data = await res.json();
      if (data.students) setStudents(data.students);
    } catch (err) { toast.error('Failed to load students'); logger.error('loadStudents failed:', err); }
  }, []);

  const loadGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/teacher?action=groups');
      const data = await res.json();
      if (data.groups) setGroups(data.groups);
    } catch (err) { toast.error('Failed to load groups'); logger.error('loadGroups failed:', err); }
  }, []);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/teacher?action=assignments');
      const data = await res.json();
      if (data.assignments) setAssignments(data.assignments);
    } catch (err) { toast.error('Failed to load assignments'); logger.error('loadAssignments failed:', err); }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadStudents(), loadGroups(), loadAssignments()]).finally(() => setLoading(false));
  }, [loadStudents, loadGroups, loadAssignments]);

  useEffect(() => {
    const timer = setTimeout(() => loadStudents(studentSearch), 300);
    return () => clearTimeout(timer);
  }, [studentSearch, loadStudents]);

  // Search students for adding to group
  useEffect(() => {
    if (!addStudentSearch || addStudentSearch.length < 2) {
      setAddStudentResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/teacher?action=students&search=${addStudentSearch}`);
        const data = await res.json();
        if (data.students) setAddStudentResults(data.students);
      } catch { /* ignore — search typing is debounced, failures are expected */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [addStudentSearch]);

  const handleAddStudent = async (groupId: string, studentId: string) => {
    try {
      const res = await fetch('/api/teacher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-student', payload: { groupId, studentId } }),
      });
      if (res.ok) {
        toast.success('Student added to group');
        loadGroups();
      }
    } catch (err) { toast.error('Failed to add student'); logger.error('addStudent failed:', err); }
  };

  const handleRemoveStudent = async (groupId: string, studentId: string) => {
    try {
      const res = await fetch('/api/teacher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove-student', payload: { groupId, studentId } }),
      });
      if (res.ok) {
        toast.success('Student removed from group');
        loadGroups();
      }
    } catch (err) { toast.error('Failed to remove student'); logger.error('removeStudent failed:', err); }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) { toast.error('Group name required'); return; }
    try {
      const res = await fetch('/api/teacher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-group', payload: { name: groupName, description: groupDesc } }),
      });
      if (res.ok) {
        toast.success('Group created');
        setShowGroupForm(false); setGroupName(''); setGroupDesc('');
        loadGroups();
      }
    } catch (err) { toast.error('Failed to create group'); logger.error('createGroup failed:', err); }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Delete this group and all its memberships?')) return;
    try {
      const res = await fetch('/api/teacher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-group', payload: { groupId } }),
      });
      if (res.ok) { toast.success('Group deleted'); loadGroups(); }
    } catch (err) { toast.error('Failed to delete group'); logger.error('deleteGroup failed:', err); }
  };

  const handleCreateAssignment = async () => {
    if (!assignTitle.trim()) { toast.error('Title required'); return; }
    try {
      const res = await fetch('/api/teacher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-assignment',
          payload: { title: assignTitle, description: assignDesc, groupId: assignGroup || null, dueDate: assignDue || null },
        }),
      });
      if (res.ok) {
        toast.success('Assignment created');
        setShowAssignmentForm(false); setAssignTitle(''); setAssignDesc(''); setAssignGroup(''); setAssignDue('');
        loadAssignments();
      }
    } catch (err) { toast.error('Failed to create assignment'); logger.error('createAssignment failed:', err); }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      const res = await fetch('/api/teacher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-assignment', payload: { assignmentId } }),
      });
      if (res.ok) { toast.success('Assignment deleted'); loadAssignments(); }
    } catch (err) { toast.error('Failed to delete assignment'); logger.error('deleteAssignment failed:', err); }
  };

  const loadSubmissions = async (assignmentId: string) => {
    setSubmissionsLoading(true);
    setViewSubmissionsFor(assignmentId);
    try {
      const res = await fetch(`/api/teacher?action=assignment-submissions&assignmentId=${assignmentId}`);
      const data = await res.json();
      if (data.submissions) setSubmissions(data.submissions);
      if (data.assignment) setSubmissionsAssignment(data.assignment);
    } catch (err) { toast.error('Failed to load submissions'); logger.error('loadSubmissions failed:', err); }
    finally { setSubmissionsLoading(false); }
  };

  const handleGrade = async () => {
    if (!gradeSubmissionId || gradeScore === '') return;
    const score = parseInt(gradeScore, 10);
    if (isNaN(score) || score < 0) { toast.error('Invalid score'); return; }
    try {
      const res = await fetch('/api/teacher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grade-submission',
          payload: { submissionId: gradeSubmissionId, score, comment: gradeComment },
        }),
      });
      if (res.ok) {
        toast.success('Submission graded');
        setGradeSubmissionId(null); setGradeScore(''); setGradeComment('');
        if (viewSubmissionsFor) loadSubmissions(viewSubmissionsFor);
      }
    } catch (err) { toast.error('Failed to grade submission'); logger.error('gradeSubmission failed:', err); }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage students, groups, and assignments</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <Button variant={tab === 'students' ? 'default' : 'ghost'} size="sm"
            onClick={() => setTab('students')} className={tab === 'students' ? 'bg-white shadow-sm' : ''}>
            <GraduationCap size={16} className="mr-1" /> Students
          </Button>
          <Button variant={tab === 'groups' ? 'default' : 'ghost'} size="sm"
            onClick={() => setTab('groups')} className={tab === 'groups' ? 'bg-white shadow-sm' : ''}>
            <Users size={16} className="mr-1" /> Groups
          </Button>
          <Button variant={tab === 'assignments' ? 'default' : 'ghost'} size="sm"
            onClick={() => setTab('assignments')} className={tab === 'assignments' ? 'bg-white shadow-sm' : ''}>
            <FileText size={16} className="mr-1" /> Assignments
          </Button>
        </div>
      </div>

      {/* ========== STUDENTS TAB ========== */}
      {tab === 'students' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search students by name or email..." value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((s) => (
              <Card key={s.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={s.image || undefined} alt={s.name || 'Student'} />
                      <AvatarFallback className="bg-emerald-600 text-white text-xs">
                        {(s.name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name || 'Unnamed'}</p>
                      <p className="text-xs text-slate-500 truncate">{s.email}</p>
                    </div>
                  </div>
                  {s.groups.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.groups.map((g) => (
                        <Badge key={g.id} variant="outline" className="text-[10px]">{g.name}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {students.length === 0 && <p className="text-center text-slate-500 py-8 col-span-full">No students found</p>}
          </div>
        </div>
      )}

      {/* ========== GROUPS TAB ========== */}
      {tab === 'groups' && (
        <div className="space-y-4">
          <Button size="sm" onClick={() => setShowGroupForm(!showGroupForm)}>
            <Plus size={14} className="mr-1" /> {showGroupForm ? 'Cancel' : 'New Group'}
          </Button>

          <AnimatePresence>
            {showGroupForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <Card className="border-emerald-200 mb-4">
                  <CardContent className="p-4 space-y-3">
                    <Input placeholder="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                    <Textarea placeholder="Description (optional)" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} rows={2} />
                    <Button size="sm" onClick={handleCreateGroup}>Create Group</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {groups.map((g) => (
              <Card key={g.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{g.name}</h4>
                        <Badge variant="outline" className="text-[10px]">{g._count.members} students</Badge>
                        <Badge variant="outline" className="text-[10px]">{g._count.assignments} assignments</Badge>
                      </div>
                      {g.description && <p className="text-xs text-slate-500 mt-1">{g.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 shrink-0"
                      onClick={() => handleDeleteGroup(g.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  <Separator className="my-3" />

                  {/* Members list */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-slate-500">Members ({g._count.members})</p>
                      <Button variant="ghost" size="sm" className="h-6 text-xs"
                        onClick={() => setAddStudentGroupId(addStudentGroupId === g.id ? null : g.id)}>
                        <UserPlus size={12} className="mr-1" /> Add
                      </Button>
                    </div>

                    <AnimatePresence>
                      {addStudentGroupId === g.id && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-3">
                          <Input placeholder="Search students (min 2 chars)..." size={1}
                            value={addStudentSearch} onChange={(e) => setAddStudentSearch(e.target.value)}
                            className="text-xs h-8 mb-2" />
                          {addStudentResults.length > 0 && (
                            <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-2">
                              {addStudentResults.filter(r => !g.members.some(m => m.user.id === r.id)).map((r) => (
                                <div key={r.id} className="flex items-center justify-between py-1 px-2 hover:bg-slate-50 rounded">
                                  <span className="text-xs">{r.name || r.email}</span>
                                  <Button variant="ghost" size="sm" className="h-6 text-xs text-emerald-600"
                                    onClick={() => { handleAddStudent(g.id, r.id); setAddStudentSearch(''); setAddStudentGroupId(null); }}>
                                    <UserPlus size={12} className="mr-1" /> Add
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {g.members.map((member) => (
                      <div key={member.user.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 group">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.user.image || undefined} alt={member.user.name || 'Member'} />
                          <AvatarFallback className="bg-slate-400 text-white text-[9px]">
                            {(member.user.name || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs flex-1 truncate">{member.user.name || member.user.email}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                          onClick={() => handleRemoveStudent(g.id, member.user.id)}>
                          <UserMinus size={12} />
                        </Button>
                      </div>
                    ))}
                    {g.members.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No members yet</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
            {groups.length === 0 && <p className="text-center text-slate-500 py-8">No groups yet. Create your first group!</p>}
          </div>
        </div>
      )}

      {/* ========== ASSIGNMENTS TAB ========== */}
      {tab === 'assignments' && (
        <div className="space-y-4">
          {viewSubmissionsFor ? (
            // Submissions view
            <div>
              <Button variant="ghost" size="sm" onClick={() => { setViewSubmissionsFor(null); setSubmissions([]); }} className="mb-4">
                <ArrowLeft size={14} className="mr-1" /> Back to assignments
              </Button>
              {submissionsAssignment && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{submissionsAssignment.title}</h3>
                  <p className="text-xs text-slate-500">Max score: {submissionsAssignment.maxScore} pts</p>
                </div>
              )}
              {submissionsLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-emerald-600" /></div>
              ) : (
                <div className="space-y-2">
                  {submissions.map((sub) => (
                    <Card key={sub.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={sub.user.image || undefined} alt={sub.user.name || 'Student'} />
                            <AvatarFallback className="bg-emerald-600 text-white text-xs">
                              {(sub.user.name || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{sub.user.name || 'Unnamed'}</p>
                            <p className="text-xs text-slate-500">{sub.user.email}</p>
                            <p className="text-[10px] text-slate-400">Submitted {new Date(sub.submittedAt).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            {sub.score !== null ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-0">{sub.score} pts</Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 border-amber-200">Pending</Badge>
                            )}
                          </div>
                          {sub.score === null && (
                            <Button variant="outline" size="sm" className="shrink-0"
                              onClick={() => { setGradeSubmissionId(sub.id); setGradeScore(''); setGradeComment(''); }}>
                              <Star size={12} className="mr-1" /> Grade
                            </Button>
                          )}
                          {sub.comment && <p className="text-xs text-slate-500 mt-1 italic w-full">&quot;{sub.comment}&quot;</p>}
                        </div>

                        {/* Grade form */}
                        <AnimatePresence>
                          {gradeSubmissionId === sub.id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t space-y-2">
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="text-xs text-slate-500">Score (max {submissionsAssignment?.maxScore || 100})</label>
                                  <Input type="number" min={0} max={submissionsAssignment?.maxScore || 100}
                                    value={gradeScore} onChange={(e) => setGradeScore(e.target.value)}
                                    className="text-sm h-8" />
                                </div>
                                <div className="flex-1">
                                  <label className="text-xs text-slate-500">Comment (optional)</label>
                                  <Input value={gradeComment} onChange={(e) => setGradeComment(e.target.value)}
                                    className="text-sm h-8" placeholder="Feedback..." />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                                  onClick={handleGrade}>Save Grade</Button>
                                <Button variant="ghost" size="sm"
                                  onClick={() => setGradeSubmissionId(null)}>Cancel</Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  ))}
                  {submissions.length === 0 && <p className="text-center text-slate-500 py-8">No submissions yet</p>}
                </div>
              )}
            </div>
          ) : (
            // Assignments list
            <>
              <Button size="sm" onClick={() => setShowAssignmentForm(!showAssignmentForm)}>
                <Plus size={14} className="mr-1" /> {showAssignmentForm ? 'Cancel' : 'New Assignment'}
              </Button>

              <AnimatePresence>
                {showAssignmentForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Card className="border-emerald-200 mb-4">
                      <CardContent className="p-4 space-y-3">
                        <Input placeholder="Assignment title" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} />
                        <Textarea placeholder="Description (optional)" value={assignDesc} onChange={(e) => setAssignDesc(e.target.value)} rows={2} />
                        <select value={assignGroup} onChange={(e) => setAssignGroup(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
                          <option value="">All students (no group)</option>
                          {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g._count.members} students)</option>)}
                        </select>
                        <Input type="date" value={assignDue} onChange={(e) => setAssignDue(e.target.value)} />
                        <Button size="sm" onClick={handleCreateAssignment}>Create Assignment</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {assignments.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{a.title}</h4>
                            <Badge variant="outline" className="text-[10px]">{a.maxScore} pts</Badge>
                          </div>
                          {a.description && <p className="text-xs text-slate-500 mt-1">{a.description}</p>}
                          <div className="flex gap-3 mt-2 text-xs text-slate-500">
                            <span>{a.group?.name || 'All students'}</span>
                            {a.dueDate && <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="outline" size="sm" className="h-7 text-xs"
                            onClick={() => loadSubmissions(a.id)}>
                            <Eye size={12} className="mr-1" /> {a._count.submissions}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600"
                            onClick={() => handleDeleteAssignment(a.id)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {assignments.length === 0 && <p className="text-center text-slate-500 py-8">No assignments yet</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
