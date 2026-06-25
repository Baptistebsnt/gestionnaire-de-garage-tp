# Choix techniques et justifications

## Stack principale

### Electron

**Choix :** Application desktop plutôt qu'une web app.

**Justification :**
- L'application doit fonctionner **hors-ligne** dans un atelier sans connexion fiable
- Accès aux **notifications système natives** (toast OS quand une vente est validée)
- Distribution sous forme d'un `.app` / `.exe` installable — plus naturel pour un artisan
- Permet d'utiliser les mêmes technologies web (React, Tailwind) sans apprendre un framework natif

**Alternative écartée :** PWA — les notifications et l'accès hors-ligne sont possibles, mais l'installation est moins intuitive et l'intégration OS plus limitée.

---

### React 18

**Choix :** Librairie UI composant-based.

**Justification :**
- Modèle mental simple : `état → rendu`, sans magie de framework
- Hooks natifs (`useState`, `useEffect`) suffisent pour la gestion d'état de cette taille
- Écosystème vaste (@testing-library, lucide-react...)
- Familier et documenté — pertinent dans le cadre d'un TP

**Alternative écartée :** Vue.js ou Svelte — viables, mais React est le standard de l'industrie et le plus courant en entretien.

---

### Vite

**Choix :** Bundler et dev server.

**Justification :**
- **HMR instantané** (< 50ms vs plusieurs secondes avec webpack) — gain de productivité significatif
- Supporte nativement l'ESM, TypeScript, JSX sans configuration
- Plugin officiel `@vitejs/plugin-react` pour Electron
- `vitest` est son pendant naturel pour les tests — même config, même pipeline de transform

**Alternative écartée :** Webpack (Create React App) — plus lent, configuration complexe, en fin de vie côté CRA.

---

### TypeScript

**Choix :** Sur-ensemble typé de JavaScript.

**Justification :**
- Détection d'erreurs **à la compilation** plutôt qu'à l'exécution (ex : une clé i18n manquante `TKey` est une erreur de build)
- L'autocomplétion dans l'éditeur sur les types `Voiture`, `CarStatus`, `TKey` évite les fautes de frappe
- Les refactorings sont sécurisés — renommer un champ est guidé par le compilateur
- `strict: true` force de bons patterns (pas de `any` implicite, paramètres inutilisés détectés)

**Alternative écartée :** JavaScript pur — la détection tardive des erreurs et l'absence d'autocomplétion ralentissent le développement sans apporter de bénéfice.

---

### Tailwind CSS v4

**Choix :** Framework CSS utilitaire, version 4 (intégration Vite native).

**Justification :**
- **Zéro runtime** : les classes sont résolues à la compilation, pas de JS supplémentaire dans le bundle
- **Cohérence par contrainte** : utiliser des classes comme `px-4`, `text-fg-2`, `rounded-xl` produit un design cohérent sans écrire de CSS custom
- **`@theme inline`** : permet d'exposer les variables CSS (tokens de thème) comme classes Tailwind utilitaires (`bg-surface`, `text-accent`...) — le meilleur des deux mondes entre CSS variables (runtime pour le dark/light) et classes Tailwind (DX)
- **`@layer base/components`** : les resets custom sont dans `@layer base`, donc les classes utilitaires Tailwind ont toujours la priorité grâce aux règles de cascade CSS

**Alternative écartée :** CSS Modules ou styled-components — plus verbeux, CSS-in-JS ajoute un coût runtime, et la colocation des styles avec les composants nuit à la lisibilité des templates.

---

## Gestion de l'état

### Hooks custom + localStorage (sans gestionnaire d'état global)

**Choix :** `useGarage`, `useProduits`, `useVentes` — chacun encapsule son `useState` + `useEffect` de persistance.

**Justification :**
- L'application n'a **pas de partage d'état complexe** entre branches distantes de l'arbre React
- Chaque domaine est autonome (voitures ≠ produits ≠ ventes)
- Un `useEffect` sur le state qui écrit dans `localStorage` est la solution **la plus simple qui fonctionne** — aucune dépendance supplémentaire, aucun boilerplate
- La logique est testable unitairement via `renderHook` de @testing-library

**Alternative écartée :** Zustand ou Redux — justifiés pour des apps avec des dizaines de slices partagés ou du middleware async. Ici, c'est de l'over-engineering. Trois hooks custom = trois fichiers de ~40 lignes chacun.

---

### localStorage vs SQLite / IndexedDB

**Choix :** `localStorage` avec JSON sérialisé.

**Justification :**
- Les volumes de données sont faibles (dizaines de voitures, centaines de produits)
- L'API est synchrone et simple — pas de callbacks, pas de migrations de schéma
- Lecture protégée par `try/catch` contre les données corrompues
- Les données sont lisibles et déboguables directement depuis les DevTools

**Alternative écartée :**
- **SQLite** (via `better-sqlite3`) : pertinent pour des volumes plus importants ou des requêtes complexes — introduit une dépendance native et un bridge IPC pour chaque opération
- **IndexedDB** : API asynchrone complexe, surpuissant pour ce cas d'usage

---

## Tests

### Vitest

**Choix :** Framework de tests.

**Justification :**
- **Intégration native avec Vite** : même pipeline de transformation (esbuild), même config — pas de double configuration TypeScript/babel
- Compatible avec l'API Jest (`.toEqual`, `.toHaveLength`, `vi.fn()`...) — pas de réapprentissage
- **Rapide** : les tests unitaires (cn, i18n, openFoodFacts) s'exécutent en < 10ms
- Supporte le mode `watch` avec rechargement intelligent

**Alternative écartée :** Jest — nécessite une configuration supplémentaire pour l'ESM et TypeScript avec Vite, transformations plus lentes.

---

### @testing-library/react

**Choix :** Outil de test des composants React.

**Justification :**
- Force à tester **ce que l'utilisateur voit** (texte, rôles ARIA, interactions) plutôt que les détails d'implémentation (états internes, noms de méthodes)
- `userEvent` simule de vraies interactions (frappe clavier, clic) — plus réaliste que `fireEvent`
- `renderHook` permet de tester les hooks métier isolément de tout composant

---

### happy-dom

**Choix :** Environnement DOM pour les tests (à la place de jsdom).

**Justification :**
- `jsdom@29` introduit une dépendance sur `@exodus/bytes` (ESM) incompatible avec `html-encoding-sniffer` (CJS) — erreur `ERR_REQUIRE_ESM` à l'exécution
- `happy-dom` est plus léger, ne présente pas ce conflit, et est maintenu activement avec Vitest en tête

---

## Internationalisation

### Système maison (sans i18next)

**Choix :** Dictionnaires TypeScript + fonction `t(lang, key)`.

**Justification :**
- **Type-safety totale** : `TKey = keyof typeof fr` garantit que toute clé inexistante est une erreur de compilation. Avec `i18next`, les clés sont des strings libres.
- **Zero dépendance** : 139 lignes dans `i18n.ts`, aucun bundle supplémentaire
- Le projet ne nécessite que deux langues avec un volume de clés limité (~60)

**Alternative écartée :** `i18next` / `react-i18next` — justifié pour du pluriel complexe, des interpolations avancées, du chargement lazy de traductions. Ici, la complexité serait injustifiée.

---

## API OpenFoodFacts

**Choix :** API publique OpenFoodFacts pour l'enrichissement des produits.

**Justification :**
- **Gratuite et sans clé API** — aucune gestion de secrets, aucun quota d'authentification
- Base de données mondiale de plus de 3 millions de produits alimentaires
- Deux modes d'usage : recherche par nom (debounce 420ms) et lookup par code-barre EAN
- Les données enrichies (image, marque, code) sont stockées localement — pas de dépendance réseau en caisse

**Contrainte acceptée :** Le catalogue est orienté produits alimentaires, pas des pièces auto. Dans le cadre du TP, l'intégration démontre la capacité à consommer une API tierce et à gérer des états asynchrones (loading, error, debounce).

---

## Qualité du code

### Règles appliquées

| Règle | Outil | Pourquoi |
|-------|-------|----------|
| Zéro `style={{}}` en composant | Convention projet | Les variables CSS sont exposées comme tokens Tailwind — `bg-surface` vaut mieux que `style={{ background: 'var(--surface)' }}` |
| `strict: true` en TypeScript | tsconfig | Force `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` |
| Commentaires uniquement si le *pourquoi* est non-obvious | Convention | Le code bien nommé se lit seul ; les commentaires décrivent les contraintes cachées, pas le "quoi" |
| Pas de `any` implicite | `noImplicitAny` via strict | Chaque variable a un type connu au compile time |
| `cn()` pour les classnames conditionnels | `src/lib/cn.ts` | Évite la concaténation de strings fragile avec les valeurs falsy |

---

## Récapitulatif des dépendances

### Production

| Package | Rôle |
|---------|------|
| `react` / `react-dom` | UI |
| `lucide-react` | Icônes SVG |
| `tailwindcss` | Styles utilitaires |

### Développement

| Package | Rôle |
|---------|------|
| `electron` | Runtime desktop |
| `vite` | Bundler + dev server |
| `typescript` | Typage statique |
| `vitest` | Tests |
| `@testing-library/react` | Tests composants |
| `happy-dom` | DOM virtuel pour les tests |
| `@vitest/coverage-v8` | Couverture de tests |
