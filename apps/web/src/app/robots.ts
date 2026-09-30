import type { MetadataRoute } from "next";

const BASE_URL = "https://accqudo.com";

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
          "/login/",
          "/team/",
          "/exam/",
        ],
      },
    ],

    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}