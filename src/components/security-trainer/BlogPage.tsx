'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/lib/intlStub';
import { blogArticles, blogCategories, searchArticles } from '@/lib/data/blog-data';
import type { BlogArticle } from '@/lib/data/blog-data';
import {
  ChevronLeft,
  Search,
  Clock,
  Calendar,
  BookOpen,
  ArrowRight,
  X,
  Tag,
  Shield,
  Database,
  FileText,
  Link,
  Lock,
  ShieldAlert,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Shield, Database, FileText, Link, Lock, ShieldAlert,
};

// ============================================================
// Blog Article Card
// ============================================================
function ArticleCard({ article, onClick }: { article: BlogArticle; onClick: () => void }) {
  const IconComponent = ICON_MAP[article.coverIcon] ?? FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 border-slate-200 dark:border-slate-700 overflow-hidden group"
        onClick={onClick}
      >
        {/* Cover */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-6 text-center">
          <IconComponent size={32} className="w-10 h-10 text-emerald-600 mx-auto" />
        </div>

        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">{article.category}</Badge>
          </div>

          <h3 className="font-semibold text-lg mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
            {article.subtitle}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(article.date).toLocaleDateString('ru-RU')}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              {article.readTime} мин
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                <Tag size={8} className="mr-0.5" />{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Article Reader
// ============================================================
function ArticleReader({ article, onBack }: { article: BlogArticle; onBack: () => void }) {
  const IconComponent = ICON_MAP[article.coverIcon] ?? FileText;
  const paragraphs = article.sections ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto"
    >
      <Button variant="outline" size="sm" onClick={onBack} className="mb-6">
        <ChevronLeft size={16} /> Назад к статьям
      </Button>

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl p-8 mb-6 text-center">
        <IconComponent size={48} className="w-14 h-14 text-emerald-600 mx-auto" />
        <h1 className="text-2xl md:text-3xl font-bold mt-4 mb-2">{article.title}</h1>
        <p className="text-slate-600 dark:text-slate-400">{article.subtitle}</p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(article.date).toLocaleDateString('ru-RU')}</span>
          <span className="flex items-center gap-1"><Clock size={14} /> {article.readTime} мин чтения</span>
          <span className="flex items-center gap-1"><BookOpen size={14} /> {article.author}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {article.tags.map((tag) => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
      </div>

      {/* Content */}
      <Card className="border-slate-200 dark:border-slate-700 mb-6">
        <CardContent className="p-6 prose prose-slate dark:prose-invert max-w-none">
          {paragraphs.map((p, i) => {
            // Handle code blocks
            if (p.startsWith('```')) {
              const lines = p.split('\n');
              const code = lines.slice(1, -1).join('\n');
              return (
                <pre key={i} className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm my-4">
                  <code>{code}</code>
                </pre>
              );
            }

            // Handle headers
            if (p.startsWith('**') && p.endsWith('**')) {
              return (
                <h3 key={i} className="text-lg font-semibold mt-4 mb-2">
                  {p.replace(/\*\*/g, '')}
                </h3>
              );
            }

            // Handle bullet points
            if (p.includes('\n•') || p.startsWith('•')) {
              const items = p.split('\n').filter(Boolean);
              return (
                <ul key={i} className="list-disc pl-6 space-y-1 my-3">
                  {items.map((item, j) => {
                    const cleanItem = item.replace(/^•\s*/, '');
                    if (cleanItem.startsWith('**')) {
                      const [bold, ...rest] = cleanItem.split('**');
                      return (
                        <li key={j} className="text-sm">
                          <strong>{bold.replace(/\*\*/g, '')}</strong>{rest.join('**')}
                        </li>
                      );
                    }
                    return <li key={j} className="text-sm">{cleanItem}</li>;
                  })}
                </ul>
              );
            }

            // Handle checkmarks / cross marks
            if (p.startsWith('✅') || p.startsWith('❌')) {
              const emoji = p.charAt(0) + (p.charAt(1) === '\uFE0F' ? '\uFE0F' : '');
              const text = p.slice(emoji.length).trim();
              return (
                <p key={i} className="text-sm my-1">
                  <span className="mr-2">{emoji}</span>
                  {text.startsWith('**') ? (
                    <>
                      <strong>{text.split('**')[1]}</strong>
                      {text.split('**').slice(2).join('**')}
                    </>
                  ) : (
                    text
                  )}
                </p>
              );
            }

            // Regular paragraph
            if (p.trim()) {
              const parts = p.split(/(\*\*[^*]+\*\*)/g);
              return (
                <p key={i} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-3">
                  {parts.map((part, j) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={j}>{part.slice(2, -2)}</strong>
                      : part
                  )}
                </p>
              );
            }

            return null;
          })}
        </CardContent>
      </Card>

      {/* Related articles */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Другие статьи</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {blogArticles
            .filter((a) => a.id !== article.id)
            .slice(0, 2)
            .map((related) => (
              <ArticleCard key={related.id} article={related} onClick={() => {}} />
            ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Blog Page
// ============================================================
export default function BlogPage({ onBack }: { onBack: () => void }) {
  const t = useTranslations('blog');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);

  const filteredArticles = useMemo(() => {
    if (searchQuery.trim()) {
      return searchArticles(searchQuery, selectedCategory === 'Все' ? 'all' : selectedCategory);
    }
    if (selectedCategory !== 'Все') {
      return blogArticles.filter((a) => a.category === selectedCategory);
    }
    return blogArticles;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {selectedArticle ? (
            <ArticleReader
              key="reader"
              article={selectedArticle}
              onBack={() => setSelectedArticle(null)}
            />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="sm" onClick={onBack}>
                  <ChevronLeft size={16} /> {t('back')}
                </Button>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-emerald-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={selectedCategory === 'Все' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('Все')}
                  className={selectedCategory === 'Все' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  Все
                </Button>
                {blogCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.label ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.label)}
                    className={selectedCategory === cat.label ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>

              {/* Articles grid */}
              {filteredArticles.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onClick={() => setSelectedArticle(article)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">{t('noResults')}</p>
                  </CardContent>
                </Card>
              )}

              {/* Read more link */}
              {filteredArticles.length > 0 && (
                <div className="mt-8 text-center">
                  <Button variant="outline" className="gap-2">
                    {t('loadMore')} <ArrowRight size={14} />
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
