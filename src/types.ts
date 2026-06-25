export type CarStatus = "recue" | "en_reparation" | "prete" | "livree";

export const STATUS_ORDER: CarStatus[] = [
  "recue",
  "en_reparation",
  "prete",
  "livree",
];

export const STATUS_LABELS: Record<CarStatus, string> = {
  recue:         "Reçue",
  en_reparation: "En réparation",
  prete:         "Prête",
  livree:        "Livrée",
};

export const STATUS_CLASSES: Record<CarStatus, { pill: string; dot: string }> = {
  recue:         { pill: "text-info bg-info-dim border-info-border",           dot: "bg-info" },
  en_reparation: { pill: "text-warn bg-warn-dim border-warn-border",           dot: "bg-warn" },
  prete:         { pill: "text-success bg-success-dim border-success-border",  dot: "bg-success" },
  livree:        { pill: "text-neutral bg-neutral-dim border-neutral-border",  dot: "bg-neutral" },
};

export type Voiture = {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  nomClient: string;
  statut: CarStatus;
  createdAt: string;
};

export type Intervention = {
  id: string;
  voitureId: string;
  description: string;
  prix: number;
};

export type Produit = {
  id: string;
  nom: string;
  prix: number;
  createdAt: string;
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
