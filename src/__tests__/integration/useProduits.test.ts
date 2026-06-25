import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProduits } from "../../hooks/useProduits";

beforeEach(() => {
  localStorage.clear();
});

describe("useProduits", () => {
  it("starts with an empty list", () => {
    const { result } = renderHook(() => useProduits());
    expect(result.current.produits).toHaveLength(0);
  });

  it("adds a basic product with generated id and createdAt", () => {
    const { result } = renderHook(() => useProduits());
    act(() => {
      result.current.addProduit({ nom: "Filtre à huile", prix: 12.5 });
    });
    expect(result.current.produits).toHaveLength(1);
    const p = result.current.produits[0];
    expect(p.nom).toBe("Filtre à huile");
    expect(p.prix).toBe(12.5);
    expect(p.id).toBeTruthy();
    expect(p.createdAt).toBeTruthy();
  });

  it("adds a product enriched with OpenFoodFacts data", () => {
    const { result } = renderHook(() => useProduits());
    act(() => {
      result.current.addProduit({
        nom: "Huile moteur 5W40",
        prix: 25.99,
        barcode: "3299255309342",
        imageUrl: "https://example.com/img.jpg",
        marque: "Castrol",
      });
    });
    const p = result.current.produits[0];
    expect(p.barcode).toBe("3299255309342");
    expect(p.marque).toBe("Castrol");
    expect(p.imageUrl).toBe("https://example.com/img.jpg");
  });

  it("prepends new products (most recent first)", () => {
    const { result } = renderHook(() => useProduits());
    act(() => {
      result.current.addProduit({ nom: "Premier", prix: 10 });
      result.current.addProduit({ nom: "Deuxième", prix: 20 });
    });
    expect(result.current.produits[0].nom).toBe("Deuxième");
    expect(result.current.produits[1].nom).toBe("Premier");
  });

  it("updates only the price without touching other fields", () => {
    const { result } = renderHook(() => useProduits());
    let id: string;
    act(() => {
      const p = result.current.addProduit({ nom: "Bougie NGK", prix: 5, marque: "NGK" });
      id = p.id;
    });
    act(() => {
      result.current.updateProduit(id!, { prix: 7.5 });
    });
    const p = result.current.produits[0];
    expect(p.prix).toBe(7.5);
    expect(p.nom).toBe("Bougie NGK");
    expect(p.marque).toBe("NGK");
  });

  it("deletes a product by id", () => {
    const { result } = renderHook(() => useProduits());
    let id: string;
    act(() => {
      result.current.addProduit({ nom: "Plaquettes", prix: 30 });
      const p = result.current.addProduit({ nom: "Disque de frein", prix: 60 });
      id = p.id;
    });
    act(() => {
      result.current.deleteProduit(id!);
    });
    expect(result.current.produits).toHaveLength(1);
    expect(result.current.produits[0].nom).toBe("Plaquettes");
  });

  it("persists products to localStorage", () => {
    const { result } = renderHook(() => useProduits());
    act(() => {
      result.current.addProduit({ nom: "Batterie 72Ah", prix: 89 });
    });
    const stored = JSON.parse(localStorage.getItem("garage_produits") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].nom).toBe("Batterie 72Ah");
  });

  it("loads persisted products from localStorage on mount", () => {
    localStorage.setItem(
      "garage_produits",
      JSON.stringify([{ id: "test-id", nom: "Précédent", prix: 15, createdAt: new Date().toISOString() }]),
    );
    const { result } = renderHook(() => useProduits());
    expect(result.current.produits).toHaveLength(1);
    expect(result.current.produits[0].nom).toBe("Précédent");
  });
});
