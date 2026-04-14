import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "www.figma.com",
  //       pathname: "/api/mcp/asset/**",
  //     },
  //   ],
  // },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "production"
            ? "https://airport-parking-topaz.vercel.app/api/:path*"
            : "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
