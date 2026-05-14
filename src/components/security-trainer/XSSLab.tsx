'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { xssTypes } from '@/lib/security-data';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/intlStub';
import {
  ChevronLeft,
  CheckCircle2,
  FileText,
} from 'lucide-react';

// Per-type defense rendering
const renderDefense = (xssId: string, attackDemo: string) => {
  switch (xssId) {
    case 'reflected':
    case 'stored': {
      const escaped = attackDemo
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      return (
        <div className="space-y-2">
          <p className="text-xs font-medium text-emerald-700">HTML-экранирование (output encoding)</p>
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-[11px] text-slate-500 mb-1">Результат после экранирования:</p>
            <code className="text-xs font-mono text-emerald-700 break-all">{escaped}</code>
            <p className="text-[11px] text-emerald-600 mt-2">Скрипт не выполнится — символы закодированы</p>
          </div>
        </div>
      );
    }
    case 'dom': {
      return (
        <div className="space-y-2">
          <p className="text-xs font-medium text-emerald-700">textContent вместо innerHTML</p>
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-[11px] text-slate-500 mb-1">Безопасный код:</p>
            <code className="text-xs font-mono text-emerald-700">element.textContent = userInput;</code>
            <p className="text-[11px] text-emerald-600 mt-2">Браузер вставляет текст как данные, а не HTML</p>
          </div>
        </div>
      );
    }
    case 'svg': {
      const escaped = attackDemo
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return (
        <div className="space-y-2">
          <p className="text-xs font-medium text-emerald-700">DOMPurify санитизация</p>
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-[11px] text-slate-500 mb-1">DOMPurify.sanitize() удаляет опасные теги:</p>
            <code className="text-xs font-mono text-emerald-700 break-all">{escaped}</code>
            <p className="text-[11px] text-emerald-600 mt-2">&lt;svg&gt; и события onload удалены</p>
          </div>
        </div>
      );
    }
    case 'event-handler': {
      const attrEscaped = attackDemo
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return (
        <div className="space-y-2">
          <p className="text-xs font-medium text-emerald-700">Экранирование атрибутов + CSP</p>
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-[11px] text-slate-500 mb-1">Атрибут после экранирования:</p>
            <code className="text-xs font-mono text-emerald-700 break-all">{attrEscaped}</code>
            <p className="text-[11px] text-emerald-600 mt-2">CSP запретит inline-события даже если экранирование пропущено</p>
          </div>
        </div>
      );
    }
    case 'data-uri': {
      return (
        <div className="space-y-2">
          <p className="text-xs font-medium text-emerald-700">Валидация протокола URL</p>
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-[11px] text-slate-500 mb-1">Проверка:</p>
            <code className="text-xs font-mono text-emerald-700">
              {`const allowed = ['https:', 'http:', 'mailto:'];\nconst parsed = new URL(url);\nallowed.includes(parsed.protocol) // false для javascript:`}
            </code>
            <p className="text-[11px] text-red-600 mt-2 font-medium">Ссылка заблокирована: протокол javascript: запрещён</p>
          </div>
        </div>
      );
    }
    case 'template-injection': {
      return (
        <div className="space-y-2">
          <p className="text-xs font-medium text-emerald-700">Безопасный шаблонизатор (auto-escape)</p>
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-[11px] text-slate-500 mb-1">Вместо &lt;%= %&gt; используйте &lt;%- %&gt; (escape по умолчанию):</p>
            <code className="text-xs font-mono text-emerald-700">{`<h1>Привет, <%- name %></h1>`}</code>
            <p className="text-[11px] text-emerald-600 mt-2">&lt;%- %&gt; автоматически экранирует HTML-символы</p>
          </div>
        </div>
      );
    }
    default: {
      const escaped = attackDemo
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return (
        <div className="bg-white rounded-lg p-3 border border-emerald-200">
          <code className="text-xs font-mono text-emerald-700 break-all">{escaped}</code>
        </div>
      );
    }
  }
};

export default function XSSLab() {
  const { xssCompletedLevels, addXssLevel, completeModule, setCurrentPage } = useAppStore();
  const t = useTranslations('xss');
  const [activeTab, setActiveTab] = useState(xssTypes[0].id);
  const [showAttack, setShowAttack] = useState(false);

  const allCompleted = xssCompletedLevels.length === xssTypes.length;

  // Complete module when all XSS levels completed
  useEffect(() => {
    if (allCompleted && xssCompletedLevels.length > 0) {
      completeModule('xss');
    }
  }, [allCompleted, xssCompletedLevels.length, completeModule]);

  const handleMarkComplete = (id: string) => {
    if (xssCompletedLevels.includes(id)) return;
    addXssLevel(id);
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
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              {t('progress', { completed: xssCompletedLevels.length, total: xssTypes.length })}
            </span>
            {allCompleted && <Badge className="bg-emerald-600 text-white">{t('moduleComplete')}</Badge>}
          </div>
          <div className="flex gap-2">
            {xssTypes.map((x) => (
              <button
                key={x.id}
                onClick={() => setActiveTab(x.id)}
                aria-label={`Перейти к типу XSS: ${t(`types.${x.id}` as const)}`}
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

      {/* Tabs for XSS types */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          {xssTypes.map((x) => (
            <TabsTrigger
              key={x.id}
              value={x.id}
              className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {t(`types.${x.id}` as const)}
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
                          <div className="bg-slate-50 rounded-lg p-3 border border-red-200">
                            <code className="text-xs font-mono text-red-600 break-all">
                              {xss.attackDemo}
                            </code>
                          </div>

                          <p className="text-xs text-slate-500">Результат вывода (без защиты):</p>
                          <div className="bg-white rounded-lg p-3 border border-red-200">
                            <p className="text-[11px] text-red-600 font-medium">⚠ Код выполнится — пользовательская вставка не обработана</p>
                          </div>

                          <p className="text-xs text-slate-500">Применённая защита:</p>
                          {renderDefense(xss.id, xss.attackDemo)}

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
              {!xssCompletedLevels.includes(xss.id) && (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleMarkComplete(xss.id)}
                >
                  {t('markComplete')}
                </Button>
              )}
              {xssCompletedLevels.includes(xss.id) && (
                <div className="text-center text-sm text-emerald-600 font-medium flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> {t('markComplete')}
                </div>
              )}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}