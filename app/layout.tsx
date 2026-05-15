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

const DESCRIPTION =
  "Tout ce qu'il faut savoir pour votre séjour. Wifi, accès, recommandations locales — votre concierge personnel vous accompagne 24h/24.";

export const metadata: Metadata = {
  title: `Votre séjour | ${brand.productName}`,
  description: DESCRIPTION,
  applicationName: "Mon séjour",
  // Empêche les pages voyageur d'être indexées Google
  // (ce sont des URLs privées par réservation, pas du contenu public)
  robots: { index: false, follow: false },
  // iOS : ouverture plein écran « app native » depuis l'écran d'accueil.
  appleWebApp: {
    capable: true,
    title: "Mon séjour",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  // OpenGraph : quand le voyageur reçoit le lien par WhatsApp/SMS/iMessage,
  // une carte d'aperçu branded s'affiche → première impression premium
  // AVANT même le clic (opengraph-image.tsx fournit le visuel).
  openGraph: {
    title: "Votre séjour vous attend",
    description: DESCRIPTION,
    type: "website",
    locale: "fr_FR",
    siteName: brand.productName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Votre séjour vous attend",
    description: DESCRIPTION,
  },
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
