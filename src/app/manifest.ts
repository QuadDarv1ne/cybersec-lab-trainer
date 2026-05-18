import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CyberSec Lab — Тренажёр по информационной безопасности",
    short_name: "CyberSec Lab",
    description:
      "Интерактивная платформа для изучения уязвимостей веб-приложений",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e1b4b",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/security-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
