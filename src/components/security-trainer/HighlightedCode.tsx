import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface HighlightedCodeProps {
  code: string;
  language: string;
}

export default function HighlightedCode({ code, language }: HighlightedCodeProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  return (
    <SyntaxHighlighter
      language={language}
      style={isDark ? oneDark : oneLight}
      showLineNumbers
      wrapLines
      customStyle={{
        margin: 0,
        fontSize: '0.85rem',
        lineHeight: '1.5',
      }}
      lineNumberStyle={{
        minWidth: '2.5em',
        paddingRight: '1em',
        color: isDark ? '#475569' : '#94a3b8',
        userSelect: 'none',
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
