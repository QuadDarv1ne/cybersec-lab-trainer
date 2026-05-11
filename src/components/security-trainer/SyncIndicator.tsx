'use client';

import { useAppStore } from '@/lib/store';
import { useSession } from '@/hooks/use-session';
import { Cloud, CloudOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SyncIndicator() {
  const { syncStatus, lastSyncedAt, userId } = useAppStore();
  const { isAuthenticated } = useSession();

  if (!isAuthenticated || !userId) return null;

  const icons = {
    idle: <CloudOff size={14} className="text-slate-500" />,
    syncing: <Cloud size={14} className="text-blue-400 animate-pulse" />,
    synced: <CheckCircle2 size={14} className="text-emerald-400" />,
    error: <AlertCircle size={14} className="text-red-400" />,
  };

  const labels = {
    idle: 'Offline',
    syncing: 'Syncing...',
    synced: lastSyncedAt ? `Synced ${formatTime(lastSyncedAt)}` : 'Synced',
    error: 'Sync failed',
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      {icons[syncStatus]}
      <span>{labels[syncStatus]}</span>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return date.toLocaleTimeString();
}
