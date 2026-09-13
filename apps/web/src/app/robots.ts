import type { MetadataRoute } from "next";

const baseUrl = "https://accqudo.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/attempt/",
          "/result/",
          "/tests/",
          "/login/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}