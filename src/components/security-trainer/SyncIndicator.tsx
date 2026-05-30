'use client';

import { useAppStore } from '@/lib/store';
import { useSession } from '@/hooks/use-session';
import { Cloud, CloudOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslations, type Translator } from '@/lib/intlStub';

export default function SyncIndicator() {
  const syncStatus = useAppStore((s) => s.syncStatus);
  const lastSyncedAt = useAppStore((s) => s.lastSyncedAt);
  const userId = useAppStore((s) => s.userId);
  const { isAuthenticated } = useSession();
  const t = useTranslations('sync');

  if (!isAuthenticated || !userId) return null;

  const icons = {
    idle: <CloudOff size={14} className="text-slate-500" />,
    syncing: <Cloud size={14} className="text-blue-400 animate-pulse" />,
    synced: <CheckCircle2 size={14} className="text-emerald-400" />,
    error: <AlertCircle size={14} className="text-red-400" />,
  };

  const labels = {
    idle: t('idle'),
    syncing: t('syncing'),
    synced: lastSyncedAt ? `${t('synced')} ${formatTime(lastSyncedAt, t)}` : t('synced'),
    error: t('error'),
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      {icons[syncStatus]}
      <span>{labels[syncStatus]}</span>
    </div>
  );
}

function formatTime(timestamp: number, t: Translator): string {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);

  if (diff < 5) return t('justNow');
  if (diff < 60) return t('secondsAgo', { seconds: diff });
  if (diff < 3600) return t('minutesAgo', { minutes: Math.floor(diff / 60) });
  return new Date(timestamp).toLocaleTimeString();
}
