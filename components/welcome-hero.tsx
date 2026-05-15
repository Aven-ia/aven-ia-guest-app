"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface Props {
  property: {
    name: string;
    city: string | null;
    imageUrl: string | null;
  };
  reservation: {
    checkIn: string | null;
    checkOut: string | null;
    guestName: string | null;
  };
  tenantName: string;
}

/**
 * Hero voyageur — photo logement en background grand format, infos
 * essentielles (nom voyageur, nom logement, dates séjour) overlay au-dessus.
 *
 * Mobile-first : aspect-[3/4] sur mobile (image plus haute), passe en
 * aspect-[16/9] sur desktop pour ne pas dominer l'écran.
 */
export function WelcomeHero({ property, reservation, tenantName }: Props) {
  // Format dates joli ("Sam 15 mai → Mar 18 mai")
  const formatDateShort = (iso: string | null) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
    } catch {
      return iso;
    }
  };

  return (
    <section className="relative aspect-[3/4] sm:aspect-[16/9] max-h-[600px] overflow-hidden">
      {/* Image background */}
      {property.imageUrl ? (
        <Image
          src={property.imageUrl}
          alt={property.name}
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        // Fallback élégant si pas de photo logement uploadée par le concierge
        <div className="absolute inset-0 bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900" />
      )}

      {/* Overlay sombre pour la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-transparent" />

      {/* Content overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white">
        <div className="max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs uppercase tracking-[0.2em] text-white/70 mb-2"
          >
            Bienvenue {reservation.guestName ? `${reservation.guestName.split(" ")[0]}` : ""}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-serif font-medium leading-tight"
          >
            {property.name}
          </motion.h1>
          {property.city && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-sm text-white/80 mt-1"
            >
              {property.city}
            </motion.p>
          )}
          {(reservation.checkIn || reservation.checkOut) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-white/90"
            >
              <span>{formatDateShort(reservation.checkIn)}</span>
              <span className="text-white/50">→</span>
              <span>{formatDateShort(reservation.checkOut)}</span>
              <span className="text-white/50 mx-2">·</span>
              <span className="text-white/60">par {tenantName}</span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
