'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { owaspItems } from '@/lib/security-data';
import CodeBlock from './CodeBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronLeft, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

export default function OWASPTop10() {
  const { studiedOwaspItems, addStudiedOwasp, completeModule, setCurrentPage } = useAppStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const studiedCount = studiedOwaspItems.length;
  const totalCount = owaspItems.length;
  const allStudied = studiedCount === totalCount;

  const handleToggleStudied = (id: string) => {
    if (studiedOwaspItems.includes(id)) return;
    addStudiedOwasp(id);
    if (studiedOwaspItems.length + 1 === totalCount) {
      completeModule('owasp');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
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
          <Shield size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">OWASP Top 10 (2021)</h1>
          <p className="text-xs text-slate-500">
            10 критических угроз безопасности веб-приложений
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {allStudied ? (
                <CheckCircle2 size={18} className="text-emerald-500" />
              ) : (
                <AlertTriangle size={18} className="text-amber-500" />
              )}
              <span className="text-sm font-medium">
                Изучено: {studiedCount} из {totalCount}
              </span>
            </div>
            <Badge variant={allStudied ? 'default' : 'secondary'} className={allStudied ? 'bg-emerald-600' : ''}>
              {allStudied ? 'Модуль завершён!' : `${Math.round((studiedCount / totalCount) * 100)}%`}
            </Badge>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(studiedCount / totalCount) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Matrix Visual */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-red-50">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-red-500" />
            Матрица рисков
          </h3>
          <div className="flex flex-wrap gap-2">
            {owaspItems.map((item) => (
              <div
                key={item.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white ${item.severityColor} cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => toggleExpand(item.id)}
              >
                {item.code}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500" /> Критический</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500" /> Высокий</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500" /> Средний</span>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Accordion type="multiple" className="space-y-3">
        {owaspItems.map((item, index) => {
          const isStudied = studiedOwaspItems.includes(item.id);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-slate-200 overflow-hidden">
                <AccordionItem value={item.id} className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 text-left flex-1 mr-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.severityColor} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {item.code}
                          </Badge>
                          <Badge className={`text-[10px] text-white ${item.severityColor} border-0`}>
                            {item.severity}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-medium mt-1 truncate">{item.title}</h3>
                      </div>
                      {isStudied && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>

                      {/* Real-world example */}
                      <div className="bg-amber-50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-amber-800 mb-1">
                          🌍 Реальный пример
                        </h4>
                        <p className="text-xs text-amber-700 leading-relaxed">{item.realExample}</p>
                      </div>

                      {/* Vulnerable code */}
                      <div>
                        <h4 className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                          ❌ Уязвимый код
                        </h4>
                        <CodeBlock code={item.vulnerableCode} language="javascript" title="vulnerable.js" />
                      </div>

                      {/* Secure code */}
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                          ✅ Безопасный код
                        </h4>
                        <CodeBlock code={item.secureCode} language="javascript" title="secure.js" />
                      </div>

                      {/* Mitigations */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2">
                          🛡️ Способы защиты
                        </h4>
                        <ul className="space-y-1.5">
                          {item.mitigations.map((m, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      {/* Mark as studied */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Отметить как изученное</span>
                        <div className="flex items-center gap-2">
                          {isStudied && (
                            <span className="text-xs text-emerald-600 font-medium">Изучено!</span>
                          )}
                          <Button
                            size="sm"
                            variant={isStudied ? 'outline' : 'default'}
                            className={isStudied ? '' : 'bg-emerald-600 hover:bg-emerald-700'}
                            onClick={() => handleToggleStudied(item.id)}
                            disabled={isStudied}
                          >
                            {isStudied ? 'Пройдено' : 'Отметить'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            </motion.div>
          );
        })}
      </Accordion>
    </div>
  );
}
