import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const BASE_URL = "https://accqudo.com";

const EXCLUDED_ROUTES = new Set([
  "/api",
  "/admin",
  "/dashboard",
  "/attempt",
  "/result",
  "/login",
  "/team",
  "/exam",
]);

function isSpecialRouteSegment(segment: string): boolean {
  return (
    segment.startsWith("[") ||
    segment.startsWith("@") ||
    segment.startsWith("(")
  );
}

function isExcludedRoute(route: string): boolean {
  if (EXCLUDED_ROUTES.has(route)) {
    return true;
  }

  for (const excluded of EXCLUDED_ROUTES) {
    if (route.startsWith(`${excluded}/`)) {
      return true;
    }
  }

  return false;
}

interface StaticPage {
  route: string;
  filePath: string;
}

function getStaticPages(
  dir: string,
  baseRoute = ""
): StaticPage[] {
  const pages: StaticPage[] = [];

  if (!fs.existsSync(dir)) {
    return pages;
  }

  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const name = entry.name;

    if (name.startsWith(".")) {
      continue;
    }

    const filePath = path.join(dir, name);

    if (entry.isDirectory()) {
      /*
       * Dynamic routes such as:
       *
       * [id]
       * [slug]
       * [...slug]
       * [[...slug]]
       *
       * are intentionally skipped here.
       *
       * Their URLs should come from the database/public catalog,
       * not from filesystem discovery.
       */
      if (isSpecialRouteSegment(name)) {
        continue;
      }

      const nextRoute =
        baseRoute === ""
          ? `/${name}`
          : `${baseRoute}/${name}`;

      if (isExcludedRoute(nextRoute)) {
        continue;
      }

      pages.push(
        ...getStaticPages(filePath, nextRoute)
      );

      continue;
    }

    if (name !== "page.tsx") {
      continue;
    }

    const route = baseRoute || "/";

    if (isExcludedRoute(route)) {
      continue;
    }

    pages.push({
      route,
      filePath,
    });
  }

  return pages;
}

function getLastModified(
  filePath: string
): Date | undefined {
  try {
    return fs.statSync(filePath).mtime;
  } catch {
    return undefined;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const appDir = path.join(
    process.cwd(),
    "src",
    "app"
  );

  const pages = getStaticPages(appDir);

  const uniquePages = new Map<
    string,
    StaticPage
  >();

  for (const page of pages) {
    uniquePages.set(page.route, page);
  }

  return Array.from(uniquePages.values())
    .sort((a, b) => {
      if (a.route === "/") return -1;
      if (b.route === "/") return 1;

      return a.route.localeCompare(b.route);
    })
    .map((page) => {
      const lastModified = getLastModified(
        page.filePath
      );

      return {
        url:
          page.route === "/"
            ? BASE_URL
            : `${BASE_URL}${page.route}`,

        ...(lastModified
          ? {
              lastModified,
            }
          : {}),
      };
    });
}