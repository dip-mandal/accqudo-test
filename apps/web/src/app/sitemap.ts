import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const baseUrl = "https://accqudo.com";

const EXCLUDED_ROUTES = new Set([
  "/api",
  "/admin",
  "/dashboard",
  "/attempt",
  "/result",
  "/login",
  "/team",
]);

function isSpecialRouteSegment(segment: string): boolean {
  return (
    segment.startsWith("[") ||
    segment.startsWith("@") ||
    segment.startsWith("(")
  );
}

function getPages(dir: string, baseRoute = ""): string[] {
  let routes: string[] = [];

  if (!fs.existsSync(dir)) {
    return routes;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip dynamic routes such as [id],
      // catch-all routes, route groups, and parallel routes.
      if (isSpecialRouteSegment(file)) {
        continue;
      }

      const nextRoute = `${baseRoute}/${file}`;

      // Don't include private sections.
      if (
        EXCLUDED_ROUTES.has(nextRoute) ||
        [...EXCLUDED_ROUTES].some(
          (excluded) =>
            nextRoute.startsWith(`${excluded}/`)
        )
      ) {
        continue;
      }

      routes = routes.concat(
        getPages(filePath, nextRoute)
      );
    } else if (file === "page.tsx") {
      const route = baseRoute || "/";

      // Don't include private pages.
      if (
        EXCLUDED_ROUTES.has(route) ||
        [...EXCLUDED_ROUTES].some(
          (excluded) =>
            route.startsWith(`${excluded}/`)
        )
      ) {
        continue;
      }

      routes.push(route);
    }
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const appDir = path.join(process.cwd(), "src", "app");

  const pages = getPages(appDir);

  const uniquePages = Array.from(
    new Set(pages)
  ).sort();

  return uniquePages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "/" ? 1.0 : 0.7,
  }));
}