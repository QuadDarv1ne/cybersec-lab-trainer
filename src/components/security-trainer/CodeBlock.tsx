import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="group relative rounded-lg overflow-hidden border border-slate-700 my-3">
      <div className="bg-slate-800/90 px-4 py-2 text-xs font-mono text-slate-400 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
        <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
        <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
        <Code2 size={12} className="ml-2 text-slate-500" />
        <span className="text-slate-300">{title || language}</span>
        <button
          onClick={handleCopy}
          className="ml-auto p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
      <Suspense fallback={null}>
        <HighlightedCode code={code} language={language} />
      </Suspense>
    </div>
  );
}
