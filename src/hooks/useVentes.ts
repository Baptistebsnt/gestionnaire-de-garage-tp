import { useState, useEffect } from "react";
import { Vente, LigneVente } from "../types";

const load = <T,>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export const useVentes = () => {
  const [ventes, setVentes] = useState<Vente[]>(() => load("garage_ventes"));

  useEffect(() => {
    localStorage.setItem("garage_ventes", JSON.stringify(ventes));
  }, [ventes]);

  const addVente = (lignes: LigneVente[]): Vente => {
    const total = lignes.reduce((s, l) => s + l.prix * l.quantite, 0);
    const v: Vente = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      lignes,
      total,
    };
    setVentes((prev) => [v, ...prev]);
    return v;
  };

  const ventesOfDay = (dateStr: string) =>
    ventes.filter((v) => v.date.slice(0, 10) === dateStr);

  const totalOfDay = (dateStr: string) =>
    ventesOfDay(dateStr).reduce((s, v) => s + v.total, 0);

  return { ventes, addVente, ventesOfDay, totalOfDay };
};
