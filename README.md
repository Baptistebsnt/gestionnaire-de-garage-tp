# Garage Manager

Application desktop de gestion de garage automobile — construite avec **Electron**, **React 18** et **TypeScript**. Fonctionne entièrement **hors-ligne**, sans backend ni base de données serveur.

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

Garage Manager couvre l'ensemble du flux d'un atelier automobile :

```
Réception du véhicule → Suivi des réparations → Impression de la facture
       ↓
Vente de pièces en caisse → Historique des ventes → Tableau de bord
```

Toutes les données sont persistées localement via `localStorage` et peuvent être sauvegardées / restaurées en un clic.

---

## Fonctionnalités

### Gestion des véhicules

- Enregistrement d'un véhicule (immatriculation, marque, modèle, client)
- Progression de statut en un clic : **Reçue → En réparation → Prête → Livrée**
- Sélection d'un véhicule pour afficher le panneau d'interventions
- Suppression avec confirmation et cascade sur les interventions liées

### Interventions

- Ajout d'interventions (description + prix) sur chaque véhicule
- Calcul automatique du total à payer
- Suppression individuelle d'une intervention
- **Impression de facture PDF** en un clic — mise en page propre avec en-tête, tableau des prestations et total TTC

### Catalogue produits

- Gestion d'un catalogue de pièces et consommables
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

- **4 KPI** : CA total, CA du mois, véhicules actifs, ventes du jour
- **Répartition des statuts** avec barres de progression proportionnelles
- **Graphe CA des 7 derniers jours** (barres CSS, aujourd'hui mis en avant)
- **Top 5 produits** par chiffre d'affaires
- **Moyennes** : interventions par véhicule, prix moyen d'intervention, véhicules livrés

### Paramètres

- **Thème sombre / clair** — basculement instantané via variables CSS
- **Langue** — Français / English (i18n maison, type-safe)
- **Export des données** — backup JSON complet (voitures, interventions, produits, ventes)
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
| `npm test` | Lance la suite de tests (54 tests) |
| `npm run test:watch` | Tests en mode watch (rechargement automatique) |
| `npm run test:coverage` | Tests avec rapport de couverture HTML |

---

## Architecture

```
src/
├── App.tsx                         # Routage par onglet, layout principal
├── main.tsx                        # Point d'entrée React, providers globaux
├── types.ts                        # Types TypeScript + STATUS_CLASSES
├── i18n.ts                         # Traductions fr/en, type-safe (TKey)
├── index.css                       # Design tokens, @theme inline, @layer base/components
│
├── components/
│   ├── TopNav.tsx                  # Navigation + onglets
│   ├── Sidebar.tsx                 # Liste des véhicules
│   ├── CarCard.tsx                 # Carte véhicule avec statut
│   ├── CarForm.tsx                 # Formulaire ajout véhicule
│   ├── InterventionPanel.tsx       # Détail + interventions + impression facture
│   ├── DeleteModal.tsx             # Confirmation de suppression
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
│   ├── useGarage.ts                # CRUD voitures + interventions + localStorage
│   ├── useProduits.ts              # CRUD produits + localStorage
│   └── useVentes.ts                # Ventes + filtres + localStorage
│
├── services/
│   └── openFoodFacts.ts            # searchOFF() + lookupOFF()
│
├── lib/
│   ├── cn.ts                       # Classname merger utility
│   └── printFacture.ts             # Génération de facture PDF
│
└── __tests__/
    ├── unit/                       # cn, i18n, openFoodFacts
    └── integration/                # useGarage, useProduits, CatalogueView
```

### Flux de données

```
Composants
    ↕  (props / callbacks)
Hooks custom  ←→  localStorage
    ↕  (optionnel)
Services externes (OpenFoodFacts API)
```

Les hooks (`useGarage`, `useProduits`, `useVentes`) encapsulent l'état et la persistance. Les composants consomment les hooks via props ou directement. Aucun gestionnaire d'état global (Redux, Zustand) — les domaines sont assez indépendants pour que les hooks suffisent.

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
| `garage_voitures` | Tableau de `Voiture[]` |
| `garage_interventions` | Tableau de `Intervention[]` |
| `garage_produits` | Tableau de `Produit[]` |
| `garage_ventes` | Tableau de `Vente[]` (snapshot dénormalisé) |

Les lignes de vente (`LigneVente`) copient le nom et le prix du produit au moment de la vente — les modifications ultérieures du catalogue n'affectent pas l'historique.

---

## Tests

**54 tests** couvrant les couches unitaire et intégration.

```bash
npm test
```

```
✓ unit/cn.test.ts                (7 tests)  — Classname merger utility
✓ unit/i18n.test.ts              (5 tests)  — Cohérence fr/en, fonction t()
✓ unit/openFoodFacts.test.ts    (10 tests)  — searchOFF + lookupOFF (fetch mocké)
✓ integration/useGarage.test.ts (10 tests)  — CRUD voitures, statuts, cascade delete
✓ integration/useProduits.test.ts (8 tests) — CRUD produits, enrichissement OFF
✓ integration/CatalogueView.test.tsx (14)   — Rendu, formulaire, recherche, suppression
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
