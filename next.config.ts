import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // Photos voyageur (logements) — viendront soit de Supabase Storage
  // (assets uploadés par les concierges), soit d'Unsplash en placeholder.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com",      pathname: "/**" },
      { protocol: "https", hostname: "fszajjwvvnsgwcozkitz.supabase.co", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Headers de sécurité — Guest App = page publique mais sensible
  // (contient infos résa, codes wifi, etc.). On verrouille tout ce qui
  // peut être verrouillé sans casser les fonctionnalités.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
