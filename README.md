# Caisse Manager

Application desktop de logiciel de caisse — construite avec **Electron**, **React 18** et **TypeScript**. Fonctionne entièrement **hors-ligne**, sans backend ni base de données serveur.

---

## Sommaire

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Démarrage rapide](#démarrage-rapide)
- [Scripts](#scripts)
- [Architecture](#architecture)
- [Tests](#tests)
- [Documentation](#documentation)

---

## Aperçu

Caisse Manager couvre l'ensemble du flux d'une caisse enregistreuse :

```
Catalogue produits → Caisse (panier) → Validation de vente
                                              ↓
                              Historique des ventes → Tableau de bord
```

Toutes les données sont persistées localement via `localStorage` et peuvent être sauvegardées / restaurées en un clic.

---

## Fonctionnalités

### Catalogue produits

- Gestion d'un catalogue de produits
- Ajout manuel ou **enrichissement automatique via l'API OpenFoodFacts** :
  - Recherche par nom avec suggestions en temps réel (debounce 420 ms)
  - Lookup direct par code-barre EAN
  - Vignette, marque et code-barre stockés avec le produit
- Modification du prix en ligne (inline edit)
- Recherche filtrante dans le catalogue

### Caisse

- Interface de vente : grille de produits cliquables
- Panier avec gestion des quantités (+ / − / supprimer)
- Calcul du total en temps réel
- Validation de vente → enregistrement dans l'historique + notification système OS

### Historique des ventes

- Liste de toutes les ventes avec filtre "Aujourd'hui / Toutes"
- Détail d'une vente (lignes, quantités, total)
- **Export CSV** téléchargeable
- **Impression PDF** de l'historique

### Tableau de bord

- **4 KPI** : CA total, CA du mois, ventes du jour, produits vendus
- **Graphe CA des 7 derniers jours** (barres CSS, aujourd'hui mis en avant)
- **Top 5 produits** par chiffre d'affaires

### Paramètres

- **Thème sombre / clair** — basculement instantané via variables CSS
- **Langue** — Français / English (i18n maison, type-safe)
- **Export des données** — backup JSON complet (produits, ventes)
- **Import des données** — restauration depuis un fichier backup avec confirmation

---

## Stack technique

| Catégorie | Outil | Version |
|---|---|---|
| Runtime desktop | Electron | 30 |
| UI | React | 18 |
| Bundler | Vite | 5 |
| Langage | TypeScript | 5 (`strict: true`) |
| Styles | Tailwind CSS | v4 (`@theme inline`) |
| Icônes | Lucide React | — |
| Tests | Vitest + @testing-library/react | — |
| Environnement test | happy-dom | — |
| API externe | OpenFoodFacts (publique, sans clé) | — |

---

## Démarrage rapide

### Prérequis

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
git clone <url-du-repo>
cd gestionnaire-de-garage-tp
npm install
```

### Lancement en développement

```bash
npm run dev
```

Lance Vite + Electron en mode hot-reload. Les modifications dans `src/` sont reflétées instantanément.

### Build de production

```bash
npm run build
```

Génère un installateur natif dans `release/<version>/` :
- **macOS** → `.dmg`
- **Windows** → `.exe` (NSIS)
- **Linux** → `.AppImage`

---

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Lance l'app en mode développement (HMR) |
| `npm run build` | Build TypeScript + Vite + electron-builder |
| `npm run lint` | ESLint sur tous les fichiers TS/TSX |
| `npm test` | Lance la suite de tests |
| `npm run test:watch` | Tests en mode watch (rechargement automatique) |
| `npm run test:coverage` | Tests avec rapport de couverture HTML |

---

## Architecture

```
src/
├── App.tsx                         # Routage par onglet, layout principal
├── main.tsx                        # Point d'entrée React, providers globaux
├── types.ts                        # Types TypeScript (Produit, Vente, LigneVente)
├── i18n.ts                         # Traductions fr/en, type-safe (TKey)
├── index.css                       # Design tokens, @theme inline, @layer base/components
│
├── components/
│   ├── TopNav.tsx                  # Navigation + onglets
│   ├── SettingsPanel.tsx           # Thème, langue, backup/restore
│   ├── Toast.tsx                   # Notifications UI (Context + Provider)
│   ├── caisse/CaisseView.tsx       # Interface de caisse
│   ├── catalogue/CatalogueView.tsx # Catalogue + enrichissement OpenFoodFacts
│   ├── ventes/VentesView.tsx       # Historique + exports CSV/PDF
│   └── dashboard/DashboardView.tsx # KPIs + graphes + statistiques
│
├── context/
│   └── SettingsContext.tsx         # lang, theme, t() — disponible globalement
│
├── hooks/
│   ├── useProduits.ts              # CRUD produits + localStorage
│   └── useVentes.ts                # Ventes + filtres + localStorage
│
├── services/
│   └── openFoodFacts.ts            # searchOFF() + lookupOFF()
│
├── lib/
│   └── cn.ts                       # Classname merger utility
│
└── __tests__/
    ├── unit/                       # cn, i18n, openFoodFacts
    └── integration/                # useProduits, CatalogueView
```

### Flux de données

```
Composants
    ↕  (props / callbacks)
Hooks custom  ←→  localStorage
    ↕  (optionnel)
Services externes (OpenFoodFacts API)
```

Les hooks (`useProduits`, `useVentes`) encapsulent l'état et la persistance. Les composants consomment les hooks via props ou directement. Aucun gestionnaire d'état global (Redux, Zustand) — les domaines sont assez indépendants pour que les hooks suffisent.

### Thème dark/light

Les couleurs sont définies comme variables CSS (`:root` pour le dark, `html.light` pour le clair) et exposées comme tokens Tailwind via `@theme inline`. Le basculement se fait par `document.documentElement.className = theme` — aucun rechargement, aucune régénération de classes.

### IPC Electron

| Canal | Type | Usage |
|---|---|---|
| `show-notification` | `send / on` | Notification OS après validation d'une vente |

Le renderer n'a pas accès à Node.js (`nodeIntegration: false`, `contextIsolation: true`). Toute communication passe par le `contextBridge` du preload.

### Persistance des données

| Clé localStorage | Contenu |
|---|---|
| `garage_produits` | Tableau de `Produit[]` |
| `garage_ventes` | Tableau de `Vente[]` (snapshot dénormalisé) |

Les lignes de vente (`LigneVente`) copient le nom et le prix du produit au moment de la vente — les modifications ultérieures du catalogue n'affectent pas l'historique.

---

## Tests

```bash
npm test
```

```
✓ unit/cn.test.ts                 — Classname merger utility
✓ unit/i18n.test.ts               — Cohérence fr/en, fonction t()
✓ unit/openFoodFacts.test.ts      — searchOFF + lookupOFF (fetch mocké)
✓ integration/useProduits.test.ts — CRUD produits, enrichissement OFF
✓ integration/CatalogueView.test.tsx — Rendu, formulaire, recherche, suppression
```

**Rapport de couverture :**

```bash
npm run test:coverage
# → rapport HTML dans coverage/
```

---

## Documentation

| Fichier | Contenu |
|---|---|
| [`docs/data-models.md`](./docs/data-models.md) | Schémas de toutes les entités, relations, localStorage, format OpenFoodFacts |
| [`docs/architecture.md`](./docs/architecture.md) | Architecture Electron, couches React, flux de données, sécurité IPC |
| [`docs/choix-techniques.md`](./docs/choix-techniques.md) | Justification de chaque choix technique avec les alternatives écartées |

---

## Sécurité

- `contextIsolation: true` — le renderer est isolé de Node.js
- `nodeIntegration: false` — aucun accès direct aux API système depuis la page
- Le `contextBridge` n'expose que le strict nécessaire (notifications OS)
- Aucune donnée transmise à un serveur — tout reste local
