import type { NextConfig } from "next";

const svgrOptions: Record<string, unknown> = {
  icon: true,
  svgoConfig: {
    plugins: [
      { name: "removeAttrs", params: { attrs: "(fill|stroke)" } },
      {
        name: "addAttributesToSVGElement",
        params: {
          attributes: [{ fill: "currentColor" }, { stroke: "currentColor" }],
        },
      },
    ],
  },
};

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "jzukocvsoupnmwfiradk.supabase.co" },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: svgrOptions as any,
          },
        ],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: svgrOptions,
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
