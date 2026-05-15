import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { brand } from "@/config/brand";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: `Votre séjour | ${brand.productName}`,
  description: "Tout ce qu'il faut savoir pour votre séjour. Wifi, accès, recommandations locales — votre concierge personnel vous accompagne 24h/24.",
  // Empêche les pages voyageur d'être indexées Google
  // (ce sont des URLs privées par réservation, pas du contenu public)
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // accessibilité : laisser zoomer
  themeColor: "#faf7f0", // bg crème = couleur de la barre adresse mobile
};

function brandToCssVars(): string {
  return Object.entries(brand.colors)
    .map(([key, val]) => `--${key}: ${val};`)
    .join(" ");
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <style id="brand-vars">{`:root { ${brandToCssVars()} }`}</style>
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
