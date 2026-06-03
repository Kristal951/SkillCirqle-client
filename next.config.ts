import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ["res.cloudinary.com", "ui-avatars.com", "images.unsplash.com"],
  },
};

export default nextConfig;
