'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Shield, BookOpen, CheckCircle2, BarChart3, Search,
  UserCog, Trash2, ChevronRight, Loader2, GraduationCap,
  Activity, Clock, TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ROLE_LABELS, ROLE_BADGE_COLORS, type Role } from '@/lib/rbac-types';
import { toast } from 'sonner';

type UserData = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  totalUsers: number;
  studentsCount: number;
  teachersCount: number;
  totalModulesProgress: number;
  totalQuizResults: number;
  totalLabsStarted: number;
  recentUsers: number;
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<'stats' | 'users'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin?action=stats');
      const data = await res.json();
      if (data.stats) setStats(data.stats);
    } catch {
      toast.error('Failed to load stats');
    }
  }, []);

  const loadUsers = useCallback(async (s: string, r: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: 'users' });
      if (s) params.set('search', s);
      if (r) params.set('role', r);
      const res = await fetch(`/api/admin?${params}`);
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadUsers('', '');
  }, [loadStats, loadUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(search, roleFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, loadUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-role',
          payload: { userId, role: newRole },
        }),
      });
      if (res.ok) {
        toast.success('Role updated');
        loadUsers(search, roleFilter);
      }
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? All their data will be lost.')) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-user',
          payload: { userId },
        }),
      });
      if (res.ok) {
        toast.success('User deleted');
        loadUsers(search, roleFilter);
      }
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">System administration and user management</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <Button
            variant={tab === 'stats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab('stats')}
            className={tab === 'stats' ? 'bg-white shadow-sm' : ''}
          >
            <BarChart3 size={16} className="mr-1" /> Stats
          </Button>
          <Button
            variant={tab === 'users' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab('users')}
            className={tab === 'users' ? 'bg-white shadow-sm' : ''}
          >
            <Users size={16} className="mr-1" /> Users
          </Button>
        </div>
      </div>

      {tab === 'stats' && stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-emerald-800">{stats.totalUsers}</p>
                </div>
                <Users size={32} className="text-emerald-400" />
              </div>
              <div className="flex gap-3 mt-3 text-xs text-slate-500">
                <span>{stats.studentsCount} students</span>
                <span>{stats.teachersCount} teachers</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Recent Registrations</p>
                  <p className="text-3xl font-bold text-blue-800">{stats.recentUsers}</p>
                </div>
                <TrendingUp size={32} className="text-blue-400" />
              </div>
              <p className="text-xs text-slate-500 mt-3">In the last 7 days</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 font-medium">Activity</p>
                  <p className="text-3xl font-bold text-amber-800">{stats.totalModulesProgress}</p>
                </div>
                <Activity size={32} className="text-amber-400" />
              </div>
              <div className="flex gap-3 mt-3 text-xs text-slate-500">
                <span>{stats.totalQuizResults} quizzes</span>
                <span>{stats.totalLabsStarted} labs</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
            >
              <option value="">All roles</option>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="bg-emerald-600 text-white text-sm">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name || 'Unnamed'}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <p className="text-[10px] text-slate-400">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="px-2 py-1 rounded border border-slate-200 text-xs bg-white"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {users.length === 0 && (
                <p className="text-center text-slate-500 py-8">No users found</p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
