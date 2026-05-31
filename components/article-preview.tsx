import type { ArticleBlock, InlineToken } from "@/lib/markdown";
import { CodeBlock } from "./code-block";
import { MermaidBlock } from "./mermaid-block";

type ArticlePreviewProps = {
  blocks: ArticleBlock[];
};

export function ArticlePreview({ blocks }: ArticlePreviewProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-md border border-dashed border-[#cfd9de] text-sm text-[#536471]">
        Start writing Markdown to see the article preview.
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-[720px] space-y-6 text-[#0f1419]">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const Tag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : "h3";
            const size =
              block.level === 1
                ? "text-3xl leading-tight"
                : block.level === 2
                  ? "text-2xl leading-snug"
                  : "text-xl leading-snug";

            return (
              <Tag key={index} className={`${size} font-bold tracking-normal`}>
                <InlineContent tokens={block.content} />
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={index} className="text-[17px] leading-8 text-[#0f1419]">
                <InlineContent tokens={block.content} />
              </p>
            );
          case "list":
            return block.ordered ? (
              <ol
                key={index}
                className="list-decimal space-y-2 pl-6 text-[17px] leading-8"
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
                className="list-disc space-y-2 pl-6 text-[17px] leading-8"
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
              />
            );
          case "mermaid":
            return <MermaidBlock key={index} code={block.code} />;
          case "table":
            return (
              <div key={index} className="overflow-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr>
                      {block.headers.map((header, headerIndex) => (
                        <th
                          key={headerIndex}
                          className="border border-[#cfd9de] bg-[#eef2f5] px-3 py-2 font-semibold"
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
                            className="border border-[#cfd9de] px-3 py-2"
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
                className="rounded-md border border-dashed border-[#8aa3b1] bg-[#f7fafb] p-4"
              >
                <p className="text-sm font-semibold text-[#536471]">
                  Tweet embed candidate
                </p>
                <a
                  href={block.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-sm font-medium text-[#1d9bf0] underline decoration-[#8ecdf8] underline-offset-4"
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
            return <strong key={index}>{token.text}</strong>;
          case "code":
            return (
              <code
                key={index}
                className="rounded bg-[#eef2f5] px-1.5 py-0.5 font-mono text-[0.92em]"
              >
                {token.text}
              </code>
            );
          case "link":
            return (
              <a
                key={index}
                href={token.href}
                className="font-medium text-[#1d9bf0] underline decoration-[#8ecdf8] underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                {token.text}
              </a>
            );
        }
      })}
    </>
  );
}
