import Link from "next/link";
import { brand } from "@/config/brand";

/**
 * Page 404 globale — affichée quand le token guest-app est invalide,
 * expiré, ou révoqué. Pas de détail technique (anti-énumération), juste
 * un message rassurant qui dirige vers la conciergerie.
 */
export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-6">🤍</div>
        <h1 className="text-3xl font-serif font-medium text-stone-900 mb-4">
          Lien introuvable
        </h1>
        <p className="text-base text-stone-600 leading-relaxed mb-8">
          Ce lien n&apos;est plus actif. Si votre séjour est passé, c&apos;est
          normal — les liens expirent peu après le départ.
          <br /><br />
          Si vous attendez encore votre arrivée, contactez votre hôte —
          il vous renverra un nouveau lien.
        </p>
        <a
          href={`mailto:${brand.contact.email}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 text-white text-sm font-medium hover:bg-stone-900 transition-colors"
        >
          Contacter le support
        </a>
      </div>
    </main>
  );
}
