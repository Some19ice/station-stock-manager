import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: ["next-font"],
  experimental: {
    fontLoaders: [
      { loader: "@next/font/google", options: { subsets: ["latin"] } }
    ]
  }
}

export default nextConfig
