'use client';

import { useAppStore } from '@/lib/store';
import Sidebar from '@/components/security-trainer/Sidebar';
import Dashboard from '@/components/security-trainer/Dashboard';
import OWASPTop10 from '@/components/security-trainer/OWASPTop10';
import SQLInjectionLab from '@/components/security-trainer/SQLInjectionLab';
import XSSLab from '@/components/security-trainer/XSSLab';
import CSRFLab from '@/components/security-trainer/CSRFLab';
import AuthSecurityLab from '@/components/security-trainer/AuthSecurityLab';
import SecureCodingLab from '@/components/security-trainer/SecureCodingLab';
import ToolsLab from '@/components/security-trainer/ToolsLab';
import QuizSystem from '@/components/security-trainer/QuizSystem';
import AchievementsGlossary from '@/components/security-trainer/AchievementsGlossary';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';

const pages: Record<string, React.ReactNode> = {
  dashboard: <Dashboard />,
  owasp: <OWASPTop10 />,
  'sql-injection': <SQLInjectionLab />,
  xss: <XSSLab />,
  csrf: <CSRFLab />,
  auth: <AuthSecurityLab />,
  'secure-coding': <SecureCodingLab />,
  tools: <ToolsLab />,
  quiz: <QuizSystem />,
  achievements: <AchievementsGlossary />,
};

export default function Home() {
  const { currentPage } = useAppStore();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {pages[currentPage] || <Dashboard />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
