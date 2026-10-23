import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { mdxComponents } from "@/components/mdx-components";
import { getAllZhSlugs, getZhBlogPost, getZhBlogPosts } from "@/lib/blog";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllZhSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getZhBlogPost(slug);
  if (!post) return {};

  // Every Chinese post is a translation of an English original at /blog/<slug>.
  return {
    title: `${post.title} | MD2X 博客`,
    description: post.description,
    alternates: {
      canonical: `/zh/blog/${slug}`,
      languages: {
        en: `/blog/${slug}`,
        "zh-CN": `/zh/blog/${slug}`,
        "x-default": `/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `/zh/blog/${slug}`,
      siteName: "MD2X",
      locale: "zh-CN",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`/zh/blog/${slug}/opengraph-image`],
    },
  };
}

export default async function ZhBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getZhBlogPost(slug);
  if (!post) notFound();

  const posts = getZhBlogPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  const prev = idx < posts.length - 1 ? posts[idx + 1] : null;
  const next = idx > 0 ? posts[idx - 1] : null;

  return (
    <div className="landing">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildArticleJsonLd(
              {
                title: post.title,
                description: post.description,
                date: post.date,
                slug: post.slug,
              },
              { locale: "zh" },
            ),
          ),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd([
              { name: "MD2X", path: "/zh" },
              { name: "博客", path: "/zh/blog" },
              { name: post.title, path: `/zh/blog/${post.slug}` },
            ]),
          ),
        }}
      />
      <LandingHeader locale="zh" />
      <main>
        <article className="section">
          <div className="container blog-prose">
            <h1 className="blog-post-title">{post.title}</h1>
            <div className="blog-post-header">
              <Link href="/zh/blog" className="blog-back">
                ← 返回博客
              </Link>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
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
            <MDXRemote source={post.content} components={mdxComponents} />
            <nav className="blog-nav">
              {prev ? (
                <Link href={`/zh/blog/${prev.slug}`} className="blog-nav-link">
                  ← {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/zh/blog/${next.slug}`} className="blog-nav-link blog-nav-next">
                  {next.title} →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          </div>
        </article>
      </main>
      <LandingFooter locale="zh" />
    </div>
  );
}
