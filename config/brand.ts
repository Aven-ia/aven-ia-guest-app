/**
 * BRAND CONFIG — Guest Web App.
 *
 * Cohérent avec la landing (config/brand.ts du repo aven-ia-landing).
 * Le branding voyageur est DIFFÉRENT du branding commercial :
 *
 *   - Landing : luxe / Apple / Tesla → noir + or
 *   - Guest App : chaleur / hospitalité / accueil → tons crèmes + accent doux
 *
 * Le voyageur n'achète rien (il est déjà venu), il vit une expérience.
 * Le design doit ÊTRE chaleureux, pas vendre.
 */

export const brand = {
  productName: "Smart Host",
  companyName: "Aven.ia",

  url: {
    landing: "https://smarthost.aven-ia.com",
    app:     "https://app.aven-ia.com",
    guest:   "https://guest.aven-ia.com",
  },

  contact: {
    email: "contact@aven-ia.com",
  },

  /**
   * Palette voyageur — chaleureuse et premium.
   * - brand-50/100  : tons crèmes (bg sections)
   * - brand-500     : accent doux (taupe doré, boutons, links)
   * - brand-600/700 : texte (noir profond)
   *
   * Inspiration : Airbnb Plus + boutique hôtel.
   */
  colors: {
    "brand-50":  "250 247 240", // crème très clair (bg)
    "brand-100": "243 237 224", // crème un peu plus saturé
    "brand-500": "180 145 95",  // taupe doré (accent)
    "brand-600": "30 28 26",    // noir profond (texte principal)
    "brand-700": "10 10 10",    // pure black (titres)
  },
} as const;
