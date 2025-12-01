import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  devIndicators: false,

  turbopack: {
    root: process.cwd()
  },

  reactStrictMode: true,

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "recharts",
      "date-fns"
    ],
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: ["localhost:3000"]
    }
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true
    }
  },

  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 10
            },
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              name: "ui",
              priority: 20
            },
            charts: {
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              name: "charts",
              priority: 20
            },
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true
            }
          }
        }
      }
    }

    return config
  },

  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate"
          }
        ]
      }
    ]
  },

  compress: true,
  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: false
  }
}

export default nextConfig
