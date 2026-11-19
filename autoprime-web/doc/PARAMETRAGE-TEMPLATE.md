# Paramétrage du template — rebrander pour un nouveau client

> Check-list à suivre pour adapter ce site à un client.
> Les points 1 à 4 ne demandent aucune connaissance du code.
> Dernière mise à jour : Octobre 2026

---

## Résumé en 10 secondes

| Quoi | Où |
|------|----|
| Textes, coordonnées, titre du site, Formspree | `.env` (modèle : `.env.example`) |
| Horaires, slogan, libellés de coordonnées | `src/config/site.ts` |
| Logo (clair + sombre) et favicon | `public/logo.svg`, `public/logo-invert.svg` |
| Presets couleur / typo / layout / radius | `.env` (`VITE_THEME_*`) — `src/config/theme.ts` |
| Catalogue, services, témoignages | `src/data/*.ts` |

Aucune valeur d'entreprise ne doit être écrite **en dur** dans les composants :
tout ce qui s'affiche doit venir de `SITE` (importé depuis `@/config/site`).

---

## 1. `.env` — les textes simples

Copier `.env.example` vers `.env` puis remplir :

| Variable | Rôle |
|----------|------|
| `VITE_SITE_NOM` | Nom court (copyright, sidebar admin…) |
| `VITE_SITE_NOM_LONG` | Nom long |
| `VITE_SITE_BASELINE` | Baseline courte |
| `VITE_SITE_TITRE` | `<title>` de toutes les pages |
| `VITE_SITE_DESCRIPTION` | meta description (référencement) |
| `VITE_SITE_MOTS_CLES` | meta keywords |
| `VITE_SITE_LOGO` / `VITE_SITE_LOGO_INVERT` | Logo fond clair / fond sombre |
| `VITE_SITE_FAVICON` | Favicon |
| `VITE_TELEPHONE_FIXE`, `VITE_TELEPHONE_MOBILE`, `VITE_WHATSAPP`, `VITE_EMAIL` | Coordonnées |
| `VITE_ADRESSE_RUE`, `VITE_ADRESSE_VILLE`, `VITE_ADRESSE_PAYS` | Adresse |
| `VITE_ANCIENNETE` | « plus de 15 ans » (slogan + hero) |
| `VITE_FORMSPREE_CONTACT` | ID Formspree du formulaire de contact |

Ces variables alimentent aussi le `<title>` et les meta de `index.html`
(grâce au remplacement `%VITE_…%`).

⚠️ **Redémarrer `pnpm dev`** après modification de `.env` (Vite ne le fait pas
tout seul en cours de route, sauf détection automatique de fichier).

⚠️ Les variables `VITE_` sont **publiques** (embarquées dans le bundle) :
aucun secret ici.

---

## 2. `src/config/site.ts` — les données structurées

- `horaires` : planning hebdomadaire (non exposé en `.env` car tableau structuré).
- `slogan` : phrase de présentation (footer, page contact).
- Replis : chaque `lu("VITE_…", "valeur par défaut")` sert de secours si la
  variable manque dans `.env`.

---

## 3. Logo et favicon

Deux variantes sont nécessaires, car le site a des fonds clairs et sombres :

| Fichier | Utilisé par |
|---------|-------------|
| `public/logo.svg` | Navbar, pages claires |
| `public/logo-invert.svg` | Footer, sidebar admin (texte blanc) |
| `public/logo.svg` (favicon) | Onglet du navigateur |

Remplacer ces fichiers par ceux du client (png/svg/jpg accepté — changer
seulement la valeur des variables `VITE_SITE_LOGO*` / `VITE_SITE_FAVICON`).

Les SVG fournis sont des **placeholders** : le nom affiché est écrit dans le
fichier (`<text>…</text>`) et se personnalise directement en éditant le SVG.

---

## 4. Design system — presets `.env`

Choisir les valeurs dans `.env` :

| Variable | Presets |
|---|---|
| `VITE_THEME_COLOR` | `showroom`, `electric`, `luxury`, `sport`, `ocean` |
| `VITE_THEME_TYPOGRAPHY` | `modern`, `editorial`, `technical`, `classic` |
| `VITE_THEME_LAYOUT` | `compact`, `balanced`, `spacious` |
| `VITE_THEME_RADIUS` | `rounded`, `soft`, `sharp` |

Le thème est appliqué au chargement dans `src/config/theme.ts`. Couleurs et familles typographiques sont définies dans ce fichier. Les espaces se règlent via `--layout-gap`; les choix invalides retombent sur les valeurs par défaut. Les familles Google Fonts sont déclarées dans `index.html`.

### Réglage manuel avancé — `src/index.css`

Bloc `@theme` (Tailwind 4) :

```css
--color-brand-red: #C41E3A;
--color-brand-blue: #1E3A8A;
--color-brand-blue-dark: #0F172A;
/* … */
--font-heading: 'Epilogue', sans-serif;
--font-body: 'Inter', sans-serif;
```

Respecter la charte : [CHARTE-GRAPHIQUE.md](CHARTE-GRAPHIQUE.md).
⚠️ Ne jamais écrire de classe dynamique (`bg-${color}`) : Tailwind ne la détecte pas.

---

## 5. Contenu démo — `src/data/*.ts`

| Fichier | Contenu |
|---------|---------|
| `vehicle.ts` | Catalogue vente + location |
| `services.ts` | Domaines d'expertise, valeurs |
| `testimonials.ts` | Témoignages clients |
| `location.ts` | Données de démonstration location |
| `inbox.ts` | Messages / devis de démonstration (back-office) |

Ces fichiers seront remplacés par des appels API quand le backend sera branché.

---

## 6. Back-office

- URL : `/admin` (sidebar : tableau de bord, véhicules, location, demandes,
  messages, devis transit, services).
- Layout : `src/pages/admin/AdminLayout.tsx` (logo via `SITE.logoInvert`).
- Les données affichées viennent de `src/data/*` + `localStorage` (démo).

---

## 7. Vérifications avant livraison

```bash
pnpm install
pnpm lint      # ESLint
pnpm build     # tsc + vite build
pnpm preview   # build de production
```

Puis contrôler manuellement :

- [ ] `<title>` et meta description = client
- [ ] Logo affiché en navbar (fond clair) ET en footer / sidebar admin (fond sombre)
- [ ] Téléphones, email, WhatsApp, adresse cliquables et corrects
- [ ] Responsive `sm` / `md` / `lg`
- [ ] Aucun ancien nom de marque résiduel :

```bash
grep -rni "ancien nom" src index.html public doc
```

---

*Guide de paramétrage du template — Version 1.0*
