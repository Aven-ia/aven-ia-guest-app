/**
 * Skeleton de chargement du livret — affiché pendant le fetch SSR
 * (welcome + upsells). Reprend la silhouette réelle de la page (hero +
 * cards) pour un chargement perçu fluide, sans saut de layout.
 *
 * Pur CSS (animate-pulse Tailwind), zéro JS — s'affiche instantanément.
 */
export default function LivretLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero */}
      <div className="relative aspect-[3/4] sm:aspect-[16/9] max-h-[600px] bg-gradient-to-br from-stone-200 to-stone-300">
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="h-3 w-24 bg-white/40 rounded" />
            <div className="h-9 w-2/3 bg-white/50 rounded-lg" />
            <div className="h-4 w-32 bg-white/40 rounded" />
          </div>
        </div>
      </div>

      {/* Cards infos qui chevauchent le hero */}
      <div className="max-w-2xl mx-auto px-5 -mt-16 relative z-10 space-y-3">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-stone-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-16 bg-stone-200 rounded" />
              <div className="h-4 w-40 bg-stone-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="max-w-2xl mx-auto px-5 mt-10 space-y-4">
        <div className="h-7 w-56 bg-stone-200 rounded-lg mb-2" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-200" />
            <div className="h-4 w-44 bg-stone-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
