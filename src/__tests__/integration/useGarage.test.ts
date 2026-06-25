import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGarage } from "../../hooks/useGarage";

beforeEach(() => {
  localStorage.clear();
});

describe("useGarage — voitures", () => {
  it("starts with an empty garage", () => {
    const { result } = renderHook(() => useGarage());
    expect(result.current.voitures).toHaveLength(0);
    expect(result.current.interventions).toHaveLength(0);
  });

  it("adds a voiture with statut 'recue'", () => {
    const { result } = renderHook(() => useGarage());
    act(() => {
      result.current.addVoiture({
        immatriculation: "AB-123-CD",
        marque: "Renault",
        modele: "Clio",
        nomClient: "Dupont",
      });
    });
    expect(result.current.voitures).toHaveLength(1);
    expect(result.current.voitures[0].statut).toBe("recue");
    expect(result.current.voitures[0].immatriculation).toBe("AB-123-CD");
  });

  it("assigns a unique id and createdAt date to each voiture", () => {
    const { result } = renderHook(() => useGarage());
    act(() => {
      result.current.addVoiture({ immatriculation: "AA-001-AA", marque: "A", modele: "A", nomClient: "A" });
      result.current.addVoiture({ immatriculation: "BB-002-BB", marque: "B", modele: "B", nomClient: "B" });
    });
    const [a, b] = result.current.voitures;
    expect(a.id).not.toBe(b.id);
    expect(a.createdAt).toBeTruthy();
  });

  it("advances statut through the full order", () => {
    const { result } = renderHook(() => useGarage());
    let id: string;
    act(() => {
      const v = result.current.addVoiture({ immatriculation: "XY-456-ZA", marque: "P", modele: "308", nomClient: "M" });
      id = v.id;
    });

    act(() => { result.current.advanceStatut(id!); });
    expect(result.current.voitures[0].statut).toBe("en_reparation");

    act(() => { result.current.advanceStatut(id!); });
    expect(result.current.voitures[0].statut).toBe("prete");

    act(() => { result.current.advanceStatut(id!); });
    expect(result.current.voitures[0].statut).toBe("livree");
  });

  it("does not advance beyond 'livree'", () => {
    const { result } = renderHook(() => useGarage());
    let id: string;
    act(() => {
      const v = result.current.addVoiture({ immatriculation: "ZZ-999-ZZ", marque: "X", modele: "X", nomClient: "X" });
      id = v.id;
      result.current.advanceStatut(id);
      result.current.advanceStatut(id);
      result.current.advanceStatut(id);
    });
    act(() => { result.current.advanceStatut(id!); });
    expect(result.current.voitures[0].statut).toBe("livree");
  });

  it("deletes a voiture", () => {
    const { result } = renderHook(() => useGarage());
    let id: string;
    act(() => {
      const v = result.current.addVoiture({ immatriculation: "CD-789-EF", marque: "C", modele: "C3", nomClient: "B" });
      id = v.id;
    });
    act(() => { result.current.deleteVoiture(id!); });
    expect(result.current.voitures).toHaveLength(0);
  });

  it("persists voitures to localStorage", () => {
    const { result } = renderHook(() => useGarage());
    act(() => {
      result.current.addVoiture({ immatriculation: "GH-321-IJ", marque: "Toyota", modele: "Yaris", nomClient: "Petit" });
    });
    const stored = JSON.parse(localStorage.getItem("garage_voitures") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].immatriculation).toBe("GH-321-IJ");
  });
});

describe("useGarage — interventions", () => {
  it("adds an intervention linked to a voiture", () => {
    const { result } = renderHook(() => useGarage());
    let voitureId: string;
    act(() => {
      const v = result.current.addVoiture({ immatriculation: "KL-111-MN", marque: "V", modele: "V", nomClient: "V" });
      voitureId = v.id;
      result.current.addIntervention({ voitureId: v.id, description: "Vidange", prix: 50 });
    });
    expect(result.current.interventionsFor(voitureId!)).toHaveLength(1);
    expect(result.current.interventionsFor(voitureId!)[0].prix).toBe(50);
  });

  it("cascade-deletes interventions when the voiture is deleted", () => {
    const { result } = renderHook(() => useGarage());
    let voitureId: string;
    act(() => {
      const v = result.current.addVoiture({ immatriculation: "OP-222-QR", marque: "W", modele: "W", nomClient: "W" });
      voitureId = v.id;
      result.current.addIntervention({ voitureId: v.id, description: "Freins", prix: 120 });
      result.current.addIntervention({ voitureId: v.id, description: "Pneus", prix: 200 });
    });
    expect(result.current.interventions).toHaveLength(2);
    act(() => { result.current.deleteVoiture(voitureId!); });
    expect(result.current.interventions).toHaveLength(0);
  });

  it("deletes a single intervention without affecting others", () => {
    const { result } = renderHook(() => useGarage());
    let interventionId: string;
    act(() => {
      const v = result.current.addVoiture({ immatriculation: "ST-333-UV", marque: "Z", modele: "Z", nomClient: "Z" });
      result.current.addIntervention({ voitureId: v.id, description: "Courroie", prix: 300 });
      const i = result.current.addIntervention({ voitureId: v.id, description: "Huile", prix: 40 });
      interventionId = i.id;
    });
    act(() => { result.current.deleteIntervention(interventionId!); });
    expect(result.current.interventions).toHaveLength(1);
    expect(result.current.interventions[0].description).toBe("Courroie");
  });
});
