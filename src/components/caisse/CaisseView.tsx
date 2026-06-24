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

type NavTab = "voitures" | "catalogue" | "caisse" | "ventes";

type Props = {
  onNavigate: (tab: NavTab) => void;
};

export const CaisseView = ({ onNavigate }: Props) => {
  const { t, lang } = useSettings();
  const { toast } = useToast();
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
      return [
        ...prev,
        { produitId: id, nom: prod.nom, prix: prod.prix, quantite: 1 },
      ];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setPanier((prev) =>
      prev
        .map((l) =>
          l.produitId === id ? { ...l, quantite: l.quantite + delta } : l,
        )
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
    <div
      style={{
        display: "flex",
        height: "100%",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* Products panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 20px 12px",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-3)",
              marginBottom: 10,
            }}
          >
            {t("caisse_products")}
          </div>
          <div style={{ position: "relative" }}>
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

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          {produits.length === 0 ? (
            <div className="empty" style={{ marginTop: 40 }}>
              <Package size={32} style={{ opacity: 0.25, marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 8 }}>
                {t("caisse_no_products")}
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => onNavigate("catalogue")}
              >
                {t("caisse_go_catalogue")}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 8,
              }}
            >
              {produitsFiltres.map((p) => {
                const inCart = panier.find((l) => l.produitId === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p.id)}
                    style={{
                      background: inCart
                        ? "var(--accent-dim)"
                        : "var(--surface-2)",
                      border: "1px solid",
                      borderColor: inCart ? "var(--accent)" : "var(--border)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.12s",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: inCart ? "var(--accent)" : "var(--text)",
                        lineHeight: 1.3,
                      }}
                    >
                      {p.nom}
                    </div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 14,
                        fontWeight: 600,
                        color: inCart ? "var(--accent)" : "var(--text-2)",
                      }}
                    >
                      {fmt(p.prix)}
                    </div>
                    {inCart && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--accent)",
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        × {inCart.quantite}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart panel */}
      <div
        style={{
          width: 340,
          display: "flex",
          flexDirection: "column",
          background: "var(--surface)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "14px 20px 12px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-3)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ShoppingCart size={14} />
            {t("caisse_cart")}
            {panier.length > 0 && (
              <span
                style={{
                  background: "var(--accent)",
                  color: "#0c0c12",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 6px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {panier.reduce((s, l) => s + l.quantite, 0)}
              </span>
            )}
          </div>
          {panier.length > 0 && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: "3px 8px" }}
              onClick={() => setPanier([])}
            >
              {t("caisse_clear")}
            </button>
          )}
        </div>

        {/* Cart lines */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {panier.length === 0 ? (
            <div className="empty" style={{ marginTop: 48 }}>
              <ShoppingCart size={28} style={{ opacity: 0.2, marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                {t("caisse_cart_empty")}
              </div>
              <div style={{ fontSize: 12 }}>{t("caisse_cart_empty_sub")}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {panier.map((l) => (
                <div
                  key={l.produitId}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--text)",
                        lineHeight: 1.3,
                        wordBreak: "break-word",
                      }}
                    >
                      {l.nom}
                    </div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        color: "var(--text-2)",
                        marginTop: 2,
                      }}
                    >
                      {fmt(l.prix)} × {l.quantite} ={" "}
                      <strong style={{ color: "var(--text)" }}>
                        {fmt(l.prix * l.quantite)}
                      </strong>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <button
                      onClick={() => changeQty(l.produitId, -1)}
                      style={{
                        width: 24,
                        height: 24,
                        background: "var(--surface-3)",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        color: "var(--text-2)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Minus size={11} />
                    </button>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text)",
                        minWidth: 20,
                        textAlign: "center",
                      }}
                    >
                      {l.quantite}
                    </span>
                    <button
                      onClick={() => changeQty(l.produitId, 1)}
                      style={{
                        width: 24,
                        height: 24,
                        background: "var(--surface-3)",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        color: "var(--text-2)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Plus size={11} />
                    </button>
                    <button
                      onClick={() => removeLine(l.produitId)}
                      style={{
                        width: 24,
                        height: 24,
                        background: "transparent",
                        border: "none",
                        color: "var(--text-3)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 2,
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              padding: "10px 14px",
              background: "var(--accent-dim)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: 8,
            }}
          >
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              {t("caisse_total")}
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {fmt(total)}
            </span>
          </div>

          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "10px",
              fontSize: 14,
              fontWeight: 600,
              gap: 8,
              background: success ? "var(--green)" : undefined,
              borderColor: success ? "var(--green)" : undefined,
              transition: "all 0.2s",
            }}
            disabled={panier.length === 0}
            onClick={handleValidate}
          >
            {success ? (
              <>
                <CheckCircle size={15} /> {t("notif_sale_done")}
              </>
            ) : (
              <>
                <CheckCircle size={15} /> {t("caisse_validate")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
