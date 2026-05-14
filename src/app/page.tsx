'use client';

import { useAppStore } from '@/lib/store';
import { useHashRouting } from '@/hooks/use-hash-routing';
import Sidebar from '@/components/security-trainer/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/components/security-trainer/Dashboard'), { ssr: false });
const OWASPTop10 = dynamic(() => import('@/components/security-trainer/OWASPTop10'), { ssr: false });
const SQLInjectionLab = dynamic(() => import('@/components/security-trainer/SQLInjectionLab'), { ssr: false });
const XSSLab = dynamic(() => import('@/components/security-trainer/XSSLab'), { ssr: false });
const CSRFLab = dynamic(() => import('@/components/security-trainer/CSRFLab'), { ssr: false });
const AuthSecurityLab = dynamic(() => import('@/components/security-trainer/AuthSecurityLab'), { ssr: false });
const SecureCodingLab = dynamic(() => import('@/components/security-trainer/SecureCodingLab'), { ssr: false });
const ToolsLab = dynamic(() => import('@/components/security-trainer/ToolsLab'), { ssr: false });
const QuizSystem = dynamic(() => import('@/components/security-trainer/QuizSystem'), { ssr: false });
const AchievementsGlossary = dynamic(() => import('@/components/security-trainer/AchievementsGlossary'), { ssr: false });
const SecurityHeadersLab = dynamic(() => import('@/components/security-trainer/SecurityHeadersLab'), { ssr: false });

const pages: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  'sql-injection': SQLInjectionLab,
  xss: XSSLab,
  csrf: CSRFLab,
  auth: AuthSecurityLab,
  'secure-coding': SecureCodingLab,
  tools: ToolsLab,
  'security-headers': SecurityHeadersLab,
  quiz: QuizSystem,
  achievements: AchievementsGlossary,
  owasp: OWASPTop10,
};

export default function Home() {
  const { currentPage } = useAppStore();
  useHashRouting();

  const Page = pages[currentPage] || Dashboard;

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
              <Page />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
