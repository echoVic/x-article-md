import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { mdxComponents } from "@/components/mdx-components";
import { getAllSlugs, getBlogPost, getBlogPosts } from "@/lib/blog";
import { buildArticleJsonLd, siteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | MD2X Blog`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const posts = getBlogPosts();
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
            buildArticleJsonLd({
              title: post.title,
              description: post.description,
              date: post.date,
              slug: post.slug,
            })
          ),
        }}
      />
      <LandingHeader />
      <main>
        <article className="section">
          <div className="container blog-prose">
            <div className="blog-post-header">
              <Link href="/blog" className="blog-back">
                ← Back to Blog
              </Link>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
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
                <Link href={`/blog/${prev.slug}`} className="blog-nav-link">
                  ← {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/blog/${next.slug}`} className="blog-nav-link blog-nav-next">
                  {next.title} →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
