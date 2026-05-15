"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import {
  sendGuestMessage,
  ApiError,
  type ConversationPayload,
} from "@/lib/api";

interface Props {
  token: string;
  botName: string;
  initialConversation: ConversationPayload;
}

type ChatMessage = {
  id: string;
  role: "guest" | "bot" | "human";
  content: string;
  createdAt: string;
  /** Message local pas encore confirmé serveur (style légèrement atténué). */
  pending?: boolean;
  /** Message d'erreur système (affiché en encart discret). */
  error?: boolean;
};

/**
 * Vue chat voyageur — bulles façon iMessage / WhatsApp.
 *
 * Branché sur POST /guest-app/:token/messages : le message part vraiment
 * à Bob (même moteur IA que WhatsApp), la réponse s'affiche en place.
 *
 *   • Optimistic UI : le message voyageur apparaît immédiatement
 *   • Typing indicator pendant que Bob réfléchit (RAG + Claude)
 *   • Erreur réseau → encart discret + le texte est restauré dans l'input
 *   • Pré-remplissage via ?q= (CTA "Demander" depuis les upsells)
 */
export function ChatView({ token, botName, initialConversation }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialConversation.messages,
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Pré-remplit l'input depuis ?q= (lien "Demander" d'un upsell sans
  // Payment Link). Lu via window.location pour éviter la contrainte
  // Suspense de useSearchParams. On ne l'envoie PAS automatiquement —
  // le voyageur garde la main pour ajuster avant d'envoyer.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      setInput(q);
      inputRef.current?.focus();
    }
  }, []);

  // Auto-scroll vers le bas au mount + sur nouveaux messages / typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, sending]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text || sending) return;

      const optimistic: ChatMessage = {
        id: `local-${Date.now()}`,
        role: "guest",
        content: text,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      setInput("");
      setSending(true);

      try {
        const res = await sendGuestMessage(token, text);
        setMessages((prev) => [
          // Confirme le message voyageur (retire le flag pending)
          ...prev.map((m) =>
            m.id === optimistic.id ? { ...m, pending: false } : m,
          ),
          {
            id: `bot-${Date.now()}`,
            role: res.status === "bot" ? "bot" : "human",
            content: res.reply,
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : "Connexion interrompue. Réessayez dans un instant.";
        setMessages((prev) => [
          // Retire le message optimiste en échec
          ...prev.filter((m) => m.id !== optimistic.id),
          {
            id: `err-${Date.now()}`,
            role: "bot",
            content: msg,
            createdAt: new Date().toISOString(),
            error: true,
          },
        ]);
        // Restaure le texte pour que le voyageur puisse réessayer
        setInput(text);
      } finally {
        setSending(false);
      }
    },
    [input, sending, token],
  );

  return (
    <div className="flex flex-col h-screen bg-brand-50">
      {/* Header chat */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href={`/${token}`}
            className="p-2 -ml-2 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Retour au livret"
          >
            <ArrowLeft size={20} className="text-stone-700" />
          </Link>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
              {botName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">
                {botName}
              </p>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                En ligne · répond en quelques secondes
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {messages.length === 0 && !sending ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-4 text-3xl">
                👋
              </div>
              <p className="text-sm text-stone-600 max-w-xs mx-auto leading-relaxed">
                Bonjour, je suis <strong>{botName}</strong>. Posez-moi vos
                questions sur le logement ou le quartier — je réponds
                instantanément, dans votre langue.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(idx * 0.02, 0.2),
                }}
                className={`flex ${
                  msg.role === "guest" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.error
                      ? "bg-amber-50 text-amber-800 border border-amber-200 rounded-bl-md"
                      : msg.role === "guest"
                        ? `bg-brand-600 text-white rounded-br-md ${
                            msg.pending ? "opacity-70" : ""
                          }`
                        : "bg-white text-stone-900 shadow-sm border border-stone-100 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))
          )}

          {/* Typing indicator pendant que Bob réfléchit */}
          <AnimatePresence>
            {sending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white shadow-sm border border-stone-100 rounded-2xl rounded-bl-md px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 bg-white border-t border-stone-200 p-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Écrivez à ${botName}…`}
            rows={1}
            disabled={sending}
            className="flex-1 resize-none px-4 py-3 rounded-2xl bg-stone-100 border border-transparent focus:outline-none focus:bg-white focus:border-stone-300 transition-all text-sm leading-relaxed max-h-32 disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-900 transition-colors flex-shrink-0"
            aria-label="Envoyer"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
