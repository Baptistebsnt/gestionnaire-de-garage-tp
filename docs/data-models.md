# Modèles de données

## Vue d'ensemble des entités

```
┌─────────────┐       ┌──────────────────┐
│   Voiture   │ 1──N  │  Intervention    │
└─────────────┘       └──────────────────┘

┌─────────────┐       ┌──────────────────┐       ┌──────────────┐
│   Produit   │ N──M  │   LigneVente     │ N──1  │    Vente     │
└─────────────┘       └──────────────────┘       └──────────────┘
```

---

## Entités

### `Voiture`

Représente un véhicule déposé au garage.

```typescript
type Voiture = {
  id:             string;     // UUID v4 (crypto.randomUUID)
  immatriculation: string;   // Ex : "AB-123-CD" (forcé en majuscules)
  marque:         string;
  modele:         string;
  nomClient:      string;
  statut:         CarStatus;  // Voir cycle de vie ci-dessous
  createdAt:      string;     // ISO 8601 — date de dépôt
};
```

**Cycle de vie du statut :**

```
recue ──► en_reparation ──► prete ──► livree
```

La progression est strictement unidirectionnelle et ordonnée par `STATUS_ORDER`. Le statut `livree` est terminal — le bouton "Avancer" est désactivé.

| Valeur         | Label          | Couleur sémantique |
|----------------|----------------|--------------------|
| `recue`        | Reçue          | `info` (bleu)      |
| `en_reparation`| En réparation  | `warn` (orange)    |
| `prete`        | Prête          | `success` (vert)   |
| `livree`       | Livrée         | `neutral` (gris)   |

**Clé localStorage :** `garage_voitures`

---

### `Intervention`

Ligne de travail rattachée à une voiture. Supprimée en cascade si la voiture est supprimée.

```typescript
type Intervention = {
  id:          string;   // UUID v4
  voitureId:   string;   // Clé étrangère → Voiture.id
  description: string;
  prix:        number;   // En euros, décimal
};
```

**Relation :** `Voiture` 1 → N `Intervention`  
La jointure est gérée côté client dans `useGarage.interventionsFor(voitureId)`.

**Clé localStorage :** `garage_interventions`

---

### `Produit`

Article du catalogue, vendable en caisse. Peut être enrichi via OpenFoodFacts.

```typescript
type Produit = {
  id:        string;    // UUID v4
  nom:       string;
  prix:      number;    // En euros, modifiable après création
  createdAt: string;    // ISO 8601

  // Champs optionnels — renseignés via OpenFoodFacts
  barcode?:  string;   // Code EAN-13
  imageUrl?: string;   // URL de la vignette produit
  marque?:   string;   // Marque issue de l'API
};
```

**Clé localStorage :** `garage_produits`

---

### `Vente`

Enregistrement d'une transaction de caisse. Immuable après création.

```typescript
type Vente = {
  id:     string;         // UUID v4
  date:   string;         // ISO 8601
  lignes: LigneVente[];   // Snapshot des articles vendus
  total:  number;         // Somme calculée à la création (€)
};
```

> Les `lignes` sont un **snapshot dénormalisé** : le nom et le prix du produit sont copiés au moment de la vente. Modifier le prix d'un `Produit` ultérieurement ne rétroaffecte pas les ventes passées.

**Clé localStorage :** `garage_ventes`

---

### `LigneVente`

Article d'une vente. Embedded dans `Vente`, pas de table propre.

```typescript
type LigneVente = {
  produitId: string;   // Référence informative (Produit peut être supprimé)
  nom:       string;   // Copié depuis Produit.nom au moment de la vente
  prix:      number;   // Copié depuis Produit.prix au moment de la vente
  quantite:  number;   // Entier ≥ 1
};
```

---

## Diagramme relationnel complet

```
┌──────────────────────────────────┐
│             Voiture              │
│──────────────────────────────────│
│ id            : string (PK)      │
│ immatriculation: string          │
│ marque        : string           │
│ modele        : string           │
│ nomClient     : string           │
│ statut        : CarStatus        │
│ createdAt     : string (ISO)     │
└──────────────┬───────────────────┘
               │ 1
               │
               │ N
┌──────────────▼───────────────────┐
│           Intervention           │
│──────────────────────────────────│
│ id          : string (PK)        │
│ voitureId   : string (FK)        │
│ description : string             │
│ prix        : number             │
└──────────────────────────────────┘


┌──────────────────────────────────┐
│             Produit              │
│──────────────────────────────────│
│ id        : string (PK)          │
│ nom       : string               │
│ prix      : number               │
│ createdAt : string (ISO)         │
│ barcode?  : string               │
│ imageUrl? : string               │
│ marque?   : string               │
└──────────────────────────────────┘
        (référencé par produitId)
               ↓ snapshot au moment de la vente
┌──────────────────────────────────┐
│             Vente                │
│──────────────────────────────────│
│ id     : string (PK)             │
│ date   : string (ISO)            │
│ total  : number                  │
│ lignes : LigneVente[]            │
│  ├─ produitId : string           │
│  ├─ nom       : string (copie)   │
│  ├─ prix      : number (copie)   │
│  └─ quantite  : number           │
└──────────────────────────────────┘
```

---

## Persistance localStorage

| Clé                   | Type        | Hook responsable  |
|-----------------------|-------------|-------------------|
| `garage_voitures`     | `Voiture[]` | `useGarage`       |
| `garage_interventions`| `Intervention[]` | `useGarage`  |
| `garage_produits`     | `Produit[]` | `useProduits`     |
| `garage_ventes`       | `Vente[]`   | `useVentes`       |
| `garage_lang`         | `"fr"│"en"` | `SettingsContext` |
| `garage_theme`        | `"dark"│"light"` | `SettingsContext` |

Toutes les collections sont sérialisées en JSON. La lecture est protégée par un `try/catch` qui retourne `[]` en cas de données corrompues.

---

## Enrichissement OpenFoodFacts

Les champs `barcode`, `imageUrl` et `marque` d'un `Produit` sont renseignés optionnellement via l'API publique OpenFoodFacts :

```
API OpenFoodFacts
├── Recherche par nom
│   GET https://world.openfoodfacts.org/cgi/search.pl
│   ?action=process&search_terms={query}&json=1&page_size=8
│   Retourne : OFFProduct[]
│
└── Lookup par code-barre
    GET https://world.openfoodfacts.org/api/v2/product/{code}.json
    Retourne : { status: 0|1, product: OFFProduct | null }
```

```typescript
type OFFProduct = {
  code:              string;
  product_name:      string;
  brands?:           string;
  image_thumb_url?:  string;
};
```
