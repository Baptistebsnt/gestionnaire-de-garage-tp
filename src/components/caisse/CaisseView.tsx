import { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Package,
  Search,
} from "lucide-react";
import { LigneVente } from "../../types";
import { useProduits } from "../../hooks/useProduits";
import { useVentes } from "../../hooks/useVentes";
import { useSettings } from "../../context/SettingsContext";
import { useToast } from "../Toast";
import { cn } from "../../lib/cn";

type NavTab = "voitures" | "catalogue" | "caisse" | "ventes";

type Props = {
  onNavigate: (tab: NavTab) => void;
};

export const CaisseView = ({ onNavigate }: Props) => {
  const { t, lang } = useSettings();
  const { toast }   = useToast();
  const { produits } = useProduits();
  const { addVente } = useVentes();

  const [search, setSearch] = useState("");
  const [panier, setPanier] = useState<LigneVente[]>([]);
  const [success, setSuccess] = useState(false);

  const produitsFiltres = produits.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase()),
  );

  const addToCart = (id: string) => {
    const prod = produits.find((p) => p.id === id);
    if (!prod) return;
    setPanier((prev) => {
      const existing = prev.find((l) => l.produitId === id);
      if (existing) {
        return prev.map((l) =>
          l.produitId === id ? { ...l, quantite: l.quantite + 1 } : l,
        );
      }
      return [...prev, { produitId: id, nom: prod.nom, prix: prod.prix, quantite: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setPanier((prev) =>
      prev
        .map((l) => l.produitId === id ? { ...l, quantite: l.quantite + delta } : l)
        .filter((l) => l.quantite > 0),
    );
  };

  const removeLine = (id: string) => {
    setPanier((prev) => prev.filter((l) => l.produitId !== id));
  };

  const total = panier.reduce((s, l) => s + l.prix * l.quantite, 0);

  const fmt = (v: number) =>
    v.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", {
      style: "currency",
      currency: "EUR",
    });

  const handleValidate = () => {
    if (panier.length === 0) return;
    addVente(panier);
    setPanier([]);
    setSearch("");
    setSuccess(true);
    toast(`${t("notif_sale_done")} — ${fmt(total)}`);
    setTimeout(() => setSuccess(false), 2200);
  };

  return (
    <div className="flex h-full overflow-hidden bg-bg">

      {/* ── Products panel ── */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-border">

        {/* Products header */}
        <div className="shrink-0 border-b border-border bg-surface px-5 pb-3 pt-3.5">
          <p className="mb-2.5 font-display text-[13px] font-bold uppercase tracking-[0.1em] text-fg-3">
            {t("caisse_products")}
          </p>
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-3"
            />
            <input
              className="field pl-8"
              placeholder={t("cat_search_ph")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto px-5 py-3.5">
          {produits.length === 0 ? (
            <div className="empty mt-10">
              <Package size={32} className="mb-2 opacity-25" />
              <p className="text-[13px] text-fg-2">{t("caisse_no_products")}</p>
              <button className="btn btn-ghost mt-1" onClick={() => onNavigate("catalogue")}>
                {t("caisse_go_catalogue")}
              </button>
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
              {produitsFiltres.map((p) => {
                const inCart = panier.find((l) => l.produitId === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p.id)}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1.5 rounded-[10px] border px-3.5 py-3 text-left transition-all duration-150",
                      inCart
                        ? "border-accent bg-accent-dim"
                        : "border-border bg-surface-2 hover:border-border-2 hover:bg-surface-3"
                    )}
                  >
                    <p className={cn("text-xs font-semibold leading-[1.3]", inCart ? "text-accent" : "text-fg")}>
                      {p.nom}
                    </p>
                    <p className={cn("font-mono text-sm font-semibold", inCart ? "text-accent" : "text-fg-2")}>
                      {fmt(p.prix)}
                    </p>
                    {inCart && (
                      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-accent">
                        × {inCart.quantite}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Cart panel ── */}
      <div className="flex w-[340px] shrink-0 flex-col overflow-hidden bg-surface">

        {/* Cart header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 pb-3 pt-3.5">
          <div className="flex items-center gap-1.5 font-display text-[13px] font-bold uppercase tracking-[0.1em] text-fg-3">
            <ShoppingCart size={14} />
            {t("caisse_cart")}
            {panier.length > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-px font-sans text-[10px] font-bold text-[#0c0c12]">
                {panier.reduce((s, l) => s + l.quantite, 0)}
              </span>
            )}
          </div>
          {panier.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPanier([])}
            >
              {t("caisse_clear")}
            </button>
          )}
        </div>

        {/* Cart lines */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {panier.length === 0 ? (
            <div className="empty mt-12">
              <ShoppingCart size={28} className="mb-2 opacity-20" />
              <p className="text-[13px] text-fg-2">{t("caisse_cart_empty")}</p>
              <p className="text-xs">{t("caisse_cart_empty_sub")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {panier.map((l) => (
                <div
                  key={l.produitId}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-xs font-medium leading-[1.3] text-fg">
                      {l.nom}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-fg-2">
                      {fmt(l.prix)} × {l.quantite} ={" "}
                      <strong className="text-fg">{fmt(l.prix * l.quantite)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => changeQty(l.produitId, -1)}
                      className="btn-icon size-6 rounded border border-border bg-surface-3 text-fg-2 hover:text-fg"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="min-w-5 text-center text-[13px] font-semibold text-fg">
                      {l.quantite}
                    </span>
                    <button
                      onClick={() => changeQty(l.produitId, 1)}
                      className="btn-icon size-6 rounded border border-border bg-surface-3 text-fg-2 hover:text-fg"
                    >
                      <Plus size={11} />
                    </button>
                    <button
                      onClick={() => removeLine(l.produitId)}
                      className="btn-icon ml-0.5 size-6 text-fg-3 hover:text-danger"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart footer */}
        <div className="shrink-0 border-t border-border px-4 py-3.5">
          <div className="mb-3 flex items-center justify-between rounded-lg border border-[rgba(245,158,11,0.25)] bg-accent-dim px-3.5 py-2.5">
            <span className="font-display text-[13px] font-bold uppercase tracking-[0.08em] text-accent">
              {t("caisse_total")}
            </span>
            <span className="font-mono text-[22px] font-bold text-accent">
              {fmt(total)}
            </span>
          </div>

          <button
            className={cn(
              "btn btn-primary w-full justify-center py-2.5 text-sm font-semibold gap-2 transition-all duration-200",
              success && "bg-success border-success"
            )}
            disabled={panier.length === 0}
            onClick={handleValidate}
          >
            <CheckCircle size={15} />
            {success ? t("notif_sale_done") : t("caisse_validate")}
          </button>
        </div>
      </div>
    </div>
  );
};
