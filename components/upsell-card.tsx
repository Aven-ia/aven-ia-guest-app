"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  type UpsellItem,
  computeUpsellTotalCents,
  formatPrice,
  unitLabel,
  trackUpsell,
} from "@/lib/api";

interface Props {
  item: UpsellItem;
  stay: { nights: number | null; guests: number | null };
  token: string;
  botName: string;
  /** Index pour le délai d'animation en cascade. */
  index?: number;
}

/**
 * Carte premium d'un extra vendable.
 *
 * Deux états de CTA :
 *   • `stripePaymentLink` présent → bouton "Réserver" qui ouvre le
 *     Payment Link Stripe du concierge dans un nouvel onglet.
 *   • absent → bouton "Demander à {botName}" qui renvoie vers le chat
 *     IA avec un message pré-rempli (le concierge gère manuellement).
 *
 * Pour les items `per_day` / `per_person`, on affiche le prix unitaire
 * ET le total estimé pour le séjour (calculé côté client à partir du
 * stayContext renvoyé par le backend — zéro aller-retour).
 */
export function UpsellCard({ item, stay, token, botName, index = 0 }: Props) {
  const totalCents = computeUpsellTotalCents(item, stay);
  const isMultiplied =
    item.unit !== "per_stay" && totalCents !== item.priceCents;

  const purchasable = Boolean(item.stripePaymentLink);

  // Message pré-rempli pour le chat si l'item n'a pas de Payment Link.
  const chatHref = `/${token}/chat?q=${encodeURIComponent(
    `Bonjour ${botName}, je souhaite réserver : ${item.name}`,
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4) }}
      className="group relative bg-white rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-xl hover:border-brand-500/30 transition-all duration-300 overflow-hidden"
    >
      {/* Liseré doré subtil au hover */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Visuel : image hi-res si dispo, sinon emoji dans cercle crème */}
          {item.imageUrl ? (
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-stone-200">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center text-3xl flex-shrink-0 ring-1 ring-brand-500/10">
              {item.icon ?? "✨"}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-serif font-medium text-stone-900 leading-snug">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-sm text-stone-500 leading-relaxed mt-1.5">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Prix + CTA */}
        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-medium text-stone-900 tracking-tight">
                {formatPrice(item.priceCents, item.currency)}
              </span>
              {unitLabel(item.unit) && (
                <span className="text-sm text-stone-400">
                  {unitLabel(item.unit)}
                </span>
              )}
            </div>
            {isMultiplied && (
              <p className="text-xs text-brand-500 font-medium mt-0.5">
                Soit {formatPrice(totalCents, item.currency)} pour votre séjour
              </p>
            )}
          </div>

          {purchasable ? (
            <a
              href={item.stripePaymentLink!}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackUpsell(token, item.id, "clicked")}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-stone-900 hover:bg-brand-500 text-white text-sm font-medium px-5 py-3 rounded-2xl transition-colors duration-300"
            >
              Réserver
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
            </a>
          ) : (
            <Link
              href={chatHref}
              onClick={() => trackUpsell(token, item.id, "requested")}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-brand-100 hover:bg-brand-500 hover:text-white text-stone-700 text-sm font-medium px-5 py-3 rounded-2xl transition-colors duration-300"
            >
              Demander
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
          )}
        </div>
      </div>
    </motion.div>
  );
}
