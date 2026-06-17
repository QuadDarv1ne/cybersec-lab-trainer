import {
  Shield,
  Database,
  FileText,
  Link,
  Lock,
  Code,
  KeyRound,
  ShieldAlert,
  Globe,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export const MODULE_ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Database,
  FileText,
  Link,
  Lock,
  Code,
  KeyRound,
  ShieldAlert,
  Globe,
  Workflow,
};

export function getModuleIcon(name: string, size = 24): React.ReactNode {
  const Icon = MODULE_ICON_MAP[name];
  if (!Icon) return <Shield size={size} />;
  return <Icon size={size} />;
}

export const MODULE_GRADIENTS: Record<string, string> = {
  'owasp': 'from-emerald-500 to-teal-500',
  'sql-injection': 'from-blue-500 to-indigo-500',
  'xss': 'from-orange-500 to-red-500',
  'csrf': 'from-purple-500 to-violet-500',
  'auth': 'from-amber-500 to-yellow-500',
  'secure-coding': 'from-cyan-500 to-blue-500',
  'tools': 'from-slate-500 to-gray-500',
  'security-headers': 'from-rose-500 to-pink-500',
  'ctf-labs': 'from-lime-500 to-green-500',
  'advanced-ctf': 'from-red-500 to-rose-500',
  'real-app-simulation': 'from-sky-500 to-cyan-500',
  'devsecops-simulation': 'from-violet-500 to-purple-500',
};

export const MODULE_PATTERNS: Record<string, string> = {
  'owasp': 'radial-gradient(circle at 20% 50%, oklch(0.65 0.16 160 / 0.1), transparent 70%)',
  'sql-injection': 'radial-gradient(circle at 80% 20%, oklch(0.56 0.14 240 / 0.1), transparent 70%)',
  'xss': 'radial-gradient(circle at 50% 80%, oklch(0.60 0.18 30 / 0.1), transparent 70%)',
  'csrf': 'radial-gradient(circle at 30% 30%, oklch(0.56 0.14 280 / 0.1), transparent 70%)',
  'auth': 'radial-gradient(circle at 70% 60%, oklch(0.65 0.16 80 / 0.1), transparent 70%)',
  'secure-coding': 'radial-gradient(circle at 40% 70%, oklch(0.56 0.14 200 / 0.1), transparent 70%)',
  'tools': 'radial-gradient(circle at 60% 40%, oklch(0.56 0.02 200 / 0.1), transparent 70%)',
  'security-headers': 'radial-gradient(circle at 20% 80%, oklch(0.60 0.18 350 / 0.1), transparent 70%)',
  'ctf-labs': 'radial-gradient(circle at 50% 50%, oklch(0.60 0.16 140 / 0.1), transparent 70%)',
  'advanced-ctf': 'radial-gradient(circle at 70% 30%, oklch(0.60 0.18 360 / 0.1), transparent 70%)',
  'real-app-simulation': 'radial-gradient(circle at 30% 60%, oklch(0.60 0.14 190 / 0.1), transparent 70%)',
  'devsecops-simulation': 'radial-gradient(circle at 50% 20%, oklch(0.56 0.14 280 / 0.1), transparent 70%)',
};

export const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  'first-steps': <FileText size={16} />,
  'sql-master': <Database size={16} />,
  'xss-hunter': <Code size={16} />,
  'security-guard': <Shield size={16} />,
  'auth-expert': <Link size={16} />,
  'code-reviewer': <Code size={16} />,
  'quiz-master': <Shield size={16} />,
  'quiz-perfect': <Shield size={16} />,
  'crypto-ninja': <Lock size={16} />,
  'full-completion': <Shield size={16} />,
  'headers-master': <ShieldAlert size={16} />,
  'owasp-challenger': <ShieldAlert size={16} />,
  'auth-challenger': <KeyRound size={16} />,
  'quiz-streak': <Shield size={16} />,
  'all-categories': <Shield size={16} />,
  'first-challenge': <Shield size={16} />,
  'perfect-challenges': <Shield size={16} />,
};
