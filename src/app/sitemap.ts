import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const siteUrl = SITE_URL;

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
