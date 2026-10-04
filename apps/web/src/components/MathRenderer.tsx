'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

interface LatexRenderResponse {
  success: boolean;
  svg: string;
  width?: string | null;
  height?: string | null;
  contains_tikz?: boolean;
}

const COMPLEX_LATEX_PATTERNS: RegExp[] = [
  /\\begin\s*\{\s*tikzpicture\s*\}/i,
  /\\end\s*\{\s*tikzpicture\s*\}/i,
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
  /\\begin\s*\{\s*array\s*\}/i,
  /\\begin\s*\{\s*aligned\s*\}/i,
  /\\begin\s*\{\s*cases\s*\}/i,
  /\\begin\s*\{\s*align\*?\s*\}/i,
  /\\begin\s*\{\s*gather\*?\s*\}/i,
];

/**
 * Detect LaTeX that should be rendered by the backend instead of
 * ordinary browser KaTeX.
 */
function containsComplexLatex(content: string): boolean {
  if (!content.trim()) {
    return false;
  }

  return COMPLEX_LATEX_PATTERNS.some((pattern) =>
    pattern.test(content),
  );
}

/**
 * Extract Markdown-style images from the content.
 *
 * Example:
 *
 * ![Diagram](https://example.com/image.png)
 */
function parseContent(content: string): RenderLine[] {
  const lines: RenderLine[] = [];

  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(content)) !== null) {
    const textBefore = content.slice(
      lastIndex,
      match.index,
    );

    if (textBefore.trim()) {
      lines.push({
        type: 'text',
        content: textBefore,
      });
    }

    lines.push({
      type: 'image',
      content: match[2],
      alt: match[1] || 'Diagram',
    });

    lastIndex = imageRegex.lastIndex;
  }

  const remaining = content.slice(lastIndex);

  if (remaining.trim()) {
    lines.push({
      type: 'text',
      content: remaining,
    });
  }

  return lines;
}

/**
 * Render ordinary text / inline math / display math with KaTeX.
 *
 * This function deliberately handles common Accqudo authoring syntax:
 *
 * $x^2$
 *
 * $$x^2 + y^2 = z^2$$
 *
 * \(...\)
 *
 * \[...\]
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

  // Convert newlines to visible line breaks.
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
 * Escape HTML before inserting normal text into dangerouslySetInnerHTML.
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
 *
 * This is used before sending the math expression to KaTeX.
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

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
}) => {
  const [complexSvg, setComplexSvg] = useState<string | null>(
    null,
  );

  const [isRenderingComplex, setIsRenderingComplex] =
    useState(false);

  const [renderError, setRenderError] = useState<string | null>(
    null,
  );

  const hasComplexLatex = useMemo(
    () => containsComplexLatex(content),
    [content],
  );

  const parsedContent = useMemo(
    () => parseContent(content),
    [content],
  );

  // ----------------------------------------------------------------
  // Backend complex LaTeX / TikZ rendering
  // ----------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    if (!hasComplexLatex) {
      setComplexSvg(null);
      setRenderError(null);
      setIsRenderingComplex(false);
      return;
    }

    if (!content.trim()) {
      setComplexSvg(null);
      setRenderError(null);
      setIsRenderingComplex(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      if (cancelled) {
        return;
      }

      setIsRenderingComplex(true);
      setRenderError(null);

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
          setComplexSvg(data.svg);
          setRenderError(null);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setComplexSvg(null);

        setRenderError(
          error instanceof Error
            ? error.message
            : 'Unable to render complex LaTeX.',
        );
      } finally {
        if (!cancelled) {
          setIsRenderingComplex(false);
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [content, hasComplexLatex]);

  // ----------------------------------------------------------------
  // Empty state
  // ----------------------------------------------------------------

  if (!content?.trim()) {
    return null;
  }

  // ----------------------------------------------------------------
  // Complex LaTeX / TikZ
  // ----------------------------------------------------------------

  if (hasComplexLatex) {
    return (
      <div
        className={[
          'w-full',
          'overflow-x-auto',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {isRenderingComplex && (
          <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
              aria-hidden="true"
            />

            <span>
              Rendering diagram…
            </span>
          </div>
        )}

        {renderError && (
          <div className="my-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <div className="font-medium">
              Unable to render this LaTeX
            </div>

            <div className="mt-1 break-words text-xs">
              {renderError}
            </div>
          </div>
        )}

        {complexSvg && (
          <div
            className="latex-svg-renderer flex w-full justify-center overflow-x-auto py-2"
            dangerouslySetInnerHTML={{
              __html: complexSvg,
            }}
          />
        )}
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Normal KaTeX / Markdown image rendering
  // ----------------------------------------------------------------

  return (
    <div
      className={[
        'math-renderer',
        'w-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {parsedContent.map((line, index) => {
        if (line.type === 'image') {
          return (
            <div
              key={`image-${index}`}
              className="my-3 flex justify-center"
            >
              <img
                src={line.content}
                alt={line.alt || 'Diagram'}
                className="max-h-[500px] max-w-full rounded-md object-contain"
                loading="lazy"
              />
            </div>
          );
        }

        return (
          <div
            key={`text-${index}`}
            className="leading-7"
            dangerouslySetInnerHTML={{
              __html: renderKaTeX(line.content),
            }}
          />
        );
      })}
    </div>
  );
};

export default MathRenderer;