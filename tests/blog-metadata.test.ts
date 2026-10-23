import { describe, expect, it } from "vitest";
import { generateMetadata } from "@/app/(en)/blog/[slug]/page";
import { getAllSlugs, getBlogPost } from "@/lib/blog";

describe("blog post metadata", () => {
  it.each(getAllSlugs())(
    "derives per-post OpenGraph/Twitter metadata for %s",
    async (slug) => {
      const meta = await generateMetadata({
        params: Promise.resolve({ slug }),
      });
      const post = getBlogPost(slug);
      if (!post) throw new Error(`missing post ${slug}`);

      expect(meta.title).toBe(`${post.title} | MD2X Blog`);
      expect(meta.alternates?.canonical).toBe(`/blog/${slug}`);

      expect(meta.openGraph?.title).toBe(post.title);
      expect(meta.openGraph?.description).toBe(post.description);
      const og = meta.openGraph as {
        type?: string;
        publishedTime?: string;
      } | null;
      expect(og?.type).toBe("article");
      expect(og?.publishedTime).toBe(post.date);

      const twitter = meta.twitter as {
        card?: string;
        title?: string;
        description?: string;
        images?: string[];
      } | null;
      expect(twitter?.card).toBe("summary_large_image");
      expect(twitter?.title).toBe(post.title);
      expect(twitter?.description).toBe(post.description);
      // Per-post 1200x630 dynamic image, not the homepage fallback.
      expect(twitter?.images).toEqual([`/blog/${slug}/opengraph-image`]);
    },
  );
});
