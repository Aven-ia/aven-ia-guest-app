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

export async function checkTokenHealth(token: string): Promise<{ ok: boolean; tokenId: string; expiresAt: string }> {
  return fetchGuestApp(token, "/health");
}

export { ApiError };
