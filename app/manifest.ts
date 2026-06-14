import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zap Score Tracker",
    short_name: "Zap",
    description: "Track scores for the card game Zap.",
    start_url: "/",
    display: "standalone",
    background_color: "#26221a",
    theme_color: "#26221a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  }
}
