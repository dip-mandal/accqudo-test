'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

interface RenderLine {
  type: 'text' | 'image';
  content: string;
  alt?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
}) => {
  const processedLines = useMemo<RenderLine[]>(() => {
    if (!content) return [];

    const rawLines = content.split(/\r?\n/);
    const result: RenderLine[] = [];

    rawLines.forEach((line) => {
      if (!line.trim()) {
        result.push({
          type: 'text',
          content: '',
        });
        return;
      }

      /*
       * Detect Markdown images:
       *
       * ![Diagram](https://example.com/image.jpg)
       *
       * This also allows normal text before/after the image.
       */
      const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = imageRegex.exec(line)) !== null) {
        const beforeImage = line.slice(lastIndex, match.index);

        if (beforeImage.trim()) {
          result.push({
            type: 'text',
            content: renderMath(beforeImage),
          });
        }

        result.push({
          type: 'image',
          content: match[2],
          alt: match[1] || 'Diagram',
        });

        lastIndex = match.index + match[0].length;
      }

      const remainingText = line.slice(lastIndex);

      if (remainingText.trim()) {
        result.push({
          type: 'text',
          content: renderMath(remainingText),
        });
      } else if (lastIndex === 0) {
        result.push({
          type: 'text',
          content: renderMath(line),
        });
      }
    });

    return result;
  }, [content]);

  return (
    <div
      className={`w-full text-slate-800 space-y-2 ${className}`}
    >
      {processedLines.map((item, idx) => {
        if (item.type === 'image') {
          return (
            <div
              key={idx}
              className="w-full flex justify-center py-2"
            >
              <img
                src={item.content}
                alt={item.alt || 'Diagram'}
                className="max-w-full h-auto rounded-lg border border-slate-200 object-contain"
                loading="lazy"
              />
            </div>
          );
        }

        return (
          <div
            key={idx}
            className="block w-full min-h-[1.2rem]"
            dangerouslySetInnerHTML={{
              __html: item.content || '&nbsp;',
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Convert LaTeX expressions inside normal text to KaTeX HTML.
 */
function renderMath(line: string): string {
  if (!line) return '';

  let formatted = line;

  /*
   * Display math:
   *
   * $$ ... $$
   */
  formatted = formatted.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_, math: string) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return math;
      }
    }
  );

  /*
   * Inline math:
   *
   * $ ... $
   */
  formatted = formatted.replace(
    /\$([^$\n]+?)\$/g,
    (_, math: string) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return math;
      }
    }
  );

  return formatted;
}