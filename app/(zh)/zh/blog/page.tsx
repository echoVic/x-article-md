import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { getZhBlogPosts } from "@/lib/blog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Markdown 转 X Articles 教程 | MD2X 博客",
  description: "用 MD2X 把 Markdown 转成 X Articles 的教程、代码截图、Mermaid 图表与表格，以及 Twitter/X 推文流。",
  alternates: {
    canonical: "/zh/blog",
    languages: {
      en: "/blog",
      "zh-CN": "/zh/blog",
      "x-default": "/blog",
    },
  },
  openGraph: {
    title: "Markdown 转 X Articles 教程 | MD2X 博客",
    description: "用 MD2X 把 Markdown 转成 X Articles 的教程、代码截图、Mermaid 图表与表格。",
    url: "/zh/blog",
    siteName: "MD2X",
    locale: "zh-CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown 转 X Articles 教程 | MD2X 博客",
    description: "用 MD2X 把 Markdown 转成 X Articles 的教程与技巧。",
  },
};

export default function ZhBlogPage() {
  const posts = getZhBlogPosts();

  return (
    <div className="landing">
      <LandingHeader locale="zh" />
      <main>
        <section className="section">
          <div className="container section-col">
            <div className="section-header">
              <p className="eyebrow">BLOG · 博客</p>
              <h1>教程与更新</h1>
              <p className="lead">关于 MD2X 的教程、技巧与更新日志。</p>
            </div>
            <div className="blog-list">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/zh/blog/${post.slug}`}
                  className="blog-card"
                >
                  <div className="blog-card-meta">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <div className="blog-card-tags">
                      {post.tags.map((tag) => (
                        <span key={tag} className="blog-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <LandingFooter locale="zh" />
    </div>
  );
}
