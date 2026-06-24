import { useState } from "react";
import {
  BarChart2,
  Download,
  Printer,
  ChevronRight,
  X,
  ShoppingBag,
} from "lucide-react";
import { Vente } from "../../types";
import { useVentes } from "../../hooks/useVentes";
import { useSettings } from "../../context/SettingsContext";
import { useToast } from "../Toast";

const todayStr = () => new Date().toISOString().slice(0, 10);

const fmtDate = (iso: string, lang: string) =>
  new Date(iso).toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtTime = (iso: string, lang: string) =>
  new Date(iso).toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtMoney = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const exportCSV = (ventes: Vente[], lang: string) => {
  const isEn = lang === "en";
  const header = isEn
    ? "Date,Receipt #,Product,Price,Qty,Line total,Total"
    : "Date,N° ticket,Produit,Prix,Qté,Sous-total,Total";

  const rows = ventes.flatMap((v) =>
    v.lignes.map(
      (l, i) =>
        `"${fmtDate(v.date, lang)}","${v.id.slice(0, 8)}","${l.nom}",${l.prix.toFixed(2)},${l.quantite},${(l.prix * l.quantite).toFixed(2)},${i === 0 ? v.total.toFixed(2) : ""}`,
    ),
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ventes_${todayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const printPDF = (ventes: Vente[], lang: string) => {
  const isEn = lang === "en";
  const title = isEn ? "Sales History" : "Historique des ventes";

  const rows = ventes
    .map(
      (v) => `
    <tr class="sale-header">
      <td>${fmtDate(v.date, lang)}</td>
      <td>${v.id.slice(0, 8)}</td>
      <td>${v.lignes.reduce((s, l) => s + l.quantite, 0)} ${isEn ? "item(s)" : "article(s)"}</td>
      <td class="total">${fmtMoney(v.total)}</td>
    </tr>
    ${v.lignes
      .map(
        (l) => `
    <tr class="sale-line">
      <td colspan="2" style="padding-left:24px; color:#666">${l.nom}</td>
      <td>${fmtMoney(l.prix)} × ${l.quantite}</td>
      <td>${fmtMoney(l.prix * l.quantite)}</td>
    </tr>`,
      )
      .join("")}`,
    )
    .join("");

  const grandTotal = ventes.reduce((s, v) => s + v.total, 0);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 20px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .meta { color: #666; margin-bottom: 16px; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f0f0f0; text-align: left; padding: 6px 8px; border-bottom: 2px solid #ccc; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
  td { padding: 5px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  .sale-header td { font-weight: 600; background: #fafafa; }
  .sale-line td { font-size: 11px; }
  .total { font-family: monospace; font-weight: 700; }
  .grand-total { margin-top: 12px; text-align: right; font-size: 14px; font-weight: 700; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<h1>${title}</h1>
<div class="meta">${isEn ? "Exported on" : "Exporté le"} ${new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB")} — ${ventes.length} ${isEn ? "sale(s)" : "vente(s)"}</div>
<table>
  <thead>
    <tr>
      <th>${isEn ? "Date" : "Date"}</th>
      <th>${isEn ? "Receipt #" : "N° ticket"}</th>
      <th>${isEn ? "Items" : "Articles"}</th>
      <th>${isEn ? "Total" : "Total"}</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<div class="grand-total">${isEn ? "Grand total" : "Total général"} : ${fmtMoney(grandTotal)}</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
};

export const VentesView = () => {
  const { t, lang } = useSettings();
  const { toast } = useToast();
  const { ventes, ventesOfDay, totalOfDay } = useVentes();

  const [filter, setFilter] = useState<"all" | "today">("today");
  const [selected, setSelected] = useState<Vente | null>(null);

  const today = todayStr();
  const displayed = filter === "today" ? ventesOfDay(today) : ventes;
  const todayTotal = totalOfDay(today);

  const handleCSV = () => {
    exportCSV(displayed, lang);
    toast(t("notif_export_csv"));
  };

  const handlePDF = () => {
    printPDF(displayed, lang);
    toast(t("notif_export_pdf"));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
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
            minWidth: 180,
          }}
        >
          {t("ventes_title")}
        </div>

        {/* Today total badge */}
        {todayTotal > 0 && (
          <div
            style={{
              padding: "5px 12px",
              background: "var(--accent-dim)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent)",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {t("ventes_today")} : {fmtMoney(todayTotal)}
          </div>
        )}

        {/* Export buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="btn btn-ghost"
            onClick={handleCSV}
            disabled={displayed.length === 0}
          >
            <Download size={13} /> {t("ventes_export_csv")}
          </button>
          <button
            className="btn btn-ghost"
            onClick={handlePDF}
            disabled={displayed.length === 0}
          >
            <Printer size={13} /> {t("ventes_export_pdf")}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 24px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {(["today", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "4px 12px",
              background: filter === f ? "var(--surface-3)" : "transparent",
              border: "1px solid",
              borderColor: filter === f ? "var(--border-2)" : "transparent",
              borderRadius: 5,
              color: filter === f ? "var(--text)" : "var(--text-3)",
              fontSize: 12,
              fontWeight: filter === f ? 500 : 400,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.12s",
            }}
          >
            {f === "today" ? t("ventes_filter_today") : t("ventes_filter_all")}
            {f === "today" && ventesOfDay(today).length > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: "var(--accent)",
                  color: "#0c0c12",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 5px",
                }}
              >
                {ventesOfDay(today).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sales list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {displayed.length === 0 ? (
          <div className="empty" style={{ marginTop: 60 }}>
            <BarChart2 size={36} style={{ opacity: 0.2, marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-2)" }}>
              {t("ventes_empty")}
            </div>
            <div style={{ fontSize: 13 }}>{t("ventes_empty_sub")}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {displayed.map((v, idx) => {
              const lineCount = v.lignes.reduce((s, l) => s + l.quantite, 0);
              return (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 16px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.12s",
                    width: "100%",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-3)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  }}
                >
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
                      color: "var(--text-3)",
                    }}
                  >
                    <ShoppingBag size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text)",
                        marginBottom: 2,
                      }}
                    >
                      {t("ventes_ticket")} #{String(displayed.length - idx).padStart(3, "0")}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                      {fmtTime(v.date, lang)} — {lineCount} {t("ventes_articles")}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    {fmtMoney(v.total)}
                  </div>
                  <ChevronRight size={15} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket detail modal */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 500,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              borderRadius: 12,
              width: 420,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "16px 20px 14px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "var(--text)",
                  }}
                >
                  {t("ventes_detail_title")}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                  {fmtDate(selected.date, lang)}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-3)",
                  display: "flex",
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Lines */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selected.lignes.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>
                      {l.nom}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-3)",
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {fmtMoney(l.prix)} × {l.quantite}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text)",
                        fontFamily: "'IBM Plex Mono', monospace",
                        minWidth: 60,
                        textAlign: "right",
                      }}
                    >
                      {fmtMoney(l.prix * l.quantite)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--accent-dim)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
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
                {fmtMoney(selected.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
