"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  type UpsellItem,
  computeUpsellTotalCents,
  formatPrice,
} from "@/lib/api";

interface Props {
  token: string;
  items: UpsellItem[];
  stay: { nights: number | null; guests: number | null };
}

/**
 * Teaser "Améliorez votre séjour" placé dans le livret d'accueil.
 *
 * Montre les 3 premiers items du catalogue (déjà triés par sort_order
 * côté backend) avec un aperçu compact + un CTA vers la page complète.
 *
 * Si le catalogue est vide, le composant ne rend RIEN (le parent décide
 * de l'afficher ou non — ici on garde une garde défensive).
 */
export function UpsellsTeaser({ token, items, stay }: Props) {
  if (!items || items.length === 0) return null;

  const preview = items.slice(0, 3);
  const remaining = items.length - preview.length;

  return (
    <section className="max-w-2xl mx-auto px-5 mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-500/15 p-7"
      >
        {/* Halo décoratif */}
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-500 font-medium mb-1.5">
            Exclusivités
          </p>
          <h2 className="text-2xl font-serif font-medium text-stone-900 mb-1">
            Améliorez votre séjour
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed mb-6">
            Quelques attentions sélectionnées pour rendre votre passage
            inoubliable.
          </p>

          <div className="space-y-2.5">
            {preview.map((item) => {
              const total = computeUpsellTotalCents(item, stay);
              return (
                <Link
                  key={item.id}
                  href={`/${token}/upsells`}
                  className="flex items-center gap-4 bg-white/70 hover:bg-white rounded-2xl p-3.5 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl flex-shrink-0 ring-1 ring-stone-200/70">
                    {item.icon ?? "✨"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {item.name}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-stone-900 flex-shrink-0">
                    {formatPrice(total, item.currency)}
                  </span>
                </Link>
              );
            })}
          </div>

          <Link
            href={`/${token}/upsells`}
            className="mt-6 inline-flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-brand-500 text-white text-sm font-medium py-3.5 rounded-2xl transition-colors duration-300"
          >
            {remaining > 0
              ? `Voir les ${items.length} extras`
              : "Découvrir les extras"}
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
