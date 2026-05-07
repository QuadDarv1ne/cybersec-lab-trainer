'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { xssTypes } from '@/lib/security-data';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
} from 'lucide-react';

export default function XSSLab() {
  const { xssCompletedLevels, addXssLevel, completeModule, setCurrentPage } = useAppStore();
  const [activeTab, setActiveTab] = useState(xssTypes[0].id);
  const [sanitized, setSanitized] = useState(false);
  const [showAttack, setShowAttack] = useState(false);

  const currentXss = xssTypes.find((x) => x.id === activeTab) || xssTypes[0];
  const isCompleted = xssCompletedLevels.includes(currentXss.id);
  const allCompleted = xssCompletedLevels.length === xssTypes.length;

  const handleMarkComplete = (id: string) => {
    if (!xssCompletedLevels.includes(id)) {
      addXssLevel(id);
      if (xssCompletedLevels.length + 1 === xssTypes.length) {
        completeModule('xss');
      }
    }
  };

  const renderSimulatedPreview = () => {
    const attackCode = currentXss.attackDemo;
    if (sanitized) {
      const escaped = attackCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      return (
        <div className="bg-white rounded-lg p-4 border border-emerald-200">
          <p className="text-xs text-slate-500 mb-2">Безопасный вывод (текстовый режим):</p>
          <code className="text-xs bg-slate-100 px-2 py-1 rounded block font-mono break-all">
            {escaped}
          </code>
          <p className="text-xs text-emerald-600 mt-2">
            ✅ Код не выполнен — HTML-теги закодированы как текст
          </p>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-lg p-4 border border-red-200">
        <p className="text-xs text-slate-500 mb-2">Небезопасный вывод (innerHTML):</p>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-mono text-red-700 break-all">
            {attackCode}
          </p>
        </div>
        <p className="text-xs text-red-600 mt-2 font-medium">
          ⚠️ В реальном приложении этот скрипт БЫ ВЫПОЛНЕН в браузере жертвы!
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <FileText size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Лаборатория XSS-атак</h1>
          <p className="text-xs text-slate-500">Три типа Cross-Site Scripting уязвимостей</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              Изучено: {xssCompletedLevels.length}/{xssTypes.length}
            </span>
            {allCompleted && <Badge className="bg-emerald-600 text-white">Модуль завершён!</Badge>}
          </div>
          <div className="flex gap-2">
            {xssTypes.map((x) => (
              <button
                key={x.id}
                onClick={() => setActiveTab(x.id)}
                className={`flex-1 h-2 rounded-full transition-all ${
                  xssCompletedLevels.includes(x.id)
                    ? 'bg-emerald-500'
                    : x.id === activeTab
                      ? 'bg-emerald-300'
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sanitization toggle */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-500" />
                Переключатель санитизации
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Включите, чтобы увидеть разницу между безопасным и опасным выводом
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sanitize-toggle" className="text-xs">
                {sanitized ? 'Защищённый' : 'Уязвимый'}
              </Label>
              <Switch
                id="sanitize-toggle"
                checked={sanitized}
                onCheckedChange={setSanitized}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for XSS types */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          {xssTypes.map((x) => (
            <TabsTrigger
              key={x.id}
              value={x.id}
              className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {x.id === 'reflected' ? 'Отражённый' : x.id === 'stored' ? 'Хранимый' : 'DOM-based'}
              {xssCompletedLevels.includes(x.id) && (
                <CheckCircle2 size={12} className="ml-1" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {xssTypes.map((xss) => (
          <TabsContent key={xss.id} value={xss.id} className="space-y-4 mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Description */}
              <Card className="border-slate-200">
                <CardContent className="p-5">
                  <h2 className="font-semibold mb-2">{xss.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{xss.description}</p>
                  <div className="mt-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {xss.id === 'reflected'
                        ? 'Самый распространённый'
                        : xss.id === 'stored'
                          ? 'Самый опасный'
                          : 'Невидимый для сервера'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Vulnerable code */}
              <Card className="border-slate-200">
                <CardContent className="p-5">
                  <h3 className="text-xs font-semibold text-red-600 mb-2">❌ Уязвимый код</h3>
                  <CodeBlock code={xss.vulnerableCode} language="html" title="vulnerable.html" />
                </CardContent>
              </Card>

              {/* Secure code */}
              <Card className="border-slate-200">
                <CardContent className="p-5">
                  <h3 className="text-xs font-semibold text-emerald-600 mb-2">✅ Безопасный код</h3>
                  <CodeBlock code={xss.secureCode} language="html" title="secure.html" />
                </CardContent>
              </Card>

              {/* Interactive demo */}
              <Card className="border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">🎮 Интерактивная демонстрация</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAttack(!showAttack)}
                    >
                      {showAttack ? 'Скрыть демо' : 'Показать атаку'}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showAttack && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="space-y-3">
                          <p className="text-xs text-slate-500">Payload атаки:</p>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <code className="text-xs font-mono text-red-600 break-all">
                              {xss.attackDemo}
                            </code>
                          </div>

                          <p className="text-xs text-slate-500">Результат вывода:</p>
                          {renderSimulatedPreview()}

                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <h4 className="text-xs font-semibold text-blue-700 mb-1">💡 Защита</h4>
                            <p className="text-xs text-blue-600">{xss.mitigation}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Mark complete */}
              {!isCompleted && (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleMarkComplete(xss.id)}
                >
                  Отметить как изученное
                </Button>
              )}
              {isCompleted && (
                <div className="text-center text-sm text-emerald-600 font-medium flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Изучено!
                </div>
              )}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
