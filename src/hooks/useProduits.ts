import { useState, useEffect } from "react";
import { Produit } from "../types";

const load = <T,>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export const useProduits = () => {
  const [produits, setProduits] = useState<Produit[]>(() =>
    load("garage_produits"),
  );

  useEffect(() => {
    localStorage.setItem("garage_produits", JSON.stringify(produits));
  }, [produits]);

  const addProduit = (data: { nom: string; prix: number }): Produit => {
    const p: Produit = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProduits((prev) => [p, ...prev]);
    return p;
  };

  const updateProduit = (id: string, data: Partial<Pick<Produit, "nom" | "prix">>) => {
    setProduits((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
    );
  };

  const deleteProduit = (id: string) => {
    setProduits((prev) => prev.filter((p) => p.id !== id));
  };

  return { produits, addProduit, updateProduit, deleteProduit };
};
