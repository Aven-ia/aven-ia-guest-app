import { brand } from "@/config/brand";

/**
 * Page racine "/" — visitée quand quelqu'un tape juste guest.aven-ia.com
 * sans token. État dégradé propre : on explique pourquoi il n'y a rien
 * à voir ici et on redirige vers la landing publique.
 *
 * 99% des visiteurs réels arrivent directement sur /[token] via le lien
 * WhatsApp/SMS envoyé à leur réservation. Cette page racine est juste un
 * filet de sécurité (et un peu de SEO friendly fallback).
 */
export default function RootPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-6">🔑</div>
        <h1 className="text-3xl font-serif font-medium text-stone-900 mb-4">
          Votre lien personnel est unique
        </h1>
        <p className="text-base text-stone-600 leading-relaxed mb-8">
          Cette page nécessite le lien que votre conciergerie vous a envoyé par SMS ou WhatsApp.
          Vérifiez votre messagerie ou contactez votre hôte.
        </p>
        <a
          href={brand.url.landing}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 text-white text-sm font-medium hover:bg-stone-900 transition-colors"
        >
          Visiter {brand.productName}
        </a>
      </div>
    </main>
  );
}
