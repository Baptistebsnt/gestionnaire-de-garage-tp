# Architecture de l'application

## Vue d'ensemble

L'application est une **application desktop Electron** qui embarque une interface React. Elle fonctionne entièrement hors-ligne — aucun backend, aucune base de données serveur.

```
┌─────────────────────────────────────────────────────────────┐
│                     Processus Electron                       │
│                                                             │
│  ┌──────────────────────┐    IPC    ┌───────────────────┐  │
│  │    Main Process      │◄─────────►│ Renderer Process  │  │
│  │    (Node.js)         │           │  (Chromium)       │  │
│  │                      │           │                   │  │
│  │  - Fenêtre app       │  preload  │  React + Vite     │  │
│  │  - Notifications OS  │◄─────────►│  Tailwind CSS     │  │
│  │  - Cycle de vie      │           │  TypeScript       │  │
│  └──────────────────────┘           └───────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Processus Electron

### Main Process (`electron/main.ts`)

- Point d'entrée de l'application au sens OS
- Crée la `BrowserWindow` (fenêtre principale)
- Envoie les notifications système via `show-notification` (IPC canal `send/on`)
- Ne contient **aucune logique métier** — délégué entièrement au renderer

### Preload (`electron/preload.ts`)

- Chargé dans le contexte isolé de la fenêtre, avant le renderer
- Expose via `contextBridge.exposeInMainWorld` les seules fonctions nécessaires :
  - `ipcRenderer.send` → pour les notifications OS
  - `ipcRenderer.on` → pour écouter des messages du main
- `contextIsolation: true` / `nodeIntegration: false` : le renderer ne peut pas accéder à Node.js directement

### Renderer (`src/`)

Interface graphique complète. Tout ce qui concerne l'état, la logique et l'affichage vit ici.

---

## Architecture du Renderer (React)

### Couches

```
┌────────────────────────────────────────────────────┐
│                    Composants UI                    │
│  TopNav  Sidebar  CarCard  InterventionPanel  ...   │
│         CaisseView  CatalogueView  VentesView       │
└──────────────────────┬─────────────────────────────┘
                       │ consomment
┌──────────────────────▼─────────────────────────────┐
│                  Hooks métier                       │
│    useGarage   useProduits   useVentes              │
│         (state + localStorage)                      │
└──────────────────────┬─────────────────────────────┘
                       │ lisent/écrivent
┌──────────────────────▼─────────────────────────────┐
│                  localStorage                       │
│  garage_voitures  garage_interventions              │
│  garage_produits  garage_ventes                     │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│               Contextes globaux                     │
│   SettingsContext (lang, theme)                     │
│   ToastContext (notifications UI)                   │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│               Service externe                       │
│   openFoodFacts.ts → API OpenFoodFacts (HTTP)       │
└────────────────────────────────────────────────────┘
```

### Arbre de composants

```
main.tsx
└── SettingsProvider
    └── ToastProvider
        └── App
            ├── TopNav          (navigation + settings)
            └── [vue active]
                ├── VoituresLayout  (tab "voitures")
                │   ├── Sidebar
                │   │   ├── CarForm
                │   │   └── CarCard[]
                │   ├── InterventionPanel   (si sélection)
                │   └── DeleteModal         (si demande)
                ├── CatalogueView  (tab "catalogue")
                ├── CaisseView     (tab "caisse")
                └── VentesView     (tab "ventes")
```

---

## Flux de données

### Ajout d'une voiture

```
CarForm (formulaire)
  → onSubmit(data)
    → useGarage.addVoiture(data)
      → crypto.randomUUID() + new Date()
      → setVoitures([newVoiture, ...prev])
        → useEffect → localStorage.setItem("garage_voitures", ...)
          → re-render → Sidebar affiche la nouvelle carte
```

### Validation d'une vente (Caisse)

```
CaisseView — clic "Valider la vente"
  → useVentes.addVente(panier)
    → calcul total = Σ(prix × quantité)
    → snapshot des lignes (copie nom+prix actuels)
    → setVentes([newVente, ...prev])
      → localStorage.setItem("garage_ventes", ...)
  → useToast.toast("Vente enregistrée — 42,00 €")
    → notification OS via window.ipcRenderer.send("show-notification")
```

### Enrichissement produit via OpenFoodFacts

```
CatalogueView — mode "OpenFoodFacts"
  → saisie dans le champ de recherche
    → debounce 420ms
      → openFoodFacts.searchOFF(query)
        → fetch("https://world.openfoodfacts.org/cgi/search.pl?...")
          → dropdown de résultats
            → sélection d'un produit
              → offSelected = { code, product_name, brands, image_thumb_url }
                → submit du formulaire
                  → useProduits.addProduit({ nom, prix, barcode, imageUrl, marque })
```

---

## Système de thèmes

```
:root { --bg: #0b0b10; --accent: #f59e0b; ... }   ← thème sombre (défaut)
html.light { --bg: #f4f4f8; ... }                  ← surcharge thème clair

@theme inline {
  --color-bg: var(--bg);       ← expose les tokens CSS en classes Tailwind
  --color-accent: var(--accent);
  ...
}
```

Le thème est basculé via `document.documentElement.className = theme` dans `SettingsContext`. Aucune re-génération de classes CSS — tout est résolu au runtime via les variables CSS.

---

## Internationalisation (i18n)

Système maison sans dépendance externe :

```typescript
// i18n.ts
const fr = { nav_voitures: "Véhicules", ... };
const en = { nav_voitures: "Vehicles", ... };

export const t = (lang: Lang, key: TKey): string => translations[lang][key];
```

Le hook `useSettings().t(key)` est disponible dans tous les composants via le contexte. Le type `TKey` est inféré des clés de l'objet `fr`, garantissant que toute clé manquante en `en` est détectée à la compilation.

---

## Structure des fichiers

```
src/
├── App.tsx                    # Racine React, routing par onglet
├── main.tsx                   # Point d'entrée, providers globaux
├── types.ts                   # Types TypeScript + constantes (STATUS_CLASSES...)
├── i18n.ts                    # Dictionnaires fr/en + fonction t()
├── index.css                  # Design tokens, @theme inline, @layer base/components
│
├── components/
│   ├── TopNav.tsx
│   ├── Sidebar.tsx
│   ├── CarCard.tsx
│   ├── CarForm.tsx
│   ├── InterventionPanel.tsx
│   ├── DeleteModal.tsx
│   ├── SettingsPanel.tsx
│   ├── Toast.tsx              # Context + Provider + UI
│   ├── caisse/CaisseView.tsx
│   ├── catalogue/CatalogueView.tsx
│   └── ventes/VentesView.tsx
│
├── context/
│   └── SettingsContext.tsx    # lang, theme, setLang, setTheme, t()
│
├── hooks/
│   ├── useGarage.ts           # Voitures + Interventions (CRUD + localStorage)
│   ├── useProduits.ts         # Produits (CRUD + localStorage)
│   └── useVentes.ts           # Ventes (add + filtres jour + localStorage)
│
├── services/
│   └── openFoodFacts.ts       # searchOFF() + lookupOFF()
│
├── lib/
│   └── cn.ts                  # Utilitaire classname merger
│
└── __tests__/
    ├── unit/                  # cn, i18n, openFoodFacts
    └── integration/           # useGarage, useProduits, CatalogueView
```

---

## Sécurité Electron

| Option                   | Valeur  | Raison                                                      |
|--------------------------|---------|-------------------------------------------------------------|
| `contextIsolation`       | `true`  | Isole le monde JS du renderer de celui du preload/Node.js  |
| `nodeIntegration`        | `false` | Empêche le renderer d'accéder à l'API Node.js              |
| `contextBridge`          | utilisé | Seul canal pour exposer des fonctions contrôlées au renderer|

Un script malveillant injecté dans la page (XSS) ne peut pas accéder au système de fichiers ni exécuter de commandes système.
