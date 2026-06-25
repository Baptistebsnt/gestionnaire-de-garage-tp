import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchOFF, lookupOFF } from "../../services/openFoodFacts";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("searchOFF", () => {
  it("returns an empty array for an empty query without calling fetch", async () => {
    const results = await searchOFF("");
    expect(results).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns an empty array for a whitespace-only query", async () => {
    const results = await searchOFF("   ");
    expect(results).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns only products that have a product_name", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [
          { code: "111", product_name: "Huile moteur", brands: "Castrol" },
          { code: "222", product_name: "" },
          { code: "333", product_name: "Filtre à air" },
        ],
      }),
    });
    const results = await searchOFF("huile");
    expect(results).toHaveLength(2);
    expect(results[0].product_name).toBe("Huile moteur");
    expect(results[1].product_name).toBe("Filtre à air");
  });

  it("returns an empty array when fetch fails", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    const results = await searchOFF("test");
    expect(results).toEqual([]);
  });

  it("calls the correct OpenFoodFacts URL", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ products: [] }),
    });
    await searchOFF("bougie NGK");
    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("world.openfoodfacts.org");
    expect(calledUrl).toContain("bougie%20NGK");
    expect(calledUrl).toContain("json=1");
  });
});

describe("lookupOFF", () => {
  it("returns null for an empty barcode without calling fetch", async () => {
    const result = await lookupOFF("");
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns the product when status is 1", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 1,
        product: { code: "3299255309342", product_name: "Huile moteur", brands: "Shell" },
      }),
    });
    const result = await lookupOFF("3299255309342");
    expect(result).not.toBeNull();
    expect(result!.product_name).toBe("Huile moteur");
    expect(result!.brands).toBe("Shell");
  });

  it("returns null when the product is not found (status 0)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 0, product: null }),
    });
    const result = await lookupOFF("0000000000000");
    expect(result).toBeNull();
  });

  it("returns null when the product has no name", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 1,
        product: { code: "123", product_name: "" },
      }),
    });
    const result = await lookupOFF("123");
    expect(result).toBeNull();
  });

  it("returns null when fetch fails", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    const result = await lookupOFF("123456789");
    expect(result).toBeNull();
  });
});
