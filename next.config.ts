import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  webpack(config, { isServer }) {
    // Adding SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'], // This will transform SVGs into React components
    });

    return config;
  },
  images: {
    // domains: ["encrypted-tbn0.gstatic.com", "res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
