import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
      <SyntaxHighlighter language={language} style={oneDark} customStyle={{ margin: 0, fontSize: '0.85rem' }}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
