import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

/**
 * Manifest PWA — permet au voyageur d'« Ajouter à l'écran d'accueil ».
 * Une fois installé, le livret s'ouvre en plein écran sans la barre
 * d'adresse : sensation d'app native, cohérent avec le positionnement
 * premium (le voyageur a un "concierge" dans sa poche).
 *
 * `display: standalone` + `theme_color` crème = continuité visuelle
 * avec le reste de l'app (pas de flash blanc au lancement).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.productName} — Votre séjour`,
    short_name: "Mon séjour",
    description:
      "Votre livret d'accueil et votre concierge, disponibles 24h/24.",
    start_url: ".",
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: "#faf7f0",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
