import { ImageResponse } from "next/og";

/**
 * Carte d'aperçu OpenGraph (1200×630) — rendue par WhatsApp / iMessage /
 * Slack quand le voyageur reçoit son lien. Objectif : première impression
 * premium AVANT le clic.
 *
 * Palette alignée sur la guest-app (crème + taupe doré), typo serif pour
 * le titre. Statique (pas de fetch) → rapide et fiable côté crawler.
 */
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Votre séjour vous attend";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #faf7f0 0%, #f3edE0 55%, #ece2cf 100%)",
          padding: "80px 90px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(180,145,95,0.35)",
              fontSize: 30,
            }}
          >
            🤍
          </div>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#B4915F",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Votre conciergerie
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 86,
              color: "#1e1c1a",
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Votre séjour vous attend
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#5b554d",
              fontFamily: "Arial, sans-serif",
              maxWidth: 880,
              lineHeight: 1.4,
            }}
          >
            Wifi, accès, recommandations locales et votre concierge 24h/24 —
            tout est prêt.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            color: "#8a8377",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#22c55e",
            }}
          />
          Concierge en ligne · répond en quelques secondes
        </div>
      </div>
    ),
    { ...size },
  );
}
