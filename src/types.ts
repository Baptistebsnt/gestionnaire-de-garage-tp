export type CarStatus = "recue" | "en_reparation" | "prete" | "livree";

export const STATUS_ORDER: CarStatus[] = [
  "recue",
  "en_reparation",
  "prete",
  "livree",
];

export const STATUS_LABELS: Record<CarStatus, string> = {
  recue: "Reçue",
  en_reparation: "En réparation",
  prete: "Prête",
  livree: "Livrée",
};

export const STATUS_COLORS: Record<
  CarStatus,
  { color: string; borderColor: string; background: string; dot: string }
> = {
  recue: {
    color: "var(--blue)",
    borderColor: "rgba(59,130,246,0.35)",
    background: "var(--blue-dim)",
    dot: "var(--blue)",
  },
  en_reparation: {
    color: "var(--orange)",
    borderColor: "rgba(249,115,22,0.35)",
    background: "var(--orange-dim)",
    dot: "var(--orange)",
  },
  prete: {
    color: "var(--green)",
    borderColor: "rgba(34,197,94,0.35)",
    background: "var(--green-dim)",
    dot: "var(--green)",
  },
  livree: {
    color: "var(--gray)",
    borderColor: "rgba(107,114,128,0.35)",
    background: "var(--gray-dim)",
    dot: "var(--gray)",
  },
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
