import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/applications/nextgen2',
        destination: '/applications/kavacha',
      },
      {
        source: '/applications/nextgen2/:path*',
        destination: '/applications/kavacha/:path*',
      },
    ];
  },
};

export default nextConfig;
