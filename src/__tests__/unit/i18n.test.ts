import { describe, it, expect } from "vitest";
import { translations, t } from "../../i18n";

describe("translations", () => {
  it("fr and en have the exact same keys", () => {
    const frKeys = Object.keys(translations.fr).sort();
    const enKeys = Object.keys(translations.en).sort();
    expect(frKeys).toEqual(enKeys);
  });

  it("no translation value is an empty string", () => {
    Object.entries(translations.fr).forEach(([key, val]) => {
      expect(val.length, `fr.${key} is empty`).toBeGreaterThan(0);
    });
    Object.entries(translations.en).forEach(([key, val]) => {
      expect(val.length, `en.${key} is empty`).toBeGreaterThan(0);
    });
  });
});

describe("t()", () => {
  it("returns the french translation", () => {
    expect(t("fr", "nav_voitures")).toBe("Véhicules");
    expect(t("fr", "btn_cancel")).toBe("Annuler");
    expect(t("fr", "caisse_total")).toBe("Total");
  });

  it("returns the english translation", () => {
    expect(t("en", "nav_voitures")).toBe("Vehicles");
    expect(t("en", "btn_cancel")).toBe("Cancel");
    expect(t("en", "caisse_total")).toBe("Total");
  });

  it("returns different values for fr and en", () => {
    expect(t("fr", "nav_voitures")).not.toBe(t("en", "nav_voitures"));
    expect(t("fr", "btn_delete")).not.toBe(t("en", "btn_delete"));
  });
});
