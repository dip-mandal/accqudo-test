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
    }
  | {
      type: 'latex';
      content: string;
      kind: 'document' | 'tikz' | 'environment';
    };

/**
 * Accqudo Math Renderer
 *
 * Supports:
 *
 * INLINE:
 *   $x^2 + y^2$
 *   \(x^2 + y^2\)
 *
 * DISPLAY:
 *   $$\frac{a}{b}$$
 *   \[
 *      \frac{a}{b}
 *   \]
 *
 * COMMON LATEX:
 *   \frac{a}{b}
 *   \sqrt{x}
 *   x^2
 *   \sum_{i=1}^{n} i
 *   \int_0^1 x^2 dx
 *   \begin{matrix} ... \end{matrix}
 *   \begin{pmatrix} ... \end{pmatrix}
 *   \begin{cases} ... \end{cases}
 *   \begin{aligned} ... \end{aligned}
 *   \text{some text}
 *
 * MARKDOWN IMAGES:
 *   ![Diagram](https://example.com/image.png)
 *
 * FULL LATEX:
 *   \documentclass{article}
 *   ...
 *   \begin{document}
 *   ...
 *   \end{document}
 *
 * TIKZ:
 *   \begin{tikzpicture}
 *      ...
 *   \end{tikzpicture}
 *
 * IMPORTANT:
 * KaTeX can render mathematical LaTeX but cannot compile
 * arbitrary LaTeX documents or TikZ drawings.
 *
 * Full documents and TikZ blocks are therefore detected and
 * displayed safely as source/fallback content unless an external
 * LaTeX rendering backend is connected.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
}) => {
  const tokens = useMemo(
    () => parseContent(content || ''),
    [content]
  );

  if (!content) {
    return null;
  }

  return (
    <div
      className={`w-full text-slate-800 leading-relaxed ${className}`}
    >
      {tokens.map((token, index) => {
        /**
         * -------------------------------------------------------
         * IMAGE
         * -------------------------------------------------------
         */
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

        /**
         * -------------------------------------------------------
         * FULL LATEX / TIKZ
         * -------------------------------------------------------
         *
         * KaTeX cannot compile these.
         *
         * We intentionally don't pass them to katex.renderToString()
         * because doing so would produce errors or broken output.
         */
        if (token.type === 'latex') {
          return (
            <LatexFallback
              key={`latex-${index}`}
              content={token.content}
              kind={token.kind}
            />
          );
        }

        /**
         * -------------------------------------------------------
         * MATHEMATICS
         * -------------------------------------------------------
         */
        if (token.type === 'math') {
          return (
            <KatexMath
              key={`math-${index}`}
              content={token.content}
              displayMode={token.displayMode}
              index={index}
            />
          );
        }

        /**
         * -------------------------------------------------------
         * NORMAL TEXT
         * -------------------------------------------------------
         *
         * React escapes the content automatically.
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
 * ---------------------------------------------------------------
 * KATEX MATH COMPONENT
 * ---------------------------------------------------------------
 */
interface KatexMathProps {
  content: string;
  displayMode: boolean;
  index: number;
}

function KatexMath({
  content,
  displayMode,
  index,
}: KatexMathProps) {
  let html = '';

  const normalizedContent = normalizeLatex(content);

  try {
    html = katex.renderToString(normalizedContent.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
      output: 'htmlAndMathml',
      fleqn: false,
      leqno: false,
      minRuleThickness: 0.05,
      maxSize: Infinity,
      maxExpand: 1000,
    });
  } catch (error) {
    console.error('Accqudo KaTeX rendering error:', error);

    return (
      <span
        key={`math-error-${index}`}
        className={
          displayMode
            ? 'block my-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700 font-mono overflow-x-auto'
            : 'font-mono text-red-700'
        }
      >
        {content}
      </span>
    );
  }

  if (!html) {
    return null;
  }

  if (displayMode) {
    return (
      <div
        key={`math-${index}`}
        className="block w-full overflow-x-auto py-3 text-center"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      key={`math-${index}`}
      className="inline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * ---------------------------------------------------------------
 * LATEX FALLBACK COMPONENT
 * ---------------------------------------------------------------
 *
 * This handles complete LaTeX documents and TikZ code.
 *
 * IMPORTANT:
 * Browser-side KaTeX cannot compile TikZ.
 *
 * Instead of breaking the question, we show the source in a
 * controlled expandable block.
 *
 * Later, this component can be replaced by an API call to a
 * server-side LaTeX renderer.
 */
interface LatexFallbackProps {
  content: string;
  kind: 'document' | 'tikz' | 'environment';
}

function LatexFallback({
  content,
  kind,
}: LatexFallbackProps) {
  const title =
    kind === 'tikz'
      ? 'TikZ diagram'
      : kind === 'document'
        ? 'LaTeX document'
        : 'LaTeX environment';

  return (
    <div className="my-4 w-full rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 bg-slate-100">
        <span className="text-sm font-semibold text-slate-700">
          {title}
        </span>

        <span className="text-xs text-slate-500">
          Requires LaTeX renderer
        </span>
      </div>

      <details className="group">
        <summary className="cursor-pointer select-none px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
          Show LaTeX source
        </summary>

        <pre className="m-0 max-h-[500px] overflow-auto border-t border-slate-200 bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
          <code>{content}</code>
        </pre>
      </details>
    </div>
  );
}

/**
 * ---------------------------------------------------------------
 * CONTENT PARSER
 * ---------------------------------------------------------------
 *
 * Important:
 *
 * We parse complete content BEFORE rendering individual
 * mathematical expressions.
 *
 * This prevents multiline LaTeX from being accidentally split.
 */
function parseContent(content: string): Token[] {
  const tokens: Token[] = [];

  if (!content) {
    return tokens;
  }

  let cursor = 0;

  while (cursor < content.length) {
    const remaining = content.slice(cursor);

    /**
     * -----------------------------------------------------------
     * 1. MARKDOWN IMAGE
     * -----------------------------------------------------------
     *
     * Example:
     *
     * ![Diagram](https://example.com/image.png)
     */
    const imageMatch = remaining.match(
      /^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/
    );

    if (imageMatch) {
      tokens.push({
        type: 'image',
        content: imageMatch[2],
        alt: imageMatch[1] || 'Diagram',
      });

      cursor += imageMatch[0].length;
      continue;
    }

    /**
     * -----------------------------------------------------------
     * 2. COMPLETE LATEX DOCUMENT
     * -----------------------------------------------------------
     *
     * Detect:
     *
     * \documentclass{article}
     * ...
     * \begin{document}
     * ...
     * \end{document}
     */
    if (isLatexDocumentStart(remaining)) {
      const endIndex = findLatexDocumentEnd(remaining);

      if (endIndex !== -1) {
        tokens.push({
          type: 'latex',
          content: remaining.slice(0, endIndex),
          kind: 'document',
        });

        cursor += endIndex;
        continue;
      }
    }

    /**
     * -----------------------------------------------------------
     * 3. TIKZ PICTURE
     * -----------------------------------------------------------
     *
     * Detect:
     *
     * \begin{tikzpicture}
     * ...
     * \end{tikzpicture}
     */
    if (startsWithTikzPicture(remaining)) {
      const endIndex = findEnvironmentEnd(
        remaining,
        'tikzpicture'
      );

      if (endIndex !== -1) {
        tokens.push({
          type: 'latex',
          content: remaining.slice(0, endIndex),
          kind: 'tikz',
        });

        cursor += endIndex;
        continue;
      }
    }

    /**
     * -----------------------------------------------------------
     * 4. DISPLAY MATH: $$ ... $$
     * -----------------------------------------------------------
     */
    if (remaining.startsWith('$$')) {
      const end = findClosingDelimiter(
        remaining,
        '$$',
        2
      );

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

    /**
     * -----------------------------------------------------------
     * 5. DISPLAY MATH: \[ ... \]
     * -----------------------------------------------------------
     */
    if (remaining.startsWith('\\[')) {
      const end = findClosingDelimiter(
        remaining,
        '\\]',
        2
      );

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

    /**
     * -----------------------------------------------------------
     * 6. INLINE MATH: \( ... \)
     * -----------------------------------------------------------
     */
    if (remaining.startsWith('\\(')) {
      const end = findClosingDelimiter(
        remaining,
        '\\)',
        2
      );

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

    /**
     * -----------------------------------------------------------
     * 7. COMMON LATEX ENVIRONMENTS
     * -----------------------------------------------------------
     *
     * This supports things like:
     *
     * \begin{aligned}
     * ...
     * \end{aligned}
     *
     * \begin{matrix}
     * ...
     * \end{matrix}
     *
     * \begin{pmatrix}
     * ...
     * \end{pmatrix}
     *
     * \begin{cases}
     * ...
     * \end{cases}
     */
    const environmentMatch = matchLatexEnvironmentStart(
      remaining
    );

    if (environmentMatch) {
      const environmentName = environmentMatch.name;

      const endIndex = findEnvironmentEnd(
        remaining,
        environmentName
      );

      if (endIndex !== -1) {
        const fullEnvironment = remaining.slice(
          0,
          endIndex
        );

        tokens.push({
          type: 'math',
          content: fullEnvironment,
          displayMode: true,
        });

        cursor += endIndex;
        continue;
      }
    }

    /**
     * -----------------------------------------------------------
     * 8. INLINE $ ... $
     * -----------------------------------------------------------
     */
    if (
      remaining.startsWith('$') &&
      !remaining.startsWith('$$')
    ) {
      const closingDollar = findInlineDollarEnd(
        remaining
      );

      if (closingDollar !== -1) {
        const math = remaining.slice(
          1,
          closingDollar
        );

        if (isValidInlineMath(math)) {
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

    /**
     * -----------------------------------------------------------
     * 9. NORMAL TEXT
     * -----------------------------------------------------------
     *
     * Consume until the next possible special construct.
     */
    const nextPosition = findNextSpecialPosition(
      remaining
    );

    const textChunk =
      nextPosition > 0
        ? remaining.slice(0, nextPosition)
        : remaining.charAt(0);

    if (textChunk) {
      tokens.push({
        type: 'text',
        content: textChunk,
      });

      cursor += textChunk.length;
    } else {
      /**
       * Safety fallback.
       *
       * Ensures parser can never get stuck.
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
 * ---------------------------------------------------------------
 * LATEX DOCUMENT DETECTION
 * ---------------------------------------------------------------
 */
function isLatexDocumentStart(content: string): boolean {
  return (
    /\\documentclass(?:\[[^\]]*\])?\s*\{[^}]+\}/.test(
      content
    ) ||
    /\\begin\s*\{\s*document\s*\}/.test(content)
  );
}

function findLatexDocumentEnd(content: string): number {
  const endMatch = /\\end\s*\{\s*document\s*\}/.exec(
    content
  );

  if (!endMatch || endMatch.index === undefined) {
    return -1;
  }

  return endMatch.index + endMatch[0].length;
}

/**
 * ---------------------------------------------------------------
 * TIKZ DETECTION
 * ---------------------------------------------------------------
 */
function startsWithTikzPicture(content: string): boolean {
  return /^\\begin\s*\{\s*tikzpicture\s*\}/.test(
    content
  );
}

/**
 * ---------------------------------------------------------------
 * ENVIRONMENT DETECTION
 * ---------------------------------------------------------------
 */
const SUPPORTED_MATH_ENVIRONMENTS = new Set([
  'matrix',
  'pmatrix',
  'bmatrix',
  'Bmatrix',
  'vmatrix',
  'Vmatrix',
  'cases',
  'aligned',
  'alignedat',
  'gathered',
  'gather',
  'array',
  'smallmatrix',
  'split',
]);

function matchLatexEnvironmentStart(
  content: string
): { name: string; fullMatch: string } | null {
  const match = content.match(
    /^\\begin\s*\{\s*([a-zA-Z*]+)\s*\}/
  );

  if (!match) {
    return null;
  }

  const name = match[1];

  if (!SUPPORTED_MATH_ENVIRONMENTS.has(name)) {
    return null;
  }

  return {
    name,
    fullMatch: match[0],
  };
}

/**
 * ---------------------------------------------------------------
 * FIND ENVIRONMENT END
 * ---------------------------------------------------------------
 *
 * Handles:
 *
 * \begin{name}
 * ...
 * \end{name}
 */
function findEnvironmentEnd(
  content: string,
  environmentName: string
): number {
  const escapedName = escapeRegExp(environmentName);

  const regex = new RegExp(
    `\\\\end\\s*\\{\\s*${escapedName}\\s*\\}`
  );

  const match = regex.exec(content);

  if (!match || match.index === undefined) {
    return -1;
  }

  return match.index + match[0].length;
}

/**
 * ---------------------------------------------------------------
 * FIND CLOSING DELIMITER
 * ---------------------------------------------------------------
 */
function findClosingDelimiter(
  content: string,
  delimiter: string,
  startIndex: number
): number {
  let index = startIndex;

  while (index < content.length) {
    const found = content.indexOf(
      delimiter,
      index
    );

    if (found === -1) {
      return -1;
    }

    /**
     * Ignore escaped delimiters.
     */
    if (!isEscaped(content, found)) {
      return found;
    }

    index = found + delimiter.length;
  }

  return -1;
}

/**
 * ---------------------------------------------------------------
 * INLINE DOLLAR FINDER
 * ---------------------------------------------------------------
 */
function findInlineDollarEnd(
  content: string
): number {
  for (let i = 1; i < content.length; i++) {
    if (content[i] !== '$') {
      continue;
    }

    /**
     * Do not treat $$ as an inline closing delimiter.
     */
    if (
      content[i - 1] === '$' ||
      content[i + 1] === '$'
    ) {
      continue;
    }

    /**
     * Ignore escaped dollars.
     */
    if (isEscaped(content, i)) {
      continue;
    }

    /**
     * Inline math should not cross a newline.
     */
    const segment = content.slice(1, i);

    if (segment.includes('\n')) {
      return -1;
    }

    return i;
  }

  return -1;
}

/**
 * ---------------------------------------------------------------
 * INLINE MATH VALIDATION
 * ---------------------------------------------------------------
 *
 * Prevents common currency cases:
 *
 * $100
 * $1000
 * $10.50
 *
 * But still permits:
 *
 * $x$
 * $\frac{1}{2}$
 * $\alpha$
 */
function isValidInlineMath(
  math: string
): boolean {
  const value = math.trim();

  if (!value) {
    return false;
  }

  /**
   * Pure currency/numeric content.
   */
  if (/^\d+(?:\.\d+)?$/.test(value)) {
    return false;
  }

  /**
   * Avoid very obvious prose/currency strings.
   */
  if (
    value.length > 200 &&
    !/[\\^_{}]/.test(value)
  ) {
    return false;
  }

  return true;
}

/**
 * ---------------------------------------------------------------
 * FIND NEXT SPECIAL CONSTRUCT
 * ---------------------------------------------------------------
 */
function findNextSpecialPosition(
  content: string
): number {
  const positions: number[] = [];

  const candidates = [
    content.indexOf('$'),
    content.indexOf('\\['),
    content.indexOf('\\('),
    content.indexOf('!['),
    content.indexOf('\\documentclass'),
    content.indexOf('\\begin{'),
  ];

  for (const position of candidates) {
    if (position > 0) {
      positions.push(position);
    }
  }

  if (positions.length === 0) {
    return content.length;
  }

  return Math.min(...positions);
}

/**
 * ---------------------------------------------------------------
 * NORMALIZE LATEX
 * ---------------------------------------------------------------
 *
 * Performs safe cleanup before passing mathematical content
 * into KaTeX.
 */
function normalizeLatex(
  latex: string
): string {
  let value = latex;

  /**
   * Normalize Windows line endings.
   */
  value = value.replace(/\r\n/g, '\n');

  /**
   * Remove accidental zero-width characters.
   */
  value = value.replace(/[\u200B-\u200D\uFEFF]/g, '');

  /**
   * Convert HTML entities that commonly appear when content
   * has passed through an HTML/JSON pipeline.
   */
  value = decodeBasicHtmlEntities(value);

  /**
   * Remove surrounding whitespace.
   */
  value = value.trim();

  /**
   * KaTeX handles these environments itself when they are inside
   * math mode.
   */
  return value;
}

/**
 * ---------------------------------------------------------------
 * HTML ENTITY DECODER
 * ---------------------------------------------------------------
 */
function decodeBasicHtmlEntities(
  value: string
): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * ---------------------------------------------------------------
 * ESCAPED CHARACTER CHECK
 * ---------------------------------------------------------------
 */
function isEscaped(
  value: string,
  index: number
): boolean {
  let slashCount = 0;

  for (
    let i = index - 1;
    i >= 0 && value[i] === '\\';
    i--
  ) {
    slashCount++;
  }

  return slashCount % 2 === 1;
}

/**
 * ---------------------------------------------------------------
 * REGEX ESCAPE
 * ---------------------------------------------------------------
 */
function escapeRegExp(
  value: string
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

/**
 * ---------------------------------------------------------------
 * MERGE ADJACENT TEXT TOKENS
 * ---------------------------------------------------------------
 */
function mergeAdjacentTextTokens(
  tokens: Token[]
): Token[] {
  const result: Token[] = [];

  for (const token of tokens) {
    const previous =
      result[result.length - 1];

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