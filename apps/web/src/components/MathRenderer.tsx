'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

type Token =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'math';
      content: string;
      displayMode: boolean;
    }
  | {
      type: 'image';
      content: string;
      alt: string;
    };

/**
 * Accqudo Math Renderer
 *
 * Supports:
 *
 * Inline:
 *   $x^2 + y^2$
 *   \(x^2 + y^2\)
 *
 * Display:
 *   $$\frac{a}{b}$$
 *   \[
 *      \frac{a}{b}
 *   \]
 *
 * Markdown images:
 *   ![Diagram](https://example.com/image.png)
 *
 * Normal text can be mixed freely with mathematics.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
}) => {
  const tokens = useMemo(() => parseContent(content || ''), [content]);

  if (!content) {
    return null;
  }

  return (
    <div
      className={`w-full text-slate-800 leading-relaxed ${className}`}
    >
      {tokens.map((token, index) => {
        if (token.type === 'image') {
          return (
            <div
              key={`image-${index}`}
              className="w-full flex justify-center py-3"
            >
              <img
                src={token.content}
                alt={token.alt || 'Diagram'}
                className="max-w-full h-auto rounded-lg border border-slate-200 object-contain"
                loading="lazy"
              />
            </div>
          );
        }

        if (token.type === 'math') {
          let html = '';

          try {
            html = katex.renderToString(token.content.trim(), {
              displayMode: token.displayMode,
              throwOnError: false,
              strict: false,
              trust: false,
              output: 'html',
            });
          } catch (error) {
            console.error('KaTeX rendering error:', error);

            return (
              <span
                key={`math-error-${index}`}
                className={
                  token.displayMode
                    ? 'block my-3 rounded bg-red-50 px-2 py-1 text-red-700 font-mono'
                    : 'font-mono text-red-700'
                }
              >
                {token.content}
              </span>
            );
          }

          return (
            <span
              key={`math-${index}`}
              className={
                token.displayMode
                  ? 'block w-full overflow-x-auto py-2 text-center'
                  : 'inline'
              }
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        /*
         * Normal text is escaped by React automatically.
         *
         * whitespace-pre-wrap preserves:
         * - new lines
         * - spaces
         * - normal question formatting
         */
        return (
          <span
            key={`text-${index}`}
            className="whitespace-pre-wrap"
          >
            {token.content}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Parse the complete content BEFORE splitting it into lines.
 *
 * This is important because display mathematics can span multiple
 * lines:
 *
 * $$
 * \frac{a}{b}
 * $$
 */
function parseContent(content: string): Token[] {
  const tokens: Token[] = [];

  if (!content) {
    return tokens;
  }

  /*
   * Order is important:
   *
   * 1. Images
   * 2. $$ display math
   * 3. \[ \] display math
   * 4. $ inline math
   * 5. \( \) inline math
   */
  const tokenRegex =
    /(!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\))|(\$\$([\s\S]*?)\$\$)|(\\\[([\s\S]*?)\\\])|(\$((?:\\.|[^$\\\n])+) \$)|(\$((?:\\.|[^$\\\n])+)\$)|(\\\(([\s\S]*?)\\\))/g;

  /*
   * The expression above contains an intentionally strict inline
   * matcher. We additionally use a simpler fallback parser below
   * so that common "$x^2$" expressions are always handled.
   */

  let cursor = 0;

  while (cursor < content.length) {
    const remaining = content.slice(cursor);

    /*
     * Markdown image
     */
    const imageMatch = remaining.match(
      /^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/
    );

    if (imageMatch) {
      if (cursor > 0 && tokens.length === 0) {
        // No-op; retained for parser clarity.
      }

      tokens.push({
        type: 'image',
        content: imageMatch[2],
        alt: imageMatch[1] || 'Diagram',
      });

      cursor += imageMatch[0].length;
      continue;
    }

    /*
     * Display math: $$ ... $$
     *
     * Supports multiline expressions.
     */
    if (remaining.startsWith('$$')) {
      const end = remaining.indexOf('$$', 2);

      if (end !== -1) {
        tokens.push({
          type: 'math',
          content: remaining.slice(2, end),
          displayMode: true,
        });

        cursor += end + 2;
        continue;
      }
    }

    /*
     * Display math: \[ ... \]
     *
     * Supports multiline expressions.
     */
    if (remaining.startsWith('\\[')) {
      const end = remaining.indexOf('\\]', 2);

      if (end !== -1) {
        tokens.push({
          type: 'math',
          content: remaining.slice(2, end),
          displayMode: true,
        });

        cursor += end + 2;
        continue;
      }
    }

    /*
     * Inline math: \( ... \)
     */
    if (remaining.startsWith('\\(')) {
      const end = remaining.indexOf('\\)', 2);

      if (end !== -1) {
        tokens.push({
          type: 'math',
          content: remaining.slice(2, end),
          displayMode: false,
        });

        cursor += end + 2;
        continue;
      }
    }

    /*
     * Inline math: $ ... $
     *
     * Avoid interpreting "$" in ordinary text unless another "$"
     * exists on the same line.
     */
    if (remaining.startsWith('$') && !remaining.startsWith('$$')) {
      const newlineIndex = remaining.indexOf('\n');
      const searchLimit =
        newlineIndex === -1 ? remaining.length : newlineIndex;

      const closingDollar = remaining.indexOf('$', 1);

      if (
        closingDollar !== -1 &&
        closingDollar < searchLimit &&
        closingDollar > 1
      ) {
        const math = remaining.slice(1, closingDollar);

        /*
         * Ignore obvious currency cases such as "$100".
         */
        if (!/^\d+(?:\.\d+)?$/.test(math.trim())) {
          tokens.push({
            type: 'math',
            content: math,
            displayMode: false,
          });

          cursor += closingDollar + 1;
          continue;
        }
      }
    }

    /*
     * Normal text.
     *
     * Consume characters until the next possible special construct.
     */
    const nextPositions = [
      remaining.indexOf('$'),
      remaining.indexOf('\\['),
      remaining.indexOf('\\('),
      remaining.indexOf('!['),
    ].filter((position) => position > 0);

    const nextPosition =
      nextPositions.length > 0
        ? Math.min(...nextPositions)
        : remaining.length;

    const textChunk = remaining.slice(0, nextPosition);

    if (textChunk) {
      tokens.push({
        type: 'text',
        content: textChunk,
      });

      cursor += textChunk.length;
    } else {
      /*
       * Safety fallback so the parser can never get stuck.
       */
      tokens.push({
        type: 'text',
        content: remaining.charAt(0),
      });

      cursor += 1;
    }
  }

  return mergeAdjacentTextTokens(tokens);
}

/**
 * Combine consecutive text nodes to keep the React tree clean.
 */
function mergeAdjacentTextTokens(tokens: Token[]): Token[] {
  const result: Token[] = [];

  for (const token of tokens) {
    const previous = result[result.length - 1];

    if (
      previous?.type === 'text' &&
      token.type === 'text'
    ) {
      previous.content += token.content;
    } else {
      result.push(token);
    }
  }

  return result;
}
