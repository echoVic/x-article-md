"use client";

import type { ArticleBlock, InlineToken } from "@/lib/markdown";
import type { CodeImageTheme } from "@/lib/code-themes";
import { useI18n } from "@/lib/i18n";
import { CodeBlock } from "./code-block";
import { MermaidBlock } from "./mermaid-block";

type ArticlePreviewProps = {
  blocks: ArticleBlock[];
  codeTheme?: CodeImageTheme;
};

/**
 * X Articles reading surface. Rendered with the independent --x-* tokens
 * (measured from the live X editor), never the brand magazine tokens:
 * only article content, zero decorative chrome.
 */
export function ArticlePreview({ blocks, codeTheme }: ArticlePreviewProps) {
  const { t } = useI18n();

  if (blocks.length === 0) {
    return (
      <div
        className="flex min-h-48 items-center justify-center px-6 py-16 text-center text-[14px]"
        style={{ color: "var(--x-muted)" }}
      >
        {t.previewEmpty}
      </div>
    );
  }

  return (
    <article className="x-preview mx-auto w-full max-w-[568px] px-4 py-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
            return (
              <Tag key={index}>
                <InlineContent tokens={block.content} />
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={index}>
                <InlineContent tokens={block.content} />
              </p>
            );
          case "blockquote":
            return (
              <blockquote key={index}>
                <InlineContent tokens={block.content} />
              </blockquote>
            );
          case "list":
            return block.ordered ? (
              <ol key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <InlineContent tokens={item} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <InlineContent tokens={item} />
                  </li>
                ))}
              </ul>
            );
          case "code":
            return (
              <CodeBlock
                key={index}
                code={block.code}
                language={block.language}
                codeTheme={codeTheme}
              />
            );
          case "mermaid":
            return <MermaidBlock key={index} code={block.code} codeTheme={codeTheme} />;
          case "table":
            return (
              <div
                key={index}
                className="overflow-auto rounded-[var(--radius)] border"
                style={{ borderColor: "var(--x-line)" }}
              >
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr>
                      {block.headers.map((header, headerIndex) => (
                        <th
                          key={headerIndex}
                          className="border-b px-3 py-2.5 text-xs font-semibold"
                          style={{ borderColor: "var(--x-line)", color: "var(--x-muted)" }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {block.headers.map((_, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border-b px-3 py-2"
                            style={{ borderColor: "var(--x-line)" }}
                          >
                            {row[cellIndex] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "tweet":
            return (
              <div
                key={index}
                className="rounded-[var(--radius)] border p-4"
                style={{ borderColor: "var(--x-line)" }}
              >
                <p className="text-xs font-medium" style={{ color: "var(--x-muted)" }}>
                  {t.tweetHint}
                </p>
                <a
                  href={block.url}
                  target="_blank"
                  rel="noreferrer"
                  title={block.url}
                  className="mt-2 block break-all text-sm font-medium underline underline-offset-2"
                >
                  {block.url}
                </a>
              </div>
            );
        }
      })}
    </article>
  );
}

function InlineContent({ tokens }: { tokens: InlineToken[] }) {
  return (
    <>
      {tokens.map((token, index) => {
        switch (token.type) {
          case "text":
            return token.text;
          case "strong":
            return <strong key={index} style={{ fontWeight: 700 }}>{token.text}</strong>;
          case "em":
            return <em key={index}>{token.text}</em>;
          case "code":
            // X Articles has no inline-code support — paste degrades to plain text.
            return <span key={index}>{token.text}</span>;
          case "link":
            return (
              <a
                key={index}
                href={token.href}
                target="_blank"
                rel="noreferrer"
                title={token.text || token.href}
              >
                {token.text}
              </a>
            );
          case "image":
            return (
              <img
                key={index}
                src={token.url}
                alt={token.alt}
                className="my-2 max-w-full rounded-[var(--radius)]"
                loading="lazy"
              />
            );
        }
      })}
    </>
  );
}
