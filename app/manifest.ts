import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Barber HK",
    short_name: "Barber HK",
    description: "A bilingual brief to show a Hong Kong men's barber.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4efe6",
    theme_color: "#1c1915",
    lang: "en",
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
