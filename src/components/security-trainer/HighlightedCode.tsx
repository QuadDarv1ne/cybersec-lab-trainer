import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface HighlightedCodeProps {
  code: string;
  language: string;
}

export default function HighlightedCode({ code, language }: HighlightedCodeProps) {
  return (
    <SyntaxHighlighter language={language} style={oneDark} customStyle={{ margin: 0, fontSize: '0.85rem' }}>
      {code}
    </SyntaxHighlighter>
  );
}
