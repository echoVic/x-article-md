import type { ArticleBlock, InlineToken } from "@/lib/markdown";
import type { CodeImageTheme } from "@/lib/code-themes";
import { CodeBlock } from "./code-block";
import { MermaidBlock } from "./mermaid-block";

type ArticlePreviewProps = {
  blocks: ArticleBlock[];
  codeTheme?: CodeImageTheme;
};

export function ArticlePreview({ blocks, codeTheme }: ArticlePreviewProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed border-[var(--border)] px-8 py-12 text-center">
        <span
          className="text-[var(--muted)]"
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "10.5px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Live Preview
        </span>
        <span
          className="text-[var(--fg)]"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "22px",
            lineHeight: 1.3,
          }}
        >
          开始编写 Markdown，即可看到样张。
        </span>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-[680px] space-y-7 text-[var(--fg)]">
      <div className="border-b border-[var(--border)] pb-5">
        <div className="font-[var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
          X Articles proof
        </div>
        <p
          className="mt-3 text-[var(--fg)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            fontStyle: "italic",
            lineHeight: 1.18,
          }}
        >
          This is the reading surface — trim friction, keep cadence, and let each block breathe.
        </p>
      </div>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
            const size =
              block.level === 1
                ? "text-[28px] leading-[1.2] tracking-[-0.02em]"
                : block.level === 2
                  ? "text-[22px] leading-[1.25] tracking-[-0.01em]"
                  : block.level === 3
                    ? "text-[18px] leading-[1.3]"
                    : block.level === 4
                      ? "text-[16px] leading-[1.35]"
                      : block.level === 5
                        ? "text-[14px] leading-[1.4]"
                        : "text-[13px] leading-[1.4]";

            return (
              <Tag
                key={index}
                className={`${size} ${block.level <= 2 ? "font-normal" : "font-semibold"}`}
                style={
                  block.level <= 2
                    ? {
                        fontFamily: "var(--font-display)",
                        letterSpacing: block.level === 1 ? "-0.028em" : "-0.02em",
                      }
                    : undefined
                }
              >
                <InlineContent tokens={block.content} />
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={index} className="text-[17px] leading-[1.85] text-[color-mix(in_oklch,var(--fg)_92%,transparent)]">
                <InlineContent tokens={block.content} />
              </p>
            );
          case "blockquote":
            return (
              <blockquote
                key={index}
                className="border-y border-[var(--border)] py-4 pl-5 text-[16px] leading-[1.8] text-[var(--muted)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                }}
              >
                <InlineContent tokens={block.content} />
              </blockquote>
            );
          case "list":
            return block.ordered ? (
              <ol
                key={index}
                className="list-decimal space-y-3 pl-6 text-[17px] leading-[1.8] marker:text-[var(--accent)]"
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <InlineContent tokens={item} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul
                key={index}
                className="list-disc space-y-3 pl-6 text-[17px] leading-[1.8] marker:text-[var(--accent)]"
              >
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
              <div key={index} className="overflow-auto rounded-[var(--radius)] border border-[var(--border)] bg-[color-mix(in_oklch,var(--surface)_84%,transparent)]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr>
                      {block.headers.map((header, headerIndex) => (
                        <th
                          key={headerIndex}
                          className="border-b border-[var(--border)] bg-[var(--fg-soft)] px-3 py-2.5 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="transition-colors hover:bg-[var(--fg-soft)]">
                        {block.headers.map((_, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border-b border-[var(--border)] px-3 py-2 text-[13px] font-mono tabular-nums"
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
                className="rounded-[var(--radius)] border border-dashed border-[var(--muted)] bg-[var(--fg-soft)] p-4"
              >
                <p className="text-xs font-medium text-[var(--muted)]">
                  Tweet embed
                </p>
                <a
                  href={block.url}
                  target="_blank"
                  rel="noreferrer"
                  title={block.url}
                  className="mt-2 block break-all text-sm font-medium text-[var(--accent)] underline decoration-[var(--accent-soft)] underline-offset-4"
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
            return <strong key={index} className="font-semibold">{token.text}</strong>;
          case "em":
            return <em key={index} className="italic">{token.text}</em>;
          case "code":
            return (
              <code
                key={index}
                className="rounded-[var(--radius-xs)] bg-[var(--fg-soft)] px-1.5 py-0.5 font-mono text-[0.88em]"
              >
                {token.text}
              </code>
            );
          case "link":
            return (
              <a
                key={index}
                href={token.href}
                className="font-medium text-[var(--accent)] underline decoration-[var(--accent-soft)] underline-offset-3"
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
                className="max-w-full h-auto rounded-[var(--radius)]"
                loading="lazy"
              />
            );
        }
      })}
    </>
  );
}
