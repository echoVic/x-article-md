import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const lastModified = new Date("2026-05-31");
const homeAlternates = {
  languages: {
    en: absoluteUrl("/"),
    "zh-CN": absoluteUrl("/zh"),
    "x-default": absoluteUrl("/"),
  },
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: homeAlternates,
    },
    {
      url: absoluteUrl("/zh"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: homeAlternates,
    },
    {
      url: absoluteUrl("/editor"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
