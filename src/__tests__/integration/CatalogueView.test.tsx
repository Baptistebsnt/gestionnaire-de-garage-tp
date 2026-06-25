import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { CatalogueView } from "../../components/catalogue/CatalogueView";
import { SettingsProvider } from "../../context/SettingsContext";
import { ToastProvider } from "../../components/Toast";

// Prevent real HTTP calls to OpenFoodFacts
vi.mock("../../services/openFoodFacts", () => ({
  searchOFF: vi.fn().mockResolvedValue([]),
  lookupOFF: vi.fn().mockResolvedValue(null),
}));

const Providers = ({ children }: { children: ReactNode }) => (
  <SettingsProvider>
    <ToastProvider>{children}</ToastProvider>
  </SettingsProvider>
);

const renderCatalogue = () =>
  render(<CatalogueView />, { wrapper: Providers });

// Helper: open the form, switch to manual mode, fill and submit
const addProductManually = async (nom: string, prix: string) => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /nouveau produit/i }));
  await user.click(screen.getByRole("button", { name: /manuel/i }));
  await user.type(screen.getByPlaceholderText("Nom du produit"), nom);
  await user.type(screen.getByPlaceholderText("Prix (€)"), prix);
  await user.click(screen.getByRole("button", { name: /ajouter/i }));
};

beforeEach(() => {
  localStorage.clear();
});

describe("CatalogueView — empty state", () => {
  it("shows the page title", () => {
    renderCatalogue();
    expect(screen.getByText("Catalogue produits")).toBeTruthy();
  });

  it("shows the empty state message when no products", () => {
    renderCatalogue();
    expect(screen.getByText("Aucun produit")).toBeTruthy();
  });

  it("displays the product count in the header", () => {
    renderCatalogue();
    // The count span renders as "0 produits" — use exact string to avoid matching other elements
    expect(screen.getByText("0 produits")).toBeTruthy();
  });
});

describe("CatalogueView — add form", () => {
  it("opens the form on 'Nouveau produit' click", async () => {
    const user = userEvent.setup();
    renderCatalogue();
    await user.click(screen.getByRole("button", { name: /nouveau produit/i }));
    expect(screen.getByText("OpenFoodFacts")).toBeTruthy();
    expect(screen.getByText("Manuel")).toBeTruthy();
  });

  it("closes the form and shows 'Annuler' label when open", async () => {
    const user = userEvent.setup();
    renderCatalogue();
    await user.click(screen.getByRole("button", { name: /nouveau produit/i }));
    expect(screen.getByRole("button", { name: /annuler/i })).toBeTruthy();
  });

  it("adds a product in manual mode and shows it in the grid", async () => {
    renderCatalogue();
    await addProductManually("Filtre à air", "8.50");
    expect(screen.getByText("Filtre à air")).toBeTruthy();
    expect(screen.getByText("8,50 €")).toBeTruthy();
  });

  it("closes the form after a successful add", async () => {
    renderCatalogue();
    await addProductManually("Bougie NGK", "5");
    // Form inputs should be gone
    expect(screen.queryByPlaceholderText("Nom du produit")).toBeNull();
  });

  it("shows an error when name is empty", async () => {
    const user = userEvent.setup();
    renderCatalogue();
    await user.click(screen.getByRole("button", { name: /nouveau produit/i }));
    await user.click(screen.getByRole("button", { name: /manuel/i }));
    await user.type(screen.getByPlaceholderText("Prix (€)"), "10");
    await user.click(screen.getByRole("button", { name: /ajouter/i }));
    expect(screen.getByText("Le nom est obligatoire.")).toBeTruthy();
  });

  it("shows an error when price is invalid", async () => {
    const user = userEvent.setup();
    renderCatalogue();
    await user.click(screen.getByRole("button", { name: /nouveau produit/i }));
    await user.click(screen.getByRole("button", { name: /manuel/i }));
    await user.type(screen.getByPlaceholderText("Nom du produit"), "Test");
    await user.type(screen.getByPlaceholderText("Prix (€)"), "abc");
    await user.click(screen.getByRole("button", { name: /ajouter/i }));
    expect(screen.getByText("Prix invalide.")).toBeTruthy();
  });
});

describe("CatalogueView — search", () => {
  it("filters products by name (case-insensitive)", async () => {
    renderCatalogue();
    await addProductManually("Filtre à air", "8");
    await addProductManually("Bougie NGK", "5");

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Rechercher un produit..."), "filtre");

    expect(screen.getByText("Filtre à air")).toBeTruthy();
    expect(screen.queryByText("Bougie NGK")).toBeNull();
  });

  it("shows all products when search is cleared", async () => {
    renderCatalogue();
    await addProductManually("Plaquettes", "30");
    await addProductManually("Disque", "60");

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText("Rechercher un produit...");
    await user.type(searchInput, "plaq");
    await user.clear(searchInput);

    expect(screen.getByText("Plaquettes")).toBeTruthy();
    expect(screen.getByText("Disque")).toBeTruthy();
  });
});

describe("CatalogueView — delete", () => {
  it("shows the delete confirmation modal", async () => {
    renderCatalogue();
    await addProductManually("Batterie", "89");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Supprimer" }));

    // The modal title is unique (the product name appears twice: card + modal)
    expect(screen.getByText("Supprimer ce produit ?")).toBeTruthy();
    expect(screen.getByText("Cette action est irréversible.")).toBeTruthy();
  });

  it("cancels deletion and keeps the product", async () => {
    renderCatalogue();
    await addProductManually("Courroie", "45");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    await user.click(screen.getByRole("button", { name: /annuler/i }));

    expect(screen.getByText("Courroie")).toBeTruthy();
    expect(screen.queryByText("Supprimer ce produit ?")).toBeNull();
  });

  it("confirms deletion and removes the product from the grid", async () => {
    renderCatalogue();
    await addProductManually("Vieux filtre", "3");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Supprimer" }));

    // Confirm in the modal — there are now TWO "Supprimer" buttons (card + modal).
    // The modal's confirm button is the one inside the modal.
    const modal = screen.getByText("Supprimer ce produit ?").closest("div")!.parentElement!;
    const confirmBtn = within(modal).getByRole("button", { name: /supprimer/i });
    await user.click(confirmBtn);

    expect(screen.queryByText("Vieux filtre")).toBeNull();
    expect(screen.getByText("Aucun produit")).toBeTruthy();
  });
});
