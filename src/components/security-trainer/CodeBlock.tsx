import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const HighlightedCode = dynamic(() => import('./HighlightedCode'), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-900 p-4 rounded-b-lg animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-slate-700 rounded w-1/2" />
    </div>
  ),
});

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({ code, language = 'javascript', title }: CodeBlockProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 my-3">
      {title && (
        <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          <span className="ml-2">{title}</span>
        </div>
      )}
      <Suspense fallback={null}>
        <HighlightedCode code={code} language={language} />
      </Suspense>
    </div>
  );
}
