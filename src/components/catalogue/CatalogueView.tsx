import { useState } from "react";
import { Plus, Search, Package, Trash2, Pencil, Check, X, Euro } from "lucide-react";
import { Produit } from "../../types";
import { TKey } from "../../i18n";
import { useProduits } from "../../hooks/useProduits";
import { useSettings } from "../../context/SettingsContext";
import { useToast } from "../Toast";

const fmt = (prix: number) =>
  prix.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

type EditState = { id: string; value: string } | null;
type DeleteState = string | null;

export const CatalogueView = () => {
  const { t } = useSettings();
  const { toast } = useToast();
  const { produits, addProduit, updateProduit, deleteProduit } = useProduits();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [formError, setFormError] = useState("");
  const [editPrice, setEditPrice] = useState<EditState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null);

  const filtered = produits.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const nomTrim = nom.trim();
    const p = parseFloat(prix.replace(",", "."));
    if (!nomTrim) { setFormError("Le nom est obligatoire."); return; }
    if (isNaN(p) || p < 0) { setFormError("Prix invalide."); return; }
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg)" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 24px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "var(--text)",
            flex: 1,
          }}
        >
          {t("cat_title")}
          <span
            style={{
              marginLeft: 10,
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              color: "var(--text-3)",
            }}
          >
            {produits.length} produit{produits.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm((f) => !f); setFormError(""); }}
        >
          {showForm ? <><X size={13} /> {t("btn_cancel")}</> : <><Plus size={13} /> {t("cat_add")}</>}
        </button>
      </div>

      {/* Quick-add form */}
      {showForm && (
        <div
          style={{
            padding: "14px 24px",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <form
            onSubmit={handleAdd}
            style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
          >
            <input
              className="field"
              placeholder={t("cat_name_ph")}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              autoFocus
              style={{ flex: 2 }}
            />
            <div style={{ position: "relative", flex: 1, maxWidth: 160 }}>
              <Euro
                size={13}
                style={{
                  position: "absolute",
                  left: 9,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-3)",
                  pointerEvents: "none",
                }}
              />
              <input
                className="field"
                type="text"
                inputMode="decimal"
                placeholder={t("cat_price_ph")}
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd(e as unknown as React.FormEvent)}
                style={{ paddingLeft: 28 }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Check size={13} /> {t("btn_add")}
            </button>
          </form>
          {formError && (
            <div style={{ fontSize: 12, color: "var(--red)", marginTop: 6 }}>
              {formError}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div
        style={{
          padding: "12px 24px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div style={{ position: "relative", maxWidth: 360 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-3)",
              pointerEvents: "none",
            }}
          />
          <input
            className="field"
            placeholder={t("cat_search_ph")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

      {/* Product grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {filtered.length === 0 ? (
          <div className="empty" style={{ marginTop: 60 }}>
            <Package size={36} style={{ opacity: 0.25, marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-2)" }}>
              {t("cat_empty")}
            </div>
            <div style={{ fontSize: 13 }}>{t("cat_empty_sub")}</div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
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
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 500,
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              borderRadius: 10,
              padding: "20px 24px",
              width: 320,
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}
            >
              {t("del_product_title")}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4 }}>
              <strong style={{ color: "var(--text)" }}>{targetProduit.nom}</strong>
              {" — "}
              {fmt(targetProduit.prix)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 20 }}>
              {t("del_product_body")}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteTarget(null)}
              >
                {t("btn_cancel")}
              </button>
              <button
                className="btn btn-danger"
                style={{ background: "var(--red-dim)", border: "1px solid var(--red)" }}
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
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            background: "var(--surface-3)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Package size={15} style={{ color: "var(--text-3)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              lineHeight: 1.3,
              wordBreak: "break-word",
            }}
          >
            {produit.nom}
          </div>
        </div>
        <button
          className="btn btn-danger"
          style={{ padding: "3px 6px", flexShrink: 0 }}
          onClick={onDelete}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Price */}
      {isEditing ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Euro
              size={12}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-3)",
                pointerEvents: "none",
              }}
            />
            <input
              className="field"
              type="text"
              inputMode="decimal"
              value={editPrice?.value ?? ""}
              onChange={(e) => onEditPriceChange(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditPriceConfirm();
                if (e.key === "Escape") onEditPriceCancel();
              }}
              style={{ paddingLeft: 24, fontSize: 13, height: 32 }}
            />
          </div>
          <button
            onClick={onEditPriceConfirm}
            style={{
              width: 32,
              height: 32,
              background: "var(--green-dim)",
              border: "1px solid var(--green)",
              borderRadius: 6,
              color: "var(--green)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Check size={13} />
          </button>
          <button
            onClick={onEditPriceCancel}
            style={{
              width: 32,
              height: 32,
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text-3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              flex: 1,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 16,
              fontWeight: 600,
              color: "var(--accent)",
            }}
          >
            {produit.prix.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </div>
          <button
            className="btn btn-ghost"
            style={{ padding: "3px 8px", fontSize: 11 }}
            onClick={() => onEditPrice(produit.id)}
          >
            <Pencil size={11} /> {t("cat_edit_price")}
          </button>
        </div>
      )}
    </div>
  );
};
