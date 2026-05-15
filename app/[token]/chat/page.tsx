import { notFound } from "next/navigation";
import { getConversation, getWelcome, ApiError } from "@/lib/api";
import { ChatView } from "@/components/chat-view";

/**
 * Page chat voyageur — récupère l'historique au SSR puis hydrate côté
 * client pour l'envoi de nouveaux messages.
 *
 * Pour cette V1, l'UI permet de VOIR l'historique. L'envoi de nouveau
 * message côté backend est en cours d'implémentation (endpoint POST
 * /guest-app/:token/messages à venir dans une PR ultérieure). L'input
 * UI est déjà prêt pour s'y brancher.
 */

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { token } = await params;

  let conversation;
  let botName = "votre concierge";
  try {
    const [conv, welcome] = await Promise.all([
      getConversation(token),
      getWelcome(token),
    ]);
    conversation = conv;
    botName = welcome.tenant.botName;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
      notFound();
    }
    throw err;
  }

  return <ChatView token={token} botName={botName} initialConversation={conversation} />;
}

export const metadata = {
  title: "Chat",
};
