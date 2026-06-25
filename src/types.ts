export type Produit = {
  id: string;
  nom: string;
  prix: number;
  createdAt: string;
  barcode?: string;
  imageUrl?: string;
  marque?: string;
};

export type LigneVente = {
  produitId: string;
  nom: string;
  prix: number;
  quantite: number;
};

export type Vente = {
  id: string;
  date: string;
  lignes: LigneVente[];
  total: number;
};

export type Theme = "dark" | "light";
export type Lang  = "fr" | "en";
