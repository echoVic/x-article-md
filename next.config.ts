import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "markdown2x.com",
          },
        ],
        destination: "https://www.markdown2x.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
