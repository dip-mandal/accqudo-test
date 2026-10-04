'use client';

import React, { useEffect, useMemo, useState } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

interface RenderSegment {
  type: 'text' | 'image' | 'complex';
  content: string;
  alt?: string;
  id?: string;
}

interface LatexRenderResponse {
  success: boolean;
  svg: string;
  width?: string | null;
  height?: string | null;
  contains_tikz?: boolean;
}

/**
 * Detect LaTeX/TikZ environments that should be rendered by the
 * authenticated backend renderer.
 *
 * IMPORTANT:
 * We intentionally detect the actual TikZ environment rather than
 * treating the entire question as complex LaTeX.
 *
 * This allows content such as:
 *
 *   A block has mass $5\,kg$.
 *
 *   \begin{tikzpicture}
 *   ...
 *   \end{tikzpicture}
 *
 *   Calculate the acceleration.
 *
 * to be rendered as:
 *
 *   normal text
 *   +
 *   TikZ SVG
 *   +
 *   normal text
 */
const TIKZ_BLOCK_REGEX =
  /(?:\\(?:usetikzlibrary|usepackage)\s*\{[^{}]*\}\s*)*\\begin\s*\{\s*tikzpicture\s*\}[\s\S]*?\\end\s*\{\s*tikzpicture\s*\}/gi;

/**
 * Complete standalone LaTeX documents are still supported.
 *
 * These are sent to the backend as one document because the backend
 * sanitizer is responsible for safely normalizing the document.
 */
const COMPLETE_LATEX_DOCUMENT_REGEX =
  /\\documentclass\b[\s\S]*?\\begin\s*\{\s*document\s*\}[\s\S]*?\\end\s*\{\s*document\s*\}/i;

/**
 * Other complex commands that may require backend rendering when they
 * appear outside a normal KaTeX expression.
 *
 * Most matrices, arrays, aligned blocks, cases, etc. are still handled
 * naturally by KaTeX when they are inside $...$ or \[...\].
 */
const COMPLEX_LATEX_PATTERNS: RegExp[] = [
  /\\usetikzlibrary\b/i,
  /\\tikz\b/i,
  /\\draw\b/i,
  /\\path\b/i,
  /\\node\b/i,
  /\\coordinate\b/i,
  /\\filldraw\b/i,
  /\\fill\b/i,
  /\\clip\b/i,
  /\\shade\b/i,
  /\\shadedraw\b/i,
  /\\foreach\b/i,
  /\\matrix\b/i,
];

/**
 * Check whether the complete content contains a TikZ block.
 */
function containsTikz(content: string): boolean {
  if (!content.trim()) {
    return false;
  }

  TIKZ_BLOCK_REGEX.lastIndex = 0;
  return TIKZ_BLOCK_REGEX.test(content);
}

/**
 * Check whether content is a complete LaTeX document.
 */
function isCompleteLatexDocument(content: string): boolean {
  return COMPLETE_LATEX_DOCUMENT_REGEX.test(content);
}

/**
 * Check whether some complex backend LaTeX syntax exists.
 */
function containsComplexLatex(content: string): boolean {
  if (!content.trim()) {
    return false;
  }

  if (containsTikz(content)) {
    return true;
  }

  if (isCompleteLatexDocument(content)) {
    return true;
  }

  return COMPLEX_LATEX_PATTERNS.some((pattern) => pattern.test(content));
}

/**
 * Extract Markdown-style images.
 *
 * Example:
 *
 * ![Diagram](https://example.com/image.png)
 */
const MARKDOWN_IMAGE_REGEX =
  /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/**
 * Parse content into mixed rendering segments:
 *
 *   text
 *   image
 *   complex/TikZ
 *
 * The most important change from the previous implementation is that
 * a TikZ block is isolated instead of sending the entire question to
 * the backend.
 */
function parseMixedContent(content: string): RenderSegment[] {
  if (!content.trim()) {
    return [];
  }

  const segments: RenderSegment[] = [];

  /**
   * Complete standalone LaTeX documents are kept together.
   *
   * This preserves compatibility with the backend's document sanitizer.
   */
  if (isCompleteLatexDocument(content)) {
    return [
      {
        type: 'complex',
        content: content.trim(),
        id: 'complete-latex-document',
      },
    ];
  }

  /**
   * First split TikZ blocks from normal content.
   */
  const tikzParts: Array<{
    start: number;
    end: number;
    content: string;
  }> = [];

  TIKZ_BLOCK_REGEX.lastIndex = 0;

  let tikzMatch: RegExpExecArray | null;

  while ((tikzMatch = TIKZ_BLOCK_REGEX.exec(content)) !== null) {
    tikzParts.push({
      start: tikzMatch.index,
      end: tikzMatch.index + tikzMatch[0].length,
      content: tikzMatch[0],
    });
  }

  /**
   * If there are no TikZ blocks, just parse Markdown images.
   */
  if (tikzParts.length === 0) {
    return parseImagesOnly(content);
  }

  let cursor = 0;

  for (const tikzPart of tikzParts) {
    const before = content.slice(cursor, tikzPart.start);

    if (before.trim()) {
      segments.push(
        ...parseImagesOnly(before, `text-${segments.length}`),
      );
    }

    segments.push({
      type: 'complex',
      content: tikzPart.content.trim(),
      id: `tikz-${segments.length}`,
    });

    cursor = tikzPart.end;
  }

  const after = content.slice(cursor);

  if (after.trim()) {
    segments.push(
      ...parseImagesOnly(after, `text-${segments.length}`),
    );
  }

  return segments;
}

/**
 * Parse normal text for Markdown/R2 images.
 */
function parseImagesOnly(
  content: string,
  idPrefix = 'segment',
): RenderSegment[] {
  const segments: RenderSegment[] = [];

  MARKDOWN_IMAGE_REGEX.lastIndex = 0;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = MARKDOWN_IMAGE_REGEX.exec(content)) !== null) {
    const textBefore = content.slice(lastIndex, match.index);

    if (textBefore.trim()) {
      segments.push({
        type: 'text',
        content: textBefore,
        id: `${idPrefix}-text-${index++}`,
      });
    }

    segments.push({
      type: 'image',
      content: match[2],
      alt: match[1] || 'Diagram',
      id: `${idPrefix}-image-${index++}`,
    });

    lastIndex = MARKDOWN_IMAGE_REGEX.lastIndex;
  }

  const remaining = content.slice(lastIndex);

  if (remaining.trim()) {
    segments.push({
      type: 'text',
      content: remaining,
      id: `${idPrefix}-text-${index++}`,
    });
  }

  return segments;
}

/**
 * Render ordinary text / inline math / display math with KaTeX.
 *
 * Supported:
 *
 * $x^2$
 *
 * $$x^2 + y^2 = z^2$$
 *
 * \(x^2\)
 *
 * \[x^2\]
 */
function renderKaTeX(content: string): string {
  if (!content.trim()) {
    return '';
  }

  let html = escapeHtml(content);

  // ---------------------------------------------------------------
  // Display math: $$ ... $$
  // ---------------------------------------------------------------

  html = html.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_, expression: string) => {
      return renderExpression(
        unescapeHtml(expression),
        true,
      );
    },
  );

  // ---------------------------------------------------------------
  // Display math: \[ ... \]
  // ---------------------------------------------------------------

  html = html.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, expression: string) => {
      return renderExpression(
        unescapeHtml(expression),
        true,
      );
    },
  );

  // ---------------------------------------------------------------
  // Inline math: \( ... \)
  // ---------------------------------------------------------------

  html = html.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, expression: string) => {
      return renderExpression(
        unescapeHtml(expression),
        false,
      );
    },
  );

  // ---------------------------------------------------------------
  // Inline math: $ ... $
  // ---------------------------------------------------------------

  html = html.replace(
    /(^|[^\\$])\$([^$\n]+)\$/g,
    (
      _: string,
      prefix: string,
      expression: string,
    ) => {
      return (
        prefix +
        renderExpression(
          unescapeHtml(expression),
          false,
        )
      );
    },
  );

  /**
   * Convert newlines to actual visual line breaks.
   *
   * This is important for normal question text because the browser
   * otherwise collapses ordinary newline characters.
   */
  html = html.replace(/\n/g, '<br />');

  return html;
}

/**
 * Render a single KaTeX expression.
 */
function renderExpression(
  expression: string,
  displayMode: boolean,
): string {
  try {
    return katex.renderToString(
      expression,
      {
        displayMode,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
        output: 'htmlAndMathml',
      },
    );
  } catch {
    return `
      <span class="text-red-500">
        ${escapeHtml(expression)}
      </span>
    `;
  }
}

/**
 * Escape HTML before inserting normal text into
 * dangerouslySetInnerHTML.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Undo only the HTML escaping we performed internally.
 */
function unescapeHtml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

/**
 * Resolve the backend API base URL.
 */
function getApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:8001/api/v1'
  ).replace(/\/$/, '');
}

/**
 * Read the current Accqudo authentication token.
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    window.localStorage.getItem('accqudo_token') ||
    window.localStorage.getItem('token')
  );
}

/**
 * Backend-rendered complex LaTeX/TikZ segment.
 *
 * Each diagram gets its own API request and its own loading/error state.
 *
 * This is what allows a question to contain:
 *
 * text
 * diagram
 * text
 * diagram
 * text
 *
 * without turning the whole question into one LaTeX document.
 */
const BackendLatexBlock: React.FC<{
  content: string;
}> = ({ content }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!content.trim()) {
      setSvg(null);
      setError(null);
      setIsRendering(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      if (cancelled) {
        return;
      }

      setIsRendering(true);
      setError(null);

      try {
        const token = getAuthToken();

        if (!token) {
          throw new Error(
            'Authentication required for complex LaTeX rendering.',
          );
        }

        const response = await fetch(
          `${getApiBase()}/latex/render`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latex: content,
            }),
          },
        );

        let data: LatexRenderResponse | null = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          const message =
            data &&
            typeof data === 'object' &&
            'detail' in data
              ? String(
                  (
                    data as unknown as {
                      detail?: unknown;
                    }
                  ).detail ?? 'Rendering failed.',
                )
              : 'Complex LaTeX rendering failed.';

          throw new Error(message);
        }

        if (!data?.success || !data.svg) {
          throw new Error(
            'The rendering service returned an invalid SVG.',
          );
        }

        if (!cancelled) {
          setSvg(data.svg);
          setError(null);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setSvg(null);

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to render complex LaTeX.',
        );
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [content]);

  return (
    <div className="latex-complex-block my-4 w-full">
      {isRendering && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden="true"
          />

          <span>Rendering diagram…</span>
        </div>
      )}

      {error && (
        <div className="my-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <div className="font-medium">
            Unable to render this LaTeX
          </div>

          <div className="mt-1 break-words text-xs">
            {error}
          </div>
        </div>
      )}

      {svg && (
        <div
          className="latex-svg-renderer flex w-full justify-center overflow-x-auto py-3"
          dangerouslySetInnerHTML={{
            __html: svg,
          }}
        />
      )}
    </div>
  );
};

/**
 * Main MathRenderer component.
 *
 * Supports:
 *
 * 1. Normal text
 * 2. Inline KaTeX
 * 3. Display KaTeX
 * 4. Markdown/R2 images
 * 5. Embedded TikZ diagrams
 * 6. Multiple TikZ diagrams in one question
 * 7. Text before/after diagrams
 * 8. Complete standalone LaTeX documents
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
}) => {
  const segments = useMemo(
    () => parseMixedContent(content),
    [content],
  );

  /**
   * Empty state.
   */
  if (!content?.trim()) {
    return null;
  }

  return (
    <div
      className={[
        'math-renderer',
        'w-full',
        'min-w-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {segments.map((segment, index) => {
        const key =
          segment.id ||
          `${segment.type}-${index}`;

        // ---------------------------------------------------------
        // Backend LaTeX / TikZ
        // ---------------------------------------------------------

        if (segment.type === 'complex') {
          return (
            <BackendLatexBlock
              key={key}
              content={segment.content}
            />
          );
        }

        // ---------------------------------------------------------
        // Markdown / R2 image
        // ---------------------------------------------------------

        if (segment.type === 'image') {
          return (
            <div
              key={key}
              className="my-4 flex w-full justify-center"
            >
              <img
                src={segment.content}
                alt={segment.alt || 'Diagram'}
                className="max-h-[500px] max-w-full rounded-md object-contain"
                loading="lazy"
              />
            </div>
          );
        }

        // ---------------------------------------------------------
        // Normal text + KaTeX
        // ---------------------------------------------------------

        return (
          <div
            key={key}
            className="math-renderer-text w-full leading-7"
            dangerouslySetInnerHTML={{
              __html: renderKaTeX(segment.content),
            }}
          />
        );
      })}
    </div>
  );
};

export default MathRenderer;