"use client";

import Link from "next/link";

/**
 * Header voyageur minimaliste — affiche le nom de l'IA / conciergerie
 * pour rappeler "vous êtes accompagné".
 */
export function GuestHeader({ botName }: { botName: string }) {
  return (
    <header className="sticky top-0 z-40 bg-brand-50/90 backdrop-blur-md border-b border-stone-200/60">
      <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="./" className="text-sm font-serif font-medium text-stone-900">
          Votre séjour
        </Link>
        <p className="text-xs text-stone-500">
          Accompagné par <span className="font-medium text-stone-700">{botName}</span>
        </p>
      </div>
    </header>
  );
}
