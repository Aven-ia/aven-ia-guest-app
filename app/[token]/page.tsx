import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWelcome, getUpsells, ApiError, type UpsellsPayload } from "@/lib/api";
import { GuestHeader } from "@/components/guest-header";
import { InfoCategoryCard } from "@/components/info-category-card";
import { WelcomeHero } from "@/components/welcome-hero";
import { ChatTeaser } from "@/components/chat-teaser";
import { UpsellsTeaser } from "@/components/upsells-teaser";

/**
 * Page principale du livret d'accueil voyageur.
 *
 * Server Component qui fetch les données au SSR — meilleure perf LCP
 * pour mobile + pas de JS pour le contenu statique (juste pour les
 * animations Framer Motion sur les sections interactives).
 *
 * En cas de token invalide/expiré → notFound() qui rend la page 404
 * branded (cf. app/not-found.tsx).
 */

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function GuestLivretPage({ params }: PageProps) {
  const { token } = await params;

  let welcome;
  try {
    welcome = await getWelcome(token);
  } catch (err) {
    // Token invalide / expiré / révoqué OU API down
    if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
      notFound();
    }
    // Autre erreur API (500, network, etc.) — on rend une page d'erreur
    throw err;
  }

  // Catalogue d'upsells — non bloquant : si l'endpoint échoue (ancien
  // backend pas encore déployé, catalogue vide…), on dégrade gracieusement
  // sans casser le livret. Le teaser ne s'affiche que s'il y a des items.
  let upsells: UpsellsPayload | null = null;
  try {
    upsells = await getUpsells(token);
  } catch {
    upsells = null;
  }

  return (
    <>
      <GuestHeader botName={welcome.tenant.botName} />

      <main className="pb-24">
        {/* Hero — photo logement + nom + dates séjour */}
        <WelcomeHero
          property={welcome.property}
          reservation={welcome.reservation}
          tenantName={welcome.tenant.name}
        />

        {/* Infos essentielles (wifi, accès, horaires) toujours en premier */}
        <section className="max-w-2xl mx-auto px-5 -mt-16 relative z-10 space-y-3">
          {welcome.property.wifiCode && (
            <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-2xl flex-shrink-0">
                📶
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Wifi</p>
                <p className="text-base font-medium text-stone-900 font-mono">{welcome.property.wifiCode}</p>
              </div>
            </div>
          )}
          {(welcome.property.checkInTime || welcome.property.checkOutTime) && (
            <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-2xl flex-shrink-0">
                🕒
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Horaires</p>
                <p className="text-sm text-stone-900">
                  Arrivée à partir de <span className="font-medium">{welcome.property.checkInTime ?? "15h"}</span>
                  {welcome.property.checkOutTime && (
                    <> · Départ avant <span className="font-medium">{welcome.property.checkOutTime}</span></>
                  )}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Sections info dynamiques (catégories configurées par le concierge) */}
        {welcome.infoCategories.length > 0 && (
          <section className="max-w-2xl mx-auto px-5 mt-10 space-y-4">
            <h2 className="text-2xl font-serif text-stone-900 font-medium mb-2">
              Votre séjour, en détail
            </h2>
            {welcome.infoCategories.map((cat) => (
              <InfoCategoryCard key={cat.id} category={cat} />
            ))}
          </section>
        )}

        {/* House rules en bas (souvent moins critique) */}
        {welcome.property.houseRules && (
          <section className="max-w-2xl mx-auto px-5 mt-10">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
              <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <span>📋</span> Règles de la maison
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                {welcome.property.houseRules}
              </p>
            </div>
          </section>
        )}

        {/* Extras à la vente — entre les infos et le chat (moment idéal :
            le voyageur a lu son livret, il se projette dans le séjour) */}
        {upsells && upsells.items.length > 0 && (
          <UpsellsTeaser
            token={token}
            items={upsells.items}
            stay={upsells.stayContext}
          />
        )}

        {/* CTA chat IA — toujours présent en bas */}
        <ChatTeaser token={token} botName={welcome.tenant.botName} />
      </main>

      {/* Footer minimaliste */}
      <footer className="border-t border-stone-200 py-8 px-5 text-center">
        <p className="text-xs text-stone-500">
          Une question ? <Link href={`/${token}/chat`} className="text-brand-500 underline">Chattez avec {welcome.tenant.botName}</Link>
        </p>
        <p className="text-[10px] text-stone-400 mt-2">
          Powered by Smart Host · by Aven.ia
        </p>
      </footer>
    </>
  );
}

// Métadonnée dynamique : titre = nom logement (apparaît dans onglet browser)
export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  try {
    const welcome = await getWelcome(token);
    return {
      title: `${welcome.property.name} — Votre séjour`,
    };
  } catch {
    return { title: "Votre séjour" };
  }
}
