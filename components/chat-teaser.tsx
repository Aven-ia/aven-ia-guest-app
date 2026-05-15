"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

/**
 * CTA carte vers le chat IA — placé à la fin du livret pour rappeler
 * "si tu as une question, demande à BOB".
 *
 * Aussi accessible via le footer permanent (cf. layout).
 */
export function ChatTeaser({ token, botName }: { token: string; botName: string }) {
  return (
    <section className="max-w-2xl mx-auto px-5 mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <Link
          href={`/${token}/chat`}
          className="block bg-gradient-to-br from-brand-600 to-stone-900 text-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-serif font-medium mb-2">
                Une question, à toute heure
              </h3>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                {botName} est disponible 24h/24 pour vous répondre dans votre langue.
                Une recommandation, une urgence, un détail oublié — un message suffit.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-100">
                Démarrer la conversation
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
