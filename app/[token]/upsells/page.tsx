import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getUpsells,
  getWelcome,
  ApiError,
  type UpsellItem,
  type UpsellCategory,
} from "@/lib/api";
import { GuestHeader } from "@/components/guest-header";
import { UpsellCard } from "@/components/upsell-card";

/**
 * Page complète des extras ("Améliorez votre séjour").
 *
 * Server Component : fetch catalogue + welcome en parallèle au SSR.
 * Les items sont groupés par catégorie avec un titre élégant par groupe.
 *
 * Token invalide / expiré → 404 branded.
 */

interface PageProps {
  params: Promise<{ token: string }>;
}

/** Libellés FR + ordre d'affichage des catégories. */
const CATEGORY_META: Record<
  UpsellCategory,
  { label: string; emoji: string; order: number }
> = {
  check_in_out: { label: "Arrivée & départ", emoji: "🕒", order: 1 },
  food_drink: { label: "Gourmandises", emoji: "🥐", order: 2 },
  mobility: { label: "Déplacements", emoji: "🚗", order: 3 },
  experience: { label: "Expériences", emoji: "✨", order: 4 },
  comfort: { label: "Confort", emoji: "🛋️", order: 5 },
  cleaning: { label: "Ménage & linge", emoji: "🧹", order: 6 },
  other: { label: "Autres", emoji: "➕", order: 7 },
};

function groupByCategory(items: UpsellItem[]) {
  const groups = new Map<UpsellCategory, UpsellItem[]>();
  for (const item of items) {
    const arr = groups.get(item.category) ?? [];
    arr.push(item);
    groups.set(item.category, arr);
  }
  return Array.from(groups.entries()).sort(
    (a, b) => CATEGORY_META[a[0]].order - CATEGORY_META[b[0]].order,
  );
}

export default async function UpsellsPage({ params }: PageProps) {
  const { token } = await params;

  let upsells;
  let botName = "votre concierge";
  let propertyName = "votre logement";
  try {
    const [u, welcome] = await Promise.all([
      getUpsells(token),
      getWelcome(token),
    ]);
    upsells = u;
    botName = welcome.tenant.botName;
    propertyName = welcome.property.name;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
      notFound();
    }
    throw err;
  }

  const grouped = groupByCategory(upsells.items);
  const isEmpty = upsells.items.length === 0;

  return (
    <>
      <GuestHeader botName={botName} />

      <main className="pb-24">
        {/* En-tête éditorial */}
        <section className="max-w-2xl mx-auto px-5 pt-8 pb-2">
          <Link
            href={`/${token}`}
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-brand-500 transition-colors mb-6"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour au livret
          </Link>

          <p className="text-xs uppercase tracking-[0.22em] text-brand-500 font-medium mb-2">
            Exclusivités
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-900 leading-tight">
            Améliorez votre séjour
          </h1>
          <p className="text-base text-stone-500 leading-relaxed mt-3">
            Une sélection d&apos;attentions pour profiter pleinement de votre
            passage à {propertyName}.
          </p>
        </section>

        {isEmpty ? (
          <section className="max-w-2xl mx-auto px-5 mt-12">
            <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center">
              <div className="text-5xl mb-4">🤍</div>
              <h2 className="text-xl font-serif font-medium text-stone-900 mb-2">
                Bientôt disponible
              </h2>
              <p className="text-sm text-stone-500 leading-relaxed mb-6">
                {botName} prépare une sélection d&apos;extras pour votre
                séjour. En attendant, n&apos;hésitez pas à demander
                directement.
              </p>
              <Link
                href={`/${token}/chat`}
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-brand-500 text-white text-sm font-medium px-6 py-3 rounded-2xl transition-colors"
              >
                Discuter avec {botName}
              </Link>
            </div>
          </section>
        ) : (
          <div className="max-w-2xl mx-auto px-5 mt-10 space-y-12">
            {grouped.map(([category, items]) => {
              const meta = CATEGORY_META[category];
              return (
                <section key={category}>
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="text-xl">{meta.emoji}</span>
                    <h2 className="text-xl font-serif font-medium text-stone-900">
                      {meta.label}
                    </h2>
                    <span className="text-sm text-stone-400 ml-1">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <UpsellCard
                        key={item.id}
                        item={item}
                        stay={upsells.stayContext}
                        token={token}
                        botName={botName}
                        index={idx}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Rassurance paiement */}
            <p className="text-center text-xs text-stone-400 leading-relaxed px-4">
              Paiement sécurisé via Stripe. Les extras sont confirmés par{" "}
              {botName} dès réception. Une question&nbsp;?{" "}
              <Link
                href={`/${token}/chat`}
                className="text-brand-500 underline"
              >
                Demandez sur le chat
              </Link>
              .
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 py-8 px-5 text-center">
        <p className="text-[10px] text-stone-400">
          Powered by Smart Host · by Aven.ia
        </p>
      </footer>
    </>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  try {
    const welcome = await getWelcome(token);
    return {
      title: `Améliorez votre séjour — ${welcome.property.name}`,
    };
  } catch {
    return { title: "Améliorez votre séjour" };
  }
}
