import { useState } from "react";
import { Plus, Search, Package, Trash2, Pencil, Check, X, Euro } from "lucide-react";
import { Produit } from "../../types";
import { TKey } from "../../i18n";
import { useProduits } from "../../hooks/useProduits";
import { useSettings } from "../../context/SettingsContext";
import { useToast } from "../Toast";

const fmt = (prix: number) =>
  prix.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

type EditState   = { id: string; value: string } | null;
type DeleteState = string | null;

export const CatalogueView = () => {
  const { t } = useSettings();
  const { toast } = useToast();
  const { produits, addProduit, updateProduit, deleteProduit } = useProduits();

  const [search, setSearch]           = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [nom, setNom]                 = useState("");
  const [prix, setPrix]               = useState("");
  const [formError, setFormError]     = useState("");
  const [editPrice, setEditPrice]     = useState<EditState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null);

  const filtered = produits.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const nomTrim = nom.trim();
    const p = parseFloat(prix.replace(",", "."));
    if (!nomTrim)          { setFormError("Le nom est obligatoire."); return; }
    if (isNaN(p) || p < 0) { setFormError("Prix invalide.");          return; }
    addProduit({ nom: nomTrim, prix: p });
    setNom("");
    setPrix("");
    setFormError("");
    setShowForm(false);
    toast(t("notif_product_added"));
  };

  const handleEditPriceConfirm = (id: string) => {
    if (!editPrice || editPrice.id !== id) return;
    const p = parseFloat(editPrice.value.replace(",", "."));
    if (!isNaN(p) && p >= 0) {
      updateProduit(id, { prix: p });
      toast(t("notif_price_updated"));
    }
    setEditPrice(null);
  };

  const handleDelete = (id: string) => {
    deleteProduit(id);
    setDeleteTarget(null);
    toast(t("notif_product_deleted"));
  };

  const targetProduit = produits.find((p) => p.id === deleteTarget);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-bg">

      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-6 pb-3.5 pt-4">
        <div className="flex-1">
          <span className="font-display text-lg font-bold tracking-[0.04em] text-fg">
            {t("cat_title")}
          </span>
          <span className="ml-2.5 font-sans text-xs font-normal text-fg-3">
            {produits.length} produit{produits.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm((f) => !f); setFormError(""); }}
        >
          {showForm
            ? <><X size={13} /> {t("btn_cancel")}</>
            : <><Plus size={13} /> {t("cat_add")}</>}
        </button>
      </div>

      {/* Quick-add form */}
      {showForm && (
        <div className="shrink-0 border-b border-border bg-surface px-6 py-3.5">
          <form onSubmit={handleAdd} className="flex items-start gap-2">
            <input
              className="field flex-[2]"
              placeholder={t("cat_name_ph")}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              autoFocus
            />
            <div className="relative max-w-40 flex-1">
              <Euro
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-3"
              />
              <input
                className="field pl-7"
                type="text"
                inputMode="decimal"
                placeholder={t("cat_price_ph")}
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Check size={13} /> {t("btn_add")}
            </button>
          </form>
          {formError && (
            <p className="mt-1.5 text-xs text-danger">{formError}</p>
          )}
        </div>
      )}

      {/* Search */}
      <div className="shrink-0 border-b border-border bg-surface px-6 py-3">
        <div className="relative max-w-[360px]">
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

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {filtered.length === 0 ? (
          <div className="empty mt-16">
            <Package size={36} className="mb-2 opacity-25" />
            <p className="text-sm font-medium text-fg-2">{t("cat_empty")}</p>
            <p className="text-[13px]">{t("cat_empty_sub")}</p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            {filtered.map((p) => (
              <ProduitCard
                key={p.id}
                produit={p}
                editPrice={editPrice}
                onEditPrice={(id) => setEditPrice({ id, value: String(p.prix) })}
                onEditPriceChange={(val) =>
                  setEditPrice((s) => (s ? { ...s, value: val } : s))
                }
                onEditPriceConfirm={() => handleEditPriceConfirm(p.id)}
                onEditPriceCancel={() => setEditPrice(null)}
                onDelete={() => setDeleteTarget(p.id)}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && targetProduit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-[320px] rounded-[10px] border border-border-2 bg-surface px-6 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1.5 text-[15px] font-semibold text-fg">
              {t("del_product_title")}
            </p>
            <p className="mb-1 text-[13px] text-fg-2">
              <strong className="text-fg">{targetProduit.nom}</strong>
              {" — "}
              {fmt(targetProduit.prix)}
            </p>
            <p className="mb-5 text-xs text-fg-3">{t("del_product_body")}</p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                {t("btn_cancel")}
              </button>
              <button
                className="btn border border-danger bg-danger-dim text-danger hover:bg-danger hover:text-white"
                onClick={() => handleDelete(deleteTarget)}
              >
                <Trash2 size={13} /> {t("btn_delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Product card sub-component ── */

type ProduitCardProps = {
  produit: Produit;
  editPrice: EditState;
  onEditPrice: (id: string) => void;
  onEditPriceChange: (val: string) => void;
  onEditPriceConfirm: () => void;
  onEditPriceCancel: () => void;
  onDelete: () => void;
  t: (key: TKey) => string;
};

const ProduitCard = ({
  produit,
  editPrice,
  onEditPrice,
  onEditPriceChange,
  onEditPriceConfirm,
  onEditPriceCancel,
  onDelete,
  t,
}: ProduitCardProps) => {
  const isEditing = editPrice?.id === produit.id;

  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] border border-border bg-surface-2 px-4 py-3.5 transition-colors duration-150 hover:border-border-2">
      <div className="flex items-start gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-3">
          <Package size={15} className="text-fg-3" />
        </div>
        <p className="min-w-0 flex-1 break-words text-[13px] font-semibold leading-[1.3] text-fg">
          {produit.nom}
        </p>
        <button className="btn btn-danger btn-sm shrink-0" onClick={onDelete}>
          <Trash2 size={12} />
        </button>
      </div>

      {/* Price — display or edit */}
      {isEditing ? (
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Euro
              size={12}
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-fg-3"
            />
            <input
              className="field h-8 pl-6 text-[13px]"
              type="text"
              inputMode="decimal"
              value={editPrice?.value ?? ""}
              onChange={(e) => onEditPriceChange(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter")  onEditPriceConfirm();
                if (e.key === "Escape") onEditPriceCancel();
              }}
            />
          </div>
          <button
            onClick={onEditPriceConfirm}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-success bg-success-dim text-success hover:bg-success hover:text-white transition-colors duration-150"
          >
            <Check size={13} />
          </button>
          <button
            onClick={onEditPriceCancel}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-fg-3 hover:bg-surface-3 transition-colors duration-150"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="flex-1 font-mono text-base font-semibold text-accent">
            {produit.prix.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => onEditPrice(produit.id)}>
            <Pencil size={11} /> {t("cat_edit_price")}
          </button>
        </div>
      )}
    </div>
  );
};
