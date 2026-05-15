/**
 * API client pour le backend Smart Host (Guest App endpoints).
 *
 * Tous les appels passent par /guest-app/{token}/* avec le token URL.
 * Pas d'auth header — le token EST l'authentification.
 *
 * Variable d'environnement attendue :
 *   NEXT_PUBLIC_API_URL — URL du backend NestJS Railway
 *   (ex: https://api.aven-ia.com ou https://smart-host-v2-production.up.railway.app)
 *
 * Fallback localhost:3000 pour le dev local.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ── Types ───────────────────────────────────────────────────────────────────

export interface WelcomePayload {
  property: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    imageUrl: string | null;
    wifiCode: string | null;
    houseRules: string | null;
    checkInTime: string | null;
    checkOutTime: string | null;
  };
  reservation: {
    id: string | null;
    checkIn: string | null;
    checkOut: string | null;
    guestName: string | null;
  };
  tenant: {
    name: string;
    botName: string;
  };
  infoCategories: Array<{
    id: string;
    name: string;
    icon: string;
    items: Array<{ title: string; content: string }>;
  }>;
}

export interface ConversationPayload {
  conversationId: string | null;
  messages: Array<{
    id: string;
    role: "guest" | "bot" | "human";
    content: string;
    createdAt: string;
  }>;
}

export type UpsellCategory =
  | "check_in_out"
  | "cleaning"
  | "mobility"
  | "food_drink"
  | "experience"
  | "comfort"
  | "other";

export type UpsellUnit = "per_stay" | "per_day" | "per_person";

export interface UpsellItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  category: UpsellCategory;
  priceCents: number;
  currency: "EUR" | "USD" | "GBP" | "CHF";
  unit: UpsellUnit;
  maxQuantity: number;
  /** URL du Stripe Payment Link. Si null, item visible mais non achetable. */
  stripePaymentLink: string | null;
}

export interface UpsellsPayload {
  items: UpsellItem[];
  stayContext: {
    nights: number | null;
    guests: number | null;
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function fetchGuestApp<T>(token: string, path: string): Promise<T> {
  const url = `${API_URL}/guest-app/${encodeURIComponent(token)}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    // Pas de credentials — le token EST l'auth, pas besoin de cookies.
    credentials: "omit",
    // Cache léger côté browser (60s) pour éviter de marteler le backend
    // pendant que le voyageur navigue entre les pages.
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = `Erreur ${res.status}`;
    try {
      const json = JSON.parse(text);
      msg = json.message ?? msg;
    } catch {
      // Pas de JSON, on garde le message générique
    }
    throw new ApiError(res.status, msg);
  }

  return res.json() as Promise<T>;
}

// ── Endpoints publics ───────────────────────────────────────────────────────

export async function getWelcome(token: string): Promise<WelcomePayload> {
  return fetchGuestApp<WelcomePayload>(token, "/welcome");
}

export async function getConversation(token: string): Promise<ConversationPayload> {
  return fetchGuestApp<ConversationPayload>(token, "/conversation");
}

export async function getUpsells(token: string): Promise<UpsellsPayload> {
  return fetchGuestApp<UpsellsPayload>(token, "/upsells");
}

/**
 * Tracking funnel — best-effort, fire-and-forget. NE DOIT JAMAIS bloquer
 * ni retarder le parcours du voyageur : on n'attend pas la réponse côté
 * appelant, et toute erreur est avalée silencieusement (analytics ≠
 * fonctionnel). `keepalive` permet à la requête d'aboutir même si la
 * page se ferme/navigue juste après (clic "Réserver" → onglet Stripe).
 */
export function trackUpsell(
  token: string,
  itemId: string,
  action: "clicked" | "requested",
  quantity?: number,
): void {
  try {
    const url = `${API_URL}/guest-app/${encodeURIComponent(
      token,
    )}/upsells/${encodeURIComponent(itemId)}/track`;
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      keepalive: true,
      body: JSON.stringify({ action, quantity }),
    }).catch(() => {
      /* analytics non bloquant — on ignore tout échec */
    });
  } catch {
    /* idem — jamais d'exception propagée au parcours d'achat */
  }
}

export interface SendMessageResponse {
  conversationId: string;
  reply: string;
  status: "bot" | "escalated" | "gdpr" | "csat";
}

/**
 * POST /guest-app/:token/messages — envoie un message à Bob et récupère
 * sa réponse. Pas de cache (POST), timeout généreux (l'IA peut prendre
 * quelques secondes pour une réponse RAG).
 */
export async function sendGuestMessage(
  token: string,
  message: string,
): Promise<SendMessageResponse> {
  const url = `${API_URL}/guest-app/${encodeURIComponent(token)}/messages`;

  // Timeout client 30s : le backend a un TimeoutInterceptor 60s, mais 60s
  // de spinner sans feedback sur mobile = voyageur qui ferme la PWA.
  // À 30s on coupe et on affiche une erreur "réessayez" exploitable
  // (le texte est restauré dans l'input côté chat-view).
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "omit",
      body: JSON.stringify({ message }),
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        408,
        "La réponse prend trop de temps. Réessayez dans un instant.",
      );
    }
    throw new ApiError(0, "Connexion interrompue. Réessayez.");
  }
  clearTimeout(timer);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = `Erreur ${res.status}`;
    try {
      const json = JSON.parse(text);
      msg = json.message ?? msg;
    } catch {
      /* garde le message générique */
    }
    throw new ApiError(res.status, msg);
  }

  return res.json() as Promise<SendMessageResponse>;
}

export async function checkTokenHealth(token: string): Promise<{ ok: boolean; tokenId: string; expiresAt: string }> {
  return fetchGuestApp(token, "/health");
}

// ── Utilitaires de prix ─────────────────────────────────────────────────────

/**
 * Calcule le prix total d'un item selon son unité et le contexte de séjour.
 *
 *   per_stay   → prix fixe
 *   per_day    → prix × nb de nuits (fallback 1 si inconnu)
 *   per_person → prix × nb de voyageurs (fallback 1 si inconnu)
 *
 * `quantity` multiplie en plus (ex: 2 vélos × 3 jours).
 */
export function computeUpsellTotalCents(
  item: Pick<UpsellItem, "priceCents" | "unit">,
  stay: { nights: number | null; guests: number | null },
  quantity = 1,
): number {
  let multiplier = 1;
  if (item.unit === "per_day") multiplier = Math.max(1, stay.nights ?? 1);
  else if (item.unit === "per_person") multiplier = Math.max(1, stay.guests ?? 1);
  return item.priceCents * multiplier * Math.max(1, quantity);
}

/** Formate des centimes en string monétaire localisé (ex: 3000 → "30 €"). */
export function formatPrice(cents: number, currency = "EUR"): string {
  const amount = cents / 100;
  const hasDecimals = cents % 100 !== 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Libellé court de l'unité pour l'UI (ex: "/ nuit", "/ personne"). */
export function unitLabel(unit: UpsellUnit): string {
  switch (unit) {
    case "per_day":
      return "/ nuit";
    case "per_person":
      return "/ personne";
    default:
      return "";
  }
}

export { ApiError };
