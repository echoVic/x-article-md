import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { getBlogPosts } from "@/lib/blog";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildPageMetadata("blog");

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="landing">
      <LandingHeader />
      <main>
        <section className="section">
          <div className="container section-col">
            <div className="section-header">
              <p className="eyebrow">BLOG</p>
              <h1>Articles & Updates</h1>
              <p className="lead">Tutorials, tips, and changelog for MD2X.</p>
            </div>
            <div className="blog-list">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="blog-card"
                >
                  <div className="blog-card-meta">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("en-US", {
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
      <LandingFooter />
    </div>
  );
}
