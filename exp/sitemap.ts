// src/app/sitemap.ts

import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const baseUrl = "https://accqudo.com";

function getPages(dir: string, baseRoute = ""): string[] {
  let routes: string[] = [];

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      routes = routes.concat(
        getPages(filePath, `${baseRoute}/${file}`)
      );
    } else if (file === "page.tsx") {
      routes.push(baseRoute || "/");
    }
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const appDir = path.join(process.cwd(), "src", "app");

  const pages = getPages(appDir);

  return pages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1.0 : 0.7,
  }));
}