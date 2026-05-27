import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://skillcirqle.com",
      lastModified: new Date(),
    },
    {
      url: "https://skillcirqle.com/auth",
      lastModified: new Date(),
    },
  ];
}