"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import type { ConversationPayload } from "@/lib/api";

interface Props {
  token: string;
  botName: string;
  initialConversation: ConversationPayload;
}

/**
 * Vue chat voyageur — bulles façon iMessage / WhatsApp.
 *
 * État V1 : affiche l'historique + input prêt MAIS l'envoi est désactivé
 * (toast "à venir") tant que l'endpoint POST /guest-app/:token/messages
 * n'est pas câblé côté backend. UI 100% prête pour le branchement.
 */
export function ChatView({ token, botName, initialConversation }: Props) {
  const [messages] = useState(initialConversation.messages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas au mount + sur nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    // TODO V2 : POST /guest-app/:token/messages quand l'endpoint sera prêt
    // côté backend. Pour l'instant on simule + toast pour montrer que
    // le UI est OK.
    setTimeout(() => {
      alert(
        `Message bien noté ! L'envoi via le chat in-app sera actif dans la prochaine version. En attendant, ${botName} reste joignable via WhatsApp/SMS.`,
      );
      setInput("");
      setSending(false);
    }, 400);
  };

  return (
    <div className="flex flex-col h-screen bg-brand-50">
      {/* Header chat — minimal, juste retour + nom IA */}
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
              <p className="text-sm font-medium text-stone-900 truncate">{botName}</p>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                En ligne · répond en quelques secondes
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-4 text-3xl">
                👋
              </div>
              <p className="text-sm text-stone-600 max-w-xs mx-auto leading-relaxed">
                Bonjour, je suis <strong>{botName}</strong>. Posez-moi vos questions sur le logement ou le quartier — je réponds instantanément, dans votre langue.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
                className={`flex ${msg.role === "guest" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "guest"
                      ? "bg-brand-600 text-white rounded-br-md"
                      : "bg-white text-stone-900 shadow-sm border border-stone-100 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input bar — fixe en bas */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 bg-white border-t border-stone-200 p-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Écrivez à ${botName}…`}
            rows={1}
            className="flex-1 resize-none px-4 py-3 rounded-2xl bg-stone-100 border border-transparent focus:outline-none focus:bg-white focus:border-stone-300 transition-all text-sm leading-relaxed max-h-32"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-900 transition-colors flex-shrink-0"
            aria-label="Envoyer"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}
