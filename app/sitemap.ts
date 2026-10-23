import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getBlogPosts } from "@/lib/blog";
import { getAllFeatureLandings } from "@/lib/feature-landing-copy";
import { STATIC_ROUTE_DATES } from "@/lib/sitemap-dates";

// Static route dates are baked strings verified once from git history — see
// lib/sitemap-dates.ts. No `new Date()` without a fixed argument anywhere
// here: the sitemap must stay reproducible across rebuilds.
const homeAlternates = {
  languages: {
    en: absoluteUrl("/"),
    "zh-CN": absoluteUrl("/zh"),
    "x-default": absoluteUrl("/"),
  },
};
const editorAlternates = {
  languages: {
    en: absoluteUrl("/editor"),
    "zh-CN": absoluteUrl("/zh/editor"),
    "x-default": absoluteUrl("/editor"),
  },
};
const threadAlternates = {
  languages: {
    en: absoluteUrl("/thread"),
    "zh-CN": absoluteUrl("/zh/thread"),
    "x-default": absoluteUrl("/thread"),
  },
};
const compareAlternates = {
  languages: {
    en: absoluteUrl("/compare"),
    "zh-CN": absoluteUrl("/zh/compare"),
    "x-default": absoluteUrl("/compare"),
  },
};

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();

  // The blog index's lastModified is the newest post's frontmatter date,
  // never the current clock.
  const newestPostDate = posts.reduce(
    (max, post) => (post.date > max ? post.date : max),
    posts[0]?.date ?? STATIC_ROUTE_DATES.home,
  );

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const featureEntries: MetadataRoute.Sitemap = getAllFeatureLandings().flatMap(
    (def) => {
      const alternates = {
        languages: {
          en: absoluteUrl(`/${def.slug}`),
          "zh-CN": absoluteUrl(`/zh/${def.slug}`),
          "x-default": absoluteUrl(`/${def.slug}`),
        },
      };
      const lastModified = new Date(STATIC_ROUTE_DATES.feature);
      return [
        {
          url: absoluteUrl(`/${def.slug}`),
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates,
        },
        {
          url: absoluteUrl(`/zh/${def.slug}`),
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.7,
          alternates,
        },
      ];
    },
  );

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(STATIC_ROUTE_DATES.home),
      changeFrequency: "weekly",
      priority: 1,
      alternates: homeAlternates,
    },
    {
      url: absoluteUrl("/zh"),
      lastModified: new Date(STATIC_ROUTE_DATES.home),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: homeAlternates,
    },
    {
      url: absoluteUrl("/editor"),
      lastModified: new Date(STATIC_ROUTE_DATES.editor),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: editorAlternates,
    },
    {
      url: absoluteUrl("/zh/editor"),
      lastModified: new Date(STATIC_ROUTE_DATES.editor),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: editorAlternates,
    },
    {
      url: absoluteUrl("/thread"),
      lastModified: new Date(STATIC_ROUTE_DATES.thread),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: threadAlternates,
    },
    {
      url: absoluteUrl("/zh/thread"),
      lastModified: new Date(STATIC_ROUTE_DATES.thread),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: threadAlternates,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: new Date(newestPostDate),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/compare"),
      lastModified: new Date(STATIC_ROUTE_DATES.compare),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: compareAlternates,
    },
    {
      url: absoluteUrl("/zh/compare"),
      lastModified: new Date(STATIC_ROUTE_DATES.compare),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: compareAlternates,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: new Date(STATIC_ROUTE_DATES.privacy),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...featureEntries,
    ...blogEntries,
  ];
}
