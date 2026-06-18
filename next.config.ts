import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
  turbopack: {},
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.markdown2x.com",
          },
        ],
        destination: "https://markdown2x.com/:path*",
        permanent: true,
      },
      {
        source: "/markdown-to-x-articles",
        destination: "/blog/markdown-to-x-articles",
        permanent: true,
      },
      {
        source: "/paste-code-into-x-articles",
        destination: "/blog/paste-code-into-x-articles",
        permanent: true,
      },
      {
        source: "/mermaid-in-x-articles",
        destination: "/blog/mermaid-in-x-articles",
        permanent: true,
      },
    ];
  },
};

export default withSerwist(nextConfig);
