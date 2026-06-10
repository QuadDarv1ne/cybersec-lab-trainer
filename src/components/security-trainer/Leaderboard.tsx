'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Loader2, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { useTranslations } from '@/lib/intlStub';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

type LeaderboardEntry = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  totalXP: number;
  level: number;
  completedModules: number;
};

export default function Leaderboard() {
  const t = useTranslations('leaderboard');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'weekly'>('all');
  const currentUserId = useAppStore((s) => s.userId);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`/api?action=leaderboard&timeframe=${timeframe}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json().catch(() => { throw new Error('Invalid JSON response from server'); });
        if (!controller.signal.aborted && data.leaderboard) setEntries(data.leaderboard);
      } catch (err) {
        if (controller.signal.aborted) return;
        toast.error(t('loadError'));
        logger.error('Leaderboard fetch failed:', err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [timeframe, t]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="text-amber-500" />;
    if (rank === 2) return <Medal size={20} className="text-slate-400" />;
    if (rank === 3) return <Medal size={20} className="text-orange-600" />;
    return <span className="text-sm font-mono text-slate-400 w-5 text-center">#{rank}</span>;
  };

  const getLevelColor = (level: number) => {
    if (level >= 40) return 'text-purple-600';
    if (level >= 25) return 'text-emerald-600';
    if (level >= 10) return 'text-blue-600';
    return 'text-slate-600';
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="text-amber-500" /> {t('title')}
          </h1>
          <p className="text-slate-500 text-sm">{t('subtitle')}</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <Badge
            variant={timeframe === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setTimeframe('all')}
          >
            {t('allTime')}
          </Badge>
          <Badge
            variant={timeframe === 'weekly' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setTimeframe('weekly')}
          >
            {t('thisWeek')}
          </Badge>
        </div>
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="flex items-end justify-center gap-4 pb-4">
          {/* 2nd */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-1 ring-2 ring-slate-300">
              <Avatar className="w-14 h-14">
                <AvatarImage src={entries[1].image || undefined} alt={entries[1].name || '2nd place'} />
                <AvatarFallback className="bg-slate-300 text-white">
                  {(entries[1].name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-xs font-medium mt-1 truncate max-w-[80px]">{entries[1].name || 'User'}</p>
            <p className="text-[10px] text-slate-500">{entries[1].totalXP} XP</p>
            <Medal size={16} className="text-slate-400 mx-auto mt-1" />
          </div>

          {/* 1st */}
          <div className="text-center -mt-4">
            <Crown size={24} className="text-amber-500 mx-auto mb-1" />
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-1 ring-2 ring-amber-400">
              <Avatar className="w-18 h-18">
                <AvatarImage src={entries[0].image || undefined} alt={entries[0].name || '1st place'} />
                <AvatarFallback className="bg-amber-400 text-white text-lg">
                  {(entries[0].name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-sm font-bold mt-1 truncate max-w-[100px]">{entries[0].name || 'User'}</p>
            <p className="text-xs text-amber-600 font-semibold">{entries[0].totalXP} XP</p>
            <p className="text-[10px] text-slate-400">{t('level', { level: entries[0].level })}</p>
          </div>

          {/* 3rd */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-1 ring-2 ring-orange-300">
              <Avatar className="w-14 h-14">
                <AvatarImage src={entries[2].image || undefined} alt={entries[2].name || '3rd place'} />
                <AvatarFallback className="bg-orange-300 text-white">
                  {(entries[2].name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-xs font-medium mt-1 truncate max-w-[80px]">{entries[2].name || 'User'}</p>
            <p className="text-[10px] text-slate-500">{entries[2].totalXP} XP</p>
            <Medal size={16} className="text-orange-600 mx-auto mt-1" />
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="space-y-1">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card className={`hover:shadow-sm transition-shadow ${entry.id === currentUserId ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : ''}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.image || undefined} alt={entry.name || 'User'} />
                  <AvatarFallback className="bg-emerald-600 text-white text-xs">
                    {(entry.name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{entry.name || 'Anonymous'}</p>
                    {entry.id === currentUserId && (
                      <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-600">{t('you')}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{t('modulesCompleted', { count: entry.completedModules })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{entry.totalXP} XP</p>
                  <p className={`text-xs ${getLevelColor(entry.level)}`}>{t('level', { level: entry.level })}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-slate-500 py-8">{t('noData')}</p>
        )}
      </div>
    </div>
  );
}