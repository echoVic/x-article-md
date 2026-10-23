import { ImageResponse } from "next/og";
import { getBlogPost } from "@/lib/blog";

export const alt = "MD2X Blog article";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Per-article dynamic OG image: prerendered for every blog slug at build time
// (the page uses generateStaticParams), so each post gets its own 1200x630 card.
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const title = post?.title ?? "MD2X Blog";
  const date = post
    ? new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-start",
          background: "#f7f5ef",
          color: "#111827",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: 72,
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              border: "2px solid #111827",
              borderRadius: 20,
              fontSize: 28,
              fontWeight: 800,
              padding: "12px 20px",
            }}
          >
            MD -&gt; X
          </div>
          <div
            style={{
              color: "#475569",
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            MD2X Blog
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 1000,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: 28,
            }}
          >
            {title}
          </div>
          {date ? (
            <div style={{ color: "#475569", fontSize: 28 }}>{date}</div>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
