'use client';

import { useAppStore } from '@/lib/store';
import { owaspTopics } from '@/lib/security-data';
import { useTranslations } from '@/lib/intlStub';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronLeft, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

export default function OWASPTop10() {
  const { studiedOwaspItems, addStudiedOwasp, completeModule, setCurrentPage } = useAppStore();
  const t = useTranslations('owasp');

  const studiedCount = studiedOwaspItems.length;
  const totalCount = owaspTopics.length;
  const allStudied = studiedCount === totalCount;

  const handleToggleStudied = (id: string) => {
    if (studiedOwaspItems.includes(id)) return;
    addStudiedOwasp(id);
    if (studiedOwaspItems.length + 1 === totalCount) {
      completeModule('owasp');
    }
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
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">
            {t('subtitle')}
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
                {t('studiedCount', { studied: studiedCount, total: totalCount })}
              </span>
            </div>
            <Badge variant={allStudied ? 'default' : 'secondary'} className={allStudied ? 'bg-emerald-600' : ''}>
              {allStudied ? t('moduleComplete') : `${Math.round((studiedCount / totalCount) * 100)}%`}
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
            {t('riskMatrix')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {owaspTopics.map((item) => (
              <div
                key={item.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white ${item.severityColor}`}
              >
                {item.code}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500" /> {t('severity.critical')}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500" /> {t('severity.high')}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500" /> {t('severity.medium')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Accordion type="multiple" className="space-y-3">
        {owaspTopics.map((item, index) => {
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
                          🌍 {t('realWorldExample')}
                        </h4>
                        <p className="text-xs text-amber-700 leading-relaxed">{item.realExample}</p>
                      </div>

                      {/* Vulnerable code */}
                      <div>
                        <h4 className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                          ❌ {t('vulnerableCode')}
                        </h4>
                        <CodeBlock code={item.vulnerableCode} language="javascript" title="vulnerable.js" />
                      </div>

                      {/* Secure code */}
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                          ✅ {t('secureCode')}
                        </h4>
                        <CodeBlock code={item.secureCode} language="javascript" title="secure.js" />
                      </div>

                      {/* Mitigations */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2">
                          🛡️ {t('mitigations')}
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
                        <span className="text-xs text-slate-500">{t('markAsStudied')}</span>
                        <div className="flex items-center gap-2">
                          {isStudied && (
                            <span className="text-xs text-emerald-600 font-medium">{t('studied')}</span>
                          )}
                          <Button
                            size="sm"
                            variant={isStudied ? 'outline' : 'default'}
                            className={isStudied ? '' : 'bg-emerald-600 hover:bg-emerald-700'}
                            onClick={() => handleToggleStudied(item.id)}
                            disabled={isStudied}
                          >
                            {isStudied ? t('passed') : t('mark')}
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
