import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/#dashboard",
    "/#sql-injection",
    "/#xss",
    "/#csrf",
    "/#auth",
    "/#secure-coding",
    "/#tools",
    "/#security-headers",
    "/#quiz",
    "/#achievements",
    "/#owasp",
    "/auth/signin",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "monthly" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
