import { useState, useEffect, useRef } from "react";
import { Plus, Search, Package, Trash2, Pencil, Check, X, Euro, Barcode, Loader2, ChevronRight } from "lucide-react";
import { Produit } from "../../types";
import { TKey } from "../../i18n";
import { useProduits } from "../../hooks/useProduits";
import { useSettings } from "../../context/SettingsContext";
import { useToast } from "../Toast";
import { OFFProduct, searchOFF, lookupOFF } from "../../services/openFoodFacts";
import { cn } from "../../lib/cn";

const fmt = (prix: number) =>
  prix.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

type EditState   = { id: string; value: string } | null;
type DeleteState = string | null;
type Mode        = "off" | "manual";

/* ── OpenFoodFacts search sub-form ── */
type OFFFormProps = {
  t: (key: TKey) => string;
  onSelect: (p: OFFProduct) => void;
};

const OFFForm = ({ t, onSelect }: OFFFormProps) => {
  const [query, setQuery]         = useState("");
  const [barcode, setBarcode]     = useState("");
  const [results, setResults]     = useState<OFFProduct[]>([]);
  const [loading, setLoading]     = useState(false);
  const [barcodeErr, setBarcodeErr] = useState(false);
  const [open, setOpen]           = useState(false);
  const debounceRef               = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await searchOFF(query);
      setResults(res);
      setOpen(res.length > 0);
      setLoading(false);
    }, 420);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLookup = async () => {
    if (!barcode.trim()) return;
    setBarcodeErr(false);
    setLoading(true);
    const product = await lookupOFF(barcode);
    setLoading(false);
    if (product) {
      onSelect(product);
      setBarcode("");
    } else {
      setBarcodeErr(true);
    }
  };

  const handleSelect = (p: OFFProduct) => {
    setOpen(false);
    setQuery("");
    onSelect(p);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Name search */}
      <div ref={dropdownRef} className="relative">
        <div className="relative">
          {loading
            ? <Loader2 size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 animate-spin text-fg-3" />
            : <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-3" />
          }
          <input
            className="field pl-8"
            placeholder={t("off_search_ph")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            autoFocus
          />
        </div>

        {/* Dropdown */}
        {open && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[240px] overflow-y-auto rounded-xl border border-border-2 bg-surface-2 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
            {results.map((p) => (
              <button
                key={p.code}
                onClick={() => handleSelect(p)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 hover:bg-surface-3"
              >
                {p.image_thumb_url ? (
                  <img
                    src={p.image_thumb_url}
                    alt=""
                    className="size-9 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-3">
                    <Package size={16} className="text-fg-3" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-fg">{p.product_name}</p>
                  {p.brands && (
                    <p className="truncate text-[11px] text-fg-3">{p.brands}</p>
                  )}
                </div>
                <ChevronRight size={13} className="shrink-0 text-fg-3" />
              </button>
            ))}
          </div>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <p className="mt-1 text-[11px] text-fg-3">{t("off_no_results")}</p>
        )}
      </div>

      {/* Barcode lookup */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Barcode size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-3" />
          <input
            className={cn("field pl-8", barcodeErr && "border-danger")}
            placeholder={t("off_barcode_ph")}
            value={barcode}
            onChange={(e) => { setBarcode(e.target.value); setBarcodeErr(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleLookup(); } }}
          />
        </div>
        <button
          type="button"
          onClick={handleLookup}
          disabled={!barcode.trim() || loading}
          className="btn btn-ghost shrink-0"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : t("off_barcode_lookup")}
        </button>
      </div>
      {barcodeErr && (
        <p className="text-[11px] text-danger">{t("off_barcode_not_found")}</p>
      )}
    </div>
  );
};

/* ── Main catalogue view ── */

export const CatalogueView = () => {
  const { t } = useSettings();
  const { toast } = useToast();
  const { produits, addProduit, updateProduit, deleteProduit } = useProduits();

  const [search, setSearch]             = useState("");
  const [showForm, setShowForm]         = useState(false);
  const [mode, setMode]                 = useState<Mode>("off");
  const [nom, setNom]                   = useState("");
  const [prix, setPrix]                 = useState("");
  const [formError, setFormError]       = useState("");
  const [offSelected, setOffSelected]   = useState<OFFProduct | null>(null);
  const [editPrice, setEditPrice]       = useState<EditState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null);

  const filtered = produits.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase()),
  );

  const resetForm = () => {
    setNom(""); setPrix(""); setFormError(""); setOffSelected(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const nomFinal = mode === "off" && offSelected ? offSelected.product_name : nom.trim();
    const p = parseFloat(prix.replace(",", "."));
    if (!nomFinal)          { setFormError("Le nom est obligatoire."); return; }
    if (isNaN(p) || p < 0) { setFormError("Prix invalide.");          return; }

    addProduit({
      nom: nomFinal,
      prix: p,
      ...(offSelected ? {
        barcode:  offSelected.code,
        imageUrl: offSelected.image_thumb_url,
        marque:   offSelected.brands,
      } : {}),
    });

    resetForm();
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

  const toggleForm = () => {
    setShowForm((f) => !f);
    resetForm();
    setFormError("");
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
          onClick={toggleForm}
        >
          {showForm
            ? <><X size={13} /> {t("btn_cancel")}</>
            : <><Plus size={13} /> {t("cat_add")}</>}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="shrink-0 border-b border-border bg-surface px-6 py-4">
          {/* Mode toggle */}
          <div className="mb-4 flex gap-1 rounded-lg border border-border bg-surface-2 p-0.5">
            {(["off", "manual"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); resetForm(); }}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium transition-all duration-150",
                  mode === m
                    ? "bg-surface-4 text-fg shadow-sm"
                    : "text-fg-3 hover:text-fg-2"
                )}
              >
                {m === "off"
                  ? <><Search size={12} /> {t("off_mode_off")}</>
                  : <><Pencil size={12} /> {t("off_mode_manual")}</>
                }
              </button>
            ))}
          </div>

          <form onSubmit={handleAdd} className="flex flex-col gap-2.5">

            {mode === "off" ? (
              offSelected ? (
                /* Selected product chip */
                <div className="flex items-center gap-3 rounded-xl border border-accent-border bg-accent-dim px-3.5 py-3">
                  {offSelected.image_thumb_url ? (
                    <img
                      src={offSelected.image_thumb_url}
                      alt=""
                      className="size-10 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-dim border border-accent-border">
                      <Package size={18} className="text-accent" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-fg">
                      {offSelected.product_name}
                    </p>
                    {offSelected.brands && (
                      <p className="truncate text-[11px] text-fg-3">{offSelected.brands}</p>
                    )}
                    <p className="text-[10px] font-mono text-fg-3 mt-0.5">{offSelected.code}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOffSelected(null)}
                    className="btn btn-ghost btn-sm shrink-0"
                  >
                    {t("off_change")}
                  </button>
                </div>
              ) : (
                <OFFForm t={t} onSelect={setOffSelected} />
              )
            ) : (
              /* Manual mode */
              <input
                className="field"
                placeholder={t("cat_name_ph")}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                autoFocus
              />
            )}

            {/* Price + submit */}
            <div className="flex items-start gap-2">
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={mode === "off" && !offSelected}
              >
                <Check size={13} /> {t("btn_add")}
              </button>
            </div>

            {formError && (
              <p className="text-[11px] text-danger">{formError}</p>
            )}
          </form>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
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
                className="btn btn-danger"
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
        {produit.imageUrl ? (
          <img
            src={produit.imageUrl}
            alt={produit.nom}
            className="size-9 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-3">
            <Package size={15} className="text-fg-3" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="break-words text-[13px] font-semibold leading-[1.3] text-fg">
            {produit.nom}
          </p>
          {produit.marque && (
            <p className="mt-0.5 text-[11px] text-fg-3">{produit.marque}</p>
          )}
          {produit.barcode && (
            <p className="mt-0.5 font-mono text-[10px] text-fg-3">{produit.barcode}</p>
          )}
        </div>
        <button className="btn btn-danger btn-sm shrink-0" onClick={onDelete} aria-label={t("btn_delete")}>
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
