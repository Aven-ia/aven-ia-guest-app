# Aven.ia — Guest Web App

Application web voyageur pour Smart Host (by Aven.ia).

**URL prod (cible)** : https://guest.aven-ia.com/{token}
**Backend** : https://api.aven-ia.com/guest-app/{token}/*
**Stack** : Next.js 15 + Tailwind CSS + Framer Motion + TypeScript

## 🎯 Que fait cette app ?

Le voyageur reçoit un lien WhatsApp/SMS de la conciergerie au moment où sa
réservation est confirmée :

```
🤍 Bienvenue Sarah ! Toutes les infos de votre séjour à L'Appartement du Vieux Port :
https://guest.aven-ia.com/abc123...
```

Il clique → arrive sur une web app mobile-first qui lui présente :
- Le livret d'accueil du logement (wifi, accès, règles, recommandations)
- Le chat avec le concierge IA (24h/24, dans sa langue)
- Plus tard : upsells (early check-in, ménage extra, etc.), caution, signature

**Pas d'inscription, pas de mot de passe.** Le token URL EST l'authentification.

## 🚀 Démarrage rapide

```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
npm run dev
# → http://localhost:3000 (vide), http://localhost:3000/<token-test> (livret)
```

Pour tester un vrai token, créer une row dans `guest_app_tokens` côté
backend (via SQL ou en attendant l'auto-création depuis reservation-import).

## 🌐 Déploiement Vercel

### Première fois

1. Pousser ce repo sur GitHub
2. https://vercel.com/new → Import `aven-ia-guest-app`
3. **Environment Variables** : `NEXT_PUBLIC_API_URL = https://api.aven-ia.com`
   (ou l'URL Railway actuelle du backend)
4. Deploy
5. Settings → Domains → ajouter `guest.aven-ia.com`
6. DNS chez le registrar : ajouter `CNAME guest → cname.vercel-dns.com`

## 📁 Structure

```
app/
├── layout.tsx              # Root + injection brand CSS vars
├── page.tsx                # Racine "/" — explique qu'il faut un token
├── not-found.tsx           # 404 branded (token invalide/expiré)
├── globals.css             # Tailwind + safe-area mobile
└── [token]/
    ├── page.tsx            # Livret d'accueil principal (SSR)
    └── chat/
        └── page.tsx        # Chat IA (SSR puis client component)

components/
├── guest-header.tsx        # Header sticky minimaliste
├── welcome-hero.tsx        # Hero photo logement + dates
├── info-category-card.tsx  # Card accordion par catégorie info
├── chat-teaser.tsx         # CTA vers le chat
└── chat-view.tsx           # Vue chat (bulles + input)

lib/
├── api.ts                  # Client fetch vers /guest-app/:token/*
└── utils.ts                # cn() Tailwind utility

config/
└── brand.ts                # Branding centralisé (rebrand = 1 fichier)
```

## 🎨 Direction artistique

Différente de la landing publique :
- **Landing** = vente, luxe Apple/Tesla, noir/or
- **Guest App** = expérience, chaleur, hospitalité, crème/taupe doré

Le voyageur n'achète rien. Il VIT. Le design doit accompagner, pas convaincre.

## 🔒 Sécurité

- Token validé côté backend (cf. `GuestTokenService` dans smart-host-v2)
- `noindex, nofollow` sur toutes les pages (URLs privées par résa)
- Pas de credentials cookies (le token URL suffit)
- Safe-area iOS / Android pour ne pas se prendre la barre nav système

## 🛠 Évolutions prévues

- POST `/guest-app/:token/messages` pour envoyer un message depuis le chat
  (UI déjà prêt, juste à câbler)
- Section "Upsells" dans le livret (early check-in, ménage extra, etc.)
- Section "Caution" / deposit Stripe
- Vraie photo logement (au lieu du placeholder gradient si imageUrl null)
