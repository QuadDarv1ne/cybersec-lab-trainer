// CTF Labs Data — client-side lab definitions (flag values stored server-side only)

export interface CTFLab {
  id: string;
  number: number;
  title: string;
  description: string;
  goal: string;
  tools: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  flagCount: number;
  totalPoints: number;
}

export const ctfLabs: CTFLab[] = [
  {
    id: 'lab-1',
    number: 1,
    title: 'Сбор информации (OSINT)',
    description: 'Исследование действий по сбору информации о целевой системе. Получение навыков работы с OSINT-инструментами.',
    goal: 'Научиться собирать информацию о доменах, поддоменах, IP-адресах и открытых портах.',
    tools: 'Spiderfoot, Maltego, Nmap',
    difficulty: 'easy',
    category: 'reconnaissance',
    flagCount: 3,
    totalPoints: 40,
  },
  {
    id: 'lab-2',
    number: 2,
    title: 'Тестирование на проникновение',
    description: 'Изучение эксплуатирования уязвимостей в удалённой системе с помощью Metasploit.',
    goal: 'Научиться использовать Metasploit Framework для поиска и эксплуатации уязвимостей.',
    tools: 'Metasploit, Nmap, Exploit-DB',
    difficulty: 'medium',
    category: 'exploitation',
    flagCount: 3,
    totalPoints: 50,
  },
  {
    id: 'lab-3',
    number: 3,
    title: 'Защита от SQL-инъекций',
    description: 'Изучение способов проведения атак SQL-инъекций и методов их предотвращения.',
    goal: 'Освоить методы SQL-инъекций и научиться защищать приложения.',
    tools: 'Веб-форма, MySQL, ручные SQL-запросы',
    difficulty: 'medium',
    category: 'web_security',
    flagCount: 4,
    totalPoints: 60,
  },
  {
    id: 'lab-4',
    number: 4,
    title: 'Аудит веб-ресурсов',
    description: 'Поиск уязвимостей в веб-ресурсах путём сканирования и анализа логики работы.',
    goal: 'Научиться проводить аудит безопасности веб-приложений.',
    tools: 'OWASP ZAP, Spiderfoot, Probely',
    difficulty: 'medium',
    category: 'web_security',
    flagCount: 3,
    totalPoints: 40,
  },
  {
    id: 'lab-5',
    number: 5,
    title: 'ARP/DNS Spoofing',
    description: 'Практические навыки реализации ARP-spoofing, DNS-spoofing и методов обнаружения.',
    goal: 'Освоить проведение ARP и DNS спуфинг-атак и методы защиты.',
    tools: 'Bettercap, Wireshark, OpenWRT',
    difficulty: 'hard',
    category: 'network_attacks',
    flagCount: 3,
    totalPoints: 50,
  },
];

export const DIFFICULTY_META: Record<string, { label: string; color: string; stars: number }> = {
  easy: { label: 'Лёгкий', color: 'text-emerald-500', stars: 1 },
  medium: { label: 'Средний', color: 'text-amber-500', stars: 2 },
  hard: { label: 'Сложный', color: 'text-red-500', stars: 3 },
};

export const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  reconnaissance: { label: 'Разведка', icon: 'Search' },
  exploitation: { label: 'Эксплуатация', icon: 'Target' },
  web_security: { label: 'Веб-безопасность', icon: 'Globe' },
  network_attacks: { label: 'Сетевые атаки', icon: 'Wifi' },
};
