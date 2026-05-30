/* eslint-disable no-console */
import { db } from '../src/lib/db'

async function seed() {
  const labs = [
    {
      number: 1,
      title: 'Сбор информации (OSINT)',
      description: 'Исследование действий по сбору информации о целевой системе. Получение навыков работы с OSINT-инструментами.',
      goal: 'Научиться собирать информацию о доменах, поддоменах, IP-адресах и открытых портах.',
      tools: 'Spiderfoot, Maltego, Nmap',
      difficulty: 'easy',
      category: 'reconnaissance',
      order: 1,
      flags: {
        create: [
          { flagKey: 'subdomain', flagValue: 'CYBER{sp1d3rf00t_0s1nt}', points: 15, hint: 'Используйте Spiderfoot для сканирования домена' },
          { flagKey: 'open_port', flagValue: 'CYBER{nmap_p0rt_sc4n}', points: 10, hint: 'Запустите Nmap для поиска открытых портов' },
          { flagKey: 'graph', flagValue: 'CYBER{malt3g0_gr4ph}', points: 15, hint: 'Постройте граф связей в Maltego' },
        ]
      }
    },
    {
      number: 2,
      title: 'Тестирование на проникновение',
      description: 'Изучение эксплуатирования уязвимостей в удалённой системе с помощью Metasploit.',
      goal: 'Научиться использовать Metasploit Framework для поиска и эксплуатации уязвимостей.',
      tools: 'Metasploit, Nmap, Exploit-DB',
      difficulty: 'medium',
      category: 'exploitation',
      order: 2,
      flags: {
        create: [
          { flagKey: 'port_scan', flagValue: 'CYBER{nmap_r3c0nn}', points: 10, hint: 'Сканируйте цель с помощью Nmap' },
          { flagKey: 'exploit', flagValue: 'CYBER{m3t4spl01t_r00t}', points: 20, hint: 'Найдите подходящий эксплоит в Metasploit' },
          { flagKey: 'session', flagValue: 'CYBER{s3ss10n_3st4bl1sh3d}', points: 20, hint: 'Установите сессию с целевой машиной' },
        ]
      }
    },
    {
      number: 3,
      title: 'Защита от SQL-инъекций',
      description: 'Изучение способов проведения атак SQL-инъекций и методов их предотвращения.',
      goal: 'Освоить методы SQL-инъекций и научиться защищать приложения.',
      tools: 'Веб-форма, MySQL, ручные SQL-запросы',
      difficulty: 'medium',
      category: 'web_security',
      order: 3,
      flags: {
        create: [
          { flagKey: 'bypass_login', flagValue: 'CYBER{sql_byp4ss_l0g1n}', points: 10, hint: 'Используйте OR 1=1 для обхода аутентификации' },
          { flagKey: 'user_data', flagValue: 'CYBER{sql_us3r_d4t4}', points: 15, hint: 'Извлеките данные пользователя через UPDATE + SELECT' },
          { flagKey: 'admin_pass', flagValue: 'CYBER{sql_4dm1n_p4ss}', points: 20, hint: 'Получите пароль администратора' },
          { flagKey: 'new_admin', flagValue: 'CYBER{sql_n3w_4dm1n}', points: 15, hint: 'Создайте нового пользователя с ролью admin' },
        ]
      }
    },
    {
      number: 4,
      title: 'Аудит веб-ресурсов',
      description: 'Поиск уязвимостей в веб-ресурсах путём сканирования и анализа логики работы.',
      goal: 'Научиться проводить аудит безопасности веб-приложений.',
      tools: 'OWASP ZAP, Spiderfoot, Probely',
      difficulty: 'medium',
      category: 'web_security',
      order: 4,
      flags: {
        create: [
          { flagKey: 'pii_leak', flagValue: 'CYBER{z4p_p11_l34k}', points: 15, hint: 'Запустите автоматическое сканирование в ZAP' },
          { flagKey: 'js_vuln', flagValue: 'CYBER{0ld_js_l1b}', points: 15, hint: 'Проверьте версию JS-библиотеки в DevTools' },
          { flagKey: 'sql_inject', flagValue: 'CYBER{w3b_sql1}', points: 10, hint: 'Попробуйте SQL-инъекцию в URL-параметре' },
        ]
      }
    },
    {
      number: 5,
      title: 'ARP/DNS Spoofing',
      description: 'Практические навыки реализации ARP-spoofing, DNS-spoofing и методов обнаружения.',
      goal: 'Освоить проведение ARP и DNS спуфинг-атак и методы защиты.',
      tools: 'Bettercap, Wireshark, OpenWRT',
      difficulty: 'hard',
      category: 'network_attacks',
      order: 5,
      flags: {
        create: [
          { flagKey: 'arp_spoof', flagValue: 'CYBER{4rp_sp00f1ng}', points: 15, hint: 'Запустите ARP-spoofing через bettercap' },
          { flagKey: 'sniff_creds', flagValue: 'CYBER{sn1ff_cr3ds}', points: 20, hint: 'Перехватите HTTP-трафик' },
          { flagKey: 'dns_spoof', flagValue: 'CYBER{dns_sp00f1ng}', points: 15, hint: 'Настройте DNS-spoofing' },
        ]
      }
    },
  ]

  for (const lab of labs) {
    const { flags, ...labData } = lab
    const existing = await db.lab.findUnique({ where: { number: labData.number } })
    if (existing) {
      console.log(`Lab ${labData.number} already exists, skipping...`)
      continue
    }
    await db.lab.create({
      data: {
        ...labData,
        flags: {
          create: flags.create,
        }
      }
    })
    console.log(`Created lab ${labData.number}: ${labData.title}`)
  }

  console.log('Lab seed completed!')
}

seed().catch(console.error)
