"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Props {
  category: {
    id: string;
    name: string;
    icon: string;
    items: Array<{ title: string; content: string }>;
  };
}

/**
 * Carte expansible pour une catégorie d'info (Accès, Wifi détaillé,
 * Recommandations restos, Transports, etc.).
 *
 * Pattern accordion : fermée par défaut (économise l'espace mobile),
 * s'ouvre au tap pour révéler le contenu. Animation height fluide.
 */
export function InfoCategoryCard({ category }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-stone-50 transition-colors"
        aria-expanded={open}
      >
        <div className="text-2xl flex-shrink-0">{category.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-stone-900">{category.name}</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {category.items.length} information{category.items.length > 1 ? "s" : ""}
          </p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-stone-400 flex-shrink-0"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-stone-100 pt-4">
              {category.items.map((item, idx) => (
                <div key={idx}>
                  <p className="text-sm font-medium text-stone-900 mb-1">{item.title}</p>
                  <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
