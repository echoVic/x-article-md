import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const lastModified = new Date("2026-06-01");
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
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: editorAlternates,
    },
    {
      url: absoluteUrl("/zh/editor"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: editorAlternates,
    },
    {
      url: absoluteUrl("/thread"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: threadAlternates,
    },
    {
      url: absoluteUrl("/zh/thread"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: threadAlternates,
    },
  ];
}
