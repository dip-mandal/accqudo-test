import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const baseUrl = "https://accqudo.com";

/**
 * Routes that should NOT appear in the public sitemap.
 *
 * These are private, authentication, API, or user-specific areas.
 */
const EXCLUDED_ROUTES = new Set([
  "/api",
  "/admin",
  "/dashboard",
  "/attempt",
  "/result",
  "/login",
]);

/**
 * Returns true when a folder is a Next.js dynamic/parallel route
 * such as [id], [...slug], [[...slug]], @modal, etc.
 *
 * These routes should not be automatically added to the sitemap
 * because we need their real URLs instead of placeholder URLs.
 */
function isSpecialRouteSegment(segment: string): boolean {
  return (
    segment.startsWith("[") ||
    segment.startsWith("@") ||
    segment.startsWith("(")
  );
}

/**
 * Recursively finds static public pages inside src/app.
 */
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
      // Skip Next.js route groups, parallel routes,
      // and dynamic routes.
      if (isSpecialRouteSegment(file)) {
        continue;
      }

      const nextRoute = `${baseRoute}/${file}`;

      // Skip private routes and everything underneath them.
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

      // Don't include excluded routes.
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

  // Remove duplicates and sort routes.
  const uniquePages = Array.from(new Set(pages)).sort();

  return uniquePages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "/" ? 1.0 : 0.7,
  }));
}