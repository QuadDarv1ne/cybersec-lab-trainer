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
function ArticleReader({ article, onBack, onSelectArticle }: { article: BlogArticle; onBack: () => void; onSelectArticle?: (article: BlogArticle) => void }) {
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
          {paragraphs.map((section) => (
            <div key={section.id} id={section.id} className="mb-6">
              <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
              {section.content && (
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-3">
                  {section.content}
                </p>
              )}
              {section.codeExample && (
                <div className="my-4">
                  <div className="bg-slate-800 text-slate-300 px-4 py-2 rounded-t-lg text-sm font-mono">
                    {section.codeExample.title}
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-b-lg overflow-x-auto text-sm">
                    <code>{section.codeExample.code}</code>
                  </pre>
                  {section.codeExample.caption && (
                    <p className="text-xs text-slate-500 mt-1 italic">{section.codeExample.caption}</p>
                  )}
                </div>
              )}
              {section.warning && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-3 my-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Важно:</strong> {section.warning}
                  </p>
                </div>
              )}
              {section.tip && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-400 p-3 my-3">
                  <p className="text-sm text-emerald-800 dark:text-emerald-200">
                    <strong>Совет:</strong> {section.tip}
                  </p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Related articles */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Другие статьи</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {blogArticles
            .filter((a) => a.slug !== article.slug)
            .slice(0, 2)
            .map((related) => (
              <ArticleCard key={related.slug} article={related} onClick={() => onSelectArticle?.(related)} />
            ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Blog Page
// ============================================================
export default function BlogPage({ onBack }: { onBack?: () => void }) {
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
              onSelectArticle={(a) => setSelectedArticle(a)}
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
                {onBack && (
                  <Button variant="outline" size="sm" onClick={onBack}>
                    <ChevronLeft size={16} /> {t('back')}
                  </Button>
                )}
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
                      key={article.slug}
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

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
