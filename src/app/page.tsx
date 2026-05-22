import type { Metadata } from 'next';
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
  title: 'CyberSec Lab — Тренажёр по информационной безопасности',
  description: 'Изучайте уязвимости на практике: SQL-инъекции, XSS, CSRF, OWASP Top 10 и безопасное кодирование в интерактивных лабораториях. 09.03.04 Программная инженерия.',
};

export default function Home() {
  return <LandingPage />;
}
