import { useState, useEffect } from "react";
import { Voiture, Intervention, CarStatus, STATUS_ORDER } from "../types";

const load = <T>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export const useGarage = () => {
  const [voitures, setVoitures] = useState<Voiture[]>(() =>
    load("garage_voitures"),
  );
  const [interventions, setInterventions] = useState<Intervention[]>(() =>
    load("garage_interventions"),
  );

  useEffect(() => {
    localStorage.setItem("garage_voitures", JSON.stringify(voitures));
  }, [voitures]);
  useEffect(() => {
    localStorage.setItem("garage_interventions", JSON.stringify(interventions));
  }, [interventions]);

  const addVoiture = (
    data: Omit<Voiture, "id" | "statut" | "createdAt">,
  ): Voiture => {
    const v: Voiture = {
      ...data,
      id: crypto.randomUUID(),
      statut: "recue",
      createdAt: new Date().toISOString(),
    };
    setVoitures((prev) => [v, ...prev]);
    return v;
  };

  const advanceStatut = (id: string) => {
    setVoitures((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const idx = STATUS_ORDER.indexOf(v.statut);
        if (idx >= STATUS_ORDER.length - 1) return v;
        return { ...v, statut: STATUS_ORDER[idx + 1] as CarStatus };
      }),
    );
  };

  const deleteVoiture = (id: string) => {
    setVoitures((prev) => prev.filter((v) => v.id !== id));
    setInterventions((prev) => prev.filter((i) => i.voitureId !== id));
  };

  const addIntervention = (data: Omit<Intervention, "id">): Intervention => {
    const i: Intervention = { ...data, id: crypto.randomUUID() };
    setInterventions((prev) => [...prev, i]);
    return i;
  };

  const deleteIntervention = (id: string) => {
    setInterventions((prev) => prev.filter((i) => i.id !== id));
  };

  const interventionsFor = (voitureId: string) => {
    return interventions.filter((i) => i.voitureId === voitureId);
  };

  return {
    voitures,
    interventions,
    interventionsFor,
    addVoiture,
    advanceStatut,
    deleteVoiture,
    addIntervention,
    deleteIntervention,
  };
};
