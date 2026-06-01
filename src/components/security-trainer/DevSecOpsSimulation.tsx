'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Code,
  Shield,
  Bug,
  FileCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Clock,
  Users,
  Server,
  Database,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Play,
  StopCircle,
  Filter,
  Search,
  BarChart3,
  Settings,
  Terminal,
  Cpu,
  Network,
  Cloud,
  Container,
  Workflow,
} from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'success' | 'failed' | 'warning';
  vulnerabilities: Vulnerability[];
  tools: string[];
  duration: number;
}

interface Vulnerability {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  fix: string;
  detected: boolean;
  fixed: boolean;
}

interface SecurityTool {
  id: string;
  name: string;
  type: 'SAST' | 'DAST' | 'SCA' | 'IAST' | 'Secret Scanning';
  description: string;
  findings: number;
  enabled: boolean;
}

export default function DevSecOpsSimulation() {
  const [activeStage, setActiveStage] = useState<string>('code-review');
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [securityScore, setSecurityScore] = useState(100);
  const [detectedVulns, setDetectedVulns] = useState<string[]>([]);
  const [fixedVulns, setFixedVulns] = useState<string[]>([]);
  const [toolsEnabled, setToolsEnabled] = useState<string[]>(['sast-1', 'sca-1', 'secret-1']);
  const [pipelineLog, setPipelineLog] = useState<string[]>([]);

  const securityTools: SecurityTool[] = [
    {
      id: 'sast-1',
      name: 'SonarQube',
      type: 'SAST',
      description: 'Статический анализ кода на уязвимости',
      findings: 12,
      enabled: true,
    },
    {
      id: 'sast-2',
      name: 'Semgrep',
      type: 'SAST',
      description: 'Поиск шаблонов уязвимостей',
      findings: 8,
      enabled: false,
    },
    {
      id: 'dast-1',
      name: 'OWASP ZAP',
      type: 'DAST',
      description: 'Динамическое тестирование приложения',
      findings: 5,
      enabled: false,
    },
    {
      id: 'sca-1',
      name: 'Snyk',
      type: 'SCA',
      description: 'Анализ зависимостей на уязвимости',
      findings: 15,
      enabled: true,
    },
    {
      id: 'secret-1',
      name: 'GitGuardian',
      type: 'Secret Scanning',
      description: 'Поиск секретов в коде',
      findings: 3,
      enabled: true,
    },
    {
      id: 'iast-1',
      name: 'Contrast Security',
      type: 'IAST',
      description: 'Инструментация приложения во время выполнения',
      findings: 7,
      enabled: false,
    },
  ];

  const pipelineStages: PipelineStage[] = [
    {
      id: 'code-review',
      name: 'Code Review',
      description: 'Ручной и автоматический ревью кода',
      icon: <Code className="h-5 w-5" />,
      status: 'pending',
      vulnerabilities: [
        {
          id: 'vuln-cr-1',
          name: 'SQL инъекция',
          severity: 'high',
          description: 'Конкатенация строк в SQL запросе',
          location: 'api/users.js:45',
          fix: 'Использовать параметризованные запросы',
          detected: false,
          fixed: false,
        },
        {
          id: 'vuln-cr-2',
          name: 'XSS через innerHTML',
          severity: 'medium',
          description: 'Использование innerHTML без санитизации',
          location: 'frontend/components/Review.js:23',
          fix: 'Заменить на textContent',
          detected: false,
          fixed: false,
        },
      ],
      tools: ['SonarQube', 'Semgrep'],
      duration: 120,
    },
    {
      id: 'build',
      name: 'Build & Dependencies',
      description: 'Сборка приложения и анализ зависимостей',
      icon: <Cpu className="h-5 w-5" />,
      status: 'pending',
      vulnerabilities: [
        {
          id: 'vuln-bd-1',
          name: 'Уязвимая зависимость',
          severity: 'critical',
          description: 'lodash 4.17.15 имеет прототипное загрязнение',
          location: 'package.json',
          fix: 'Обновить до lodash 4.17.21+',
          detected: false,
          fixed: false,
        },
        {
          id: 'vuln-bd-2',
          name: 'Устаревший пакет',
          severity: 'medium',
          description: 'express 4.16.0 имеет несколько уязвимостей',
          location: 'package.json',
          fix: 'Обновить до express 4.18.0+',
          detected: false,
          fixed: false,
        },
      ],
      tools: ['Snyk', 'npm audit'],
      duration: 180,
    },
    {
      id: 'test',
      name: 'Security Testing',
      description: 'Автоматическое тестирование безопасности',
      icon: <Bug className="h-5 w-5" />,
      status: 'pending',
      vulnerabilities: [
        {
          id: 'vuln-st-1',
          name: 'CSRF отсутствие токена',
          severity: 'high',
          description: 'Форма смены пароля не защищена CSRF',
          location: 'POST /api/change-password',
          fix: 'Добавить CSRF токены',
          detected: false,
          fixed: false,
        },
        {
          id: 'vuln-st-2',
          name: 'Информация об ошибках',
          severity: 'medium',
          description: 'Stack trace показывается в продакшене',
          location: 'middleware/errorHandler.js:12',
          fix: 'Скрывать детали ошибок',
          detected: false,
          fixed: false,
        },
      ],
      tools: ['OWASP ZAP', 'Jest security tests'],
      duration: 240,
    },
    {
      id: 'deploy',
      name: 'Deployment & Runtime',
      description: 'Развертывание и мониторинг безопасности',
      icon: <Cloud className="h-5 w-5" />,
      status: 'pending',
      vulnerabilities: [
        {
          id: 'vuln-dp-1',
          name: 'Секреты в коде',
          severity: 'critical',
          description: 'API ключ в исходном коде',
          location: 'config/database.js:8',
          fix: 'Использовать переменные окружения',
          detected: false,
          fixed: false,
        },
        {
          id: 'vuln-dp-2',
          name: 'Небезопасные заголовки',
          severity: 'low',
          description: 'Отсутствуют security headers',
          location: 'nginx.conf',
          fix: 'Добавить CSP, HSTS, X-Frame-Options',
          detected: false,
          fixed: false,
        },
      ],
      tools: ['GitGuardian', 'Contrast Security'],
      duration: 300,
    },
  ];

  const currentStage = pipelineStages.find(s => s.id === activeStage) || pipelineStages[0];

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setPipelineLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 15)]);
  };

  const toggleTool = (toolId: string) => {
    if (toolsEnabled.includes(toolId)) {
      setToolsEnabled(toolsEnabled.filter(id => id !== toolId));
      addToLog(`🔧 Отключен инструмент: ${securityTools.find(t => t.id === toolId)?.name}`);
    } else {
      setToolsEnabled([...toolsEnabled, toolId]);
      addToLog(`🔧 Включен инструмент: ${securityTools.find(t => t.id === toolId)?.name}`);
    }
  };

  const detectVulnerability = (vulnId: string) => {
    if (!detectedVulns.includes(vulnId)) {
      setDetectedVulns([...detectedVulns, vulnId]);
      
      const vuln = pipelineStages.flatMap(s => s.vulnerabilities).find(v => v.id === vulnId);
      if (vuln) {
        addToLog(`🔍 Обнаружена уязвимость: ${vuln.name} (${vuln.severity})`);
        
        // Уменьшаем security score в зависимости от severity
        let scoreReduction = 0;
        switch (vuln.severity) {
          case 'critical': scoreReduction = 15; break;
          case 'high': scoreReduction = 10; break;
          case 'medium': scoreReduction = 5; break;
          case 'low': scoreReduction = 2; break;
        }
        setSecurityScore(prev => Math.max(0, prev - scoreReduction));
      }
    }
  };

  const fixVulnerability = (vulnId: string) => {
    if (!fixedVulns.includes(vulnId) && detectedVulns.includes(vulnId)) {
      setFixedVulns([...fixedVulns, vulnId]);
      
      const vuln = pipelineStages.flatMap(s => s.vulnerabilities).find(v => v.id === vulnId);
      if (vuln) {
        addToLog(`✅ Исправлена уязвимость: ${vuln.name}`);
        
        // Восстанавливаем security score
        let scoreRecovery = 0;
        switch (vuln.severity) {
          case 'critical': scoreRecovery = 15; break;
          case 'high': scoreRecovery = 10; break;
          case 'medium': scoreRecovery = 5; break;
          case 'low': scoreRecovery = 2; break;
        }
        setSecurityScore(prev => Math.min(100, prev + scoreRecovery));
      }
    }
  };

  const runPipeline = async () => {
    if (pipelineRunning) return;
    
    setPipelineRunning(true);
    setPipelineProgress(0);
    addToLog('🚀 Запуск DevSecOps пайплайна...');
    
    // Симуляция выполнения пайплайна
    for (let i = 0; i < pipelineStages.length; i++) {
      const stage = pipelineStages[i];
      setActiveStage(stage.id);
      addToLog(`▶️ Выполняется этап: ${stage.name}`);
      
      // Симуляция выполнения этапа
      for (let progress = 0; progress <= 100; progress += 10) {
        setPipelineProgress(((i * 100) + progress) / pipelineStages.length);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Обнаружение уязвимостей на этом этапе
      stage.vulnerabilities.forEach(vuln => {
        if (Math.random() > 0.3) { // 70% шанс обнаружения
          detectVulnerability(vuln.id);
        }
      });
      
      addToLog(`✅ Этап завершен: ${stage.name}`);
    }
    
    addToLog('🎉 DevSecOps пайплайн завершен!');
    setPipelineRunning(false);
    setPipelineProgress(100);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalVulns = pipelineStages.flatMap(s => s.vulnerabilities).length;
  const detectedCount = detectedVulns.length;
  const fixedCount = fixedVulns.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Workflow className="h-8 w-8 text-purple-600 dark:text-purple-500" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              DevSecOps Симуляция
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Симуляция безопасного пайплайна разработки: от написания кода до развертывания в продакшене.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка: Пайплайн и этапы */}
          <div className="lg:col-span-2 space-y-6">
            {/* Пайплайн прогресс */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  DevSecOps Пайплайн
                </CardTitle>
                <CardDescription>
                  {pipelineRunning ? 'Пайплайн выполняется...' : 'Запустите пайплайн для анализа безопасности'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Прогресс бар */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Общий прогресс</div>
                    <div className="font-bold">{Math.round(pipelineProgress)}%</div>
                  </div>
                  <Progress value={pipelineProgress} className="h-3" />
                </div>

                {/* Этапы пайплайна */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pipelineStages.map(stage => (
                    <Card
                      key={stage.id}
                      className={`cursor-pointer transition-all ${
                        activeStage === stage.id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setActiveStage(stage.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            {stage.icon}
                          </div>
                          <Badge className={getStatusColor(
                            pipelineRunning && activeStage === stage.id ? 'running' : 'pending'
                          )}>
                            {pipelineRunning && activeStage === stage.id ? 'Выполняется' : 'Ожидание'}
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-1">{stage.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {stage.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{stage.vulnerabilities.length} уязвимостей</span>
                          <span>{stage.duration} сек</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Кнопки управления */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={runPipeline}
                    disabled={pipelineRunning}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Запустить пайплайн
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetectedVulns([]);
                      setFixedVulns([]);
                      setSecurityScore(100);
                      setPipelineLog([]);
                      addToLog('🔄 Пайплайн сброшен');
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Сбросить
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Текущий этап с уязвимостями */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentStage.icon}
                  {currentStage.name}
                </CardTitle>
                <CardDescription>{currentStage.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Инструменты безопасности:</span>
                    <div className="flex flex-wrap gap-1">
                      {currentStage.tools.map(tool => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Уязвимости этапа */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Уязвимости на этом этапе:
                    </h4>
                    {currentStage.vulnerabilities.map(vuln => (
                      <div
                        key={vuln.id}
                        className={`p-4 rounded-lg border ${
                          fixedVulns.includes(vuln.id)
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20'
                            : detectedVulns.includes(vuln.id)
                            ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{vuln.name}</h5>
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
                            {detectedVulns.includes(vuln.id) && (
                              <Eye className="h-4 w-4 text-blue-500" />
                            )}
                            {fixedVulns.includes(vuln.id) && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="font-medium text-slate-700 dark:text-slate-300">Расположение:</div>
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded block mt-1">
                              {vuln.location}
                            </code>
                          </div>
                          <div>
                            <div className="font-medium text-slate-700 dark:text-slate-300">Исправление:</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {vuln.fix}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => detectVulnerability(vuln.id)}
                            disabled={detectedVulns.includes(vuln.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Обнаружить
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fixVulnerability(vuln.id)}
                            disabled={!detectedVulns.includes(vuln.id) || fixedVulns.includes(vuln.id)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Исправить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка: Инструменты и статистика */}
          <div className="space-y-6">
            {/* Security Score */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Score
                </CardTitle>
                <CardDescription>Общая оценка безопасности проекта</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-5xl font-bold mb-2 ${
                    securityScore >= 80 ? 'text-green-600' :
                    securityScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {securityScore}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {securityScore >= 80 ? 'Отличная безопасность' :
                     securityScore >= 60 ? 'Требуются улучшения' :
                     'Критический уровень'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Обнаружено уязвимостей</span>
                    <span className="font-medium">{detectedCount}/{totalVulns}</span>
                  </div>
                  <Progress value={(detectedCount / totalVulns) * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Исправлено уязвимостей</span>
                    <span className="font-medium">{fixedCount}/{detectedCount || 1}</span>
                  </div>
                  <Progress value={(fixedCount / (detectedCount || 1)) * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Инструменты безопасности */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Инструменты безопасности
                </CardTitle>
                <CardDescription>Включите инструменты для улучшения обнаружения</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {securityTools.map(tool => (
                  <div
                    key={tool.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      toolsEnabled.includes(tool.id)
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-900/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium">{tool.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {tool.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {tool.description}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Найдено: {tool.findings} проблем
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={toolsEnabled.includes(tool.id) ? "default" : "outline"}
                      onClick={() => toggleTool(tool.id)}
                    >
                      {toolsEnabled.includes(tool.id) ? 'Включен' : 'Выключен'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Лог пайплайна */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Лог пайплайна
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-3 h-64 overflow-y-auto font-mono text-sm">
                  {pipelineLog.length > 0 ? (
                    pipelineLog.map((log, idx) => (
                      <div key={idx} className="text-slate-300 py-1 border-b border-slate-800 last:border-b-0">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">Лог пуст. Запустите пайплайн...</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Рекомендации */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Рекомендации
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {detectedCount > fixedCount && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      {detectedCount - fixedCount} уязвимостей требуют исправления
                    </AlertDescription>
                  </Alert>
                )}
                {toolsEnabled.length < securityTools.length && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      Включите больше инструментов для лучшего обнаружения
                    </AlertDescription>
                  </Alert>
                )}
                {securityScore < 80 && (
                  <Alert className="bg-orange-50 border-orange-200">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <AlertDescription>
                      Security score ниже 80. Улучшите безопасность проекта
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
              <CardTitle>Итоговый отчёт DevSecOps</CardTitle>
              <CardDescription>Результаты анализа безопасности</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">
                    {totalVulns}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Всего уязвимостей</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                    {detectedCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Обнаружено</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                    {fixedCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Исправлено</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                    {securityScore}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Security Score</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Распределение по severity:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['critical', 'high', 'medium', 'low'].map(severity => {
                    const count = pipelineStages
                      .flatMap(s => s.vulnerabilities)
                      .filter(v => v.severity === severity)
                      .length;
                    const detected = pipelineStages
                      .flatMap(s => s.vulnerabilities)
                      .filter(v => v.severity === severity && detectedVulns.includes(v.id))
                      .length;
                    const fixed = pipelineStages
                      .flatMap(s => s.vulnerabilities)
                      .filter(v => v.severity === severity && fixedVulns.includes(v.id))
                      .length;
                    
                    return (
                      <div key={severity} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(severity)}>
                            {severity === 'critical' ? 'Критич.' :
                             severity === 'high' ? 'Высокая' :
                             severity === 'medium' ? 'Средняя' : 'Низкая'}
                          </Badge>
                          <div className="font-medium">{count}</div>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Обнаружено: {detected}, Исправлено: {fixed}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}