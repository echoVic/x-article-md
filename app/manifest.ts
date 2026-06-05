import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MD2X - Markdown to X Articles",
    short_name: "MD2X",
    description:
      "Convert Markdown to X Articles rich text with code blocks, tables, diagrams, and cover images.",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
