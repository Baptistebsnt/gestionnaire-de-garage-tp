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
import { cn } from "../../lib/cn";

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
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `ventes_${todayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const printPDF = (ventes: Vente[], lang: string) => {
  const isEn  = lang === "en";
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
  const { toast }   = useToast();
  const { ventes, ventesOfDay, totalOfDay } = useVentes();

  const [filter, setFilter]   = useState<"all" | "today">("today");
  const [selected, setSelected] = useState<Vente | null>(null);

  const today      = todayStr();
  const displayed  = filter === "today" ? ventesOfDay(today) : ventes;
  const todayTotal = totalOfDay(today);

  const handleCSV = () => { exportCSV(displayed, lang); toast(t("notif_export_csv")); };
  const handlePDF = () => { printPDF(displayed, lang);  toast(t("notif_export_pdf")); };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-bg">

      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-surface px-6 pb-3.5 pt-4">
        <span className="min-w-[180px] flex-1 font-display text-lg font-bold tracking-[0.04em] text-fg">
          {t("ventes_title")}
        </span>

        {todayTotal > 0 && (
          <span className="rounded-full border border-[rgba(245,158,11,0.3)] bg-accent-dim px-3 py-[5px] font-mono text-[13px] font-semibold text-accent">
            {t("ventes_today")} : {fmtMoney(todayTotal)}
          </span>
        )}

        <div className="flex gap-1.5">
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
      <div className="flex shrink-0 gap-1.5 border-b border-border bg-surface px-6 py-2.5">
        {(["today", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "cursor-pointer rounded-[5px] border px-3 py-1 font-sans text-xs transition-all duration-150",
              filter === f
                ? "border-border-2 bg-surface-3 font-medium text-fg"
                : "border-transparent font-normal text-fg-3 hover:text-fg-2"
            )}
          >
            {f === "today" ? t("ventes_filter_today") : t("ventes_filter_all")}
            {f === "today" && ventesOfDay(today).length > 0 && (
              <span className="ml-1.5 rounded-full bg-accent px-[5px] py-px text-[10px] font-bold text-[#0c0c12]">
                {ventesOfDay(today).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sales list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {displayed.length === 0 ? (
          <div className="empty mt-16">
            <BarChart2 size={36} className="mb-2 opacity-20" />
            <p className="text-sm font-medium text-fg-2">{t("ventes_empty")}</p>
            <p className="text-[13px]">{t("ventes_empty_sub")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {displayed.map((v, idx) => {
              const lineCount = v.lignes.reduce((s, l) => s + l.quantite, 0);
              return (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className="flex w-full cursor-pointer items-center gap-3.5 rounded-lg border border-border bg-surface-2 px-4 py-3 text-left font-sans transition-all duration-150 hover:border-border-2 hover:bg-surface-3"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-fg-3">
                    <ShoppingBag size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[13px] font-medium text-fg">
                      {t("ventes_ticket")} #{String(displayed.length - idx).padStart(3, "0")}
                    </p>
                    <p className="text-xs text-fg-3">
                      {fmtTime(v.date, lang)} — {lineCount} {t("ventes_articles")}
                    </p>
                  </div>
                  <span className="font-mono text-base font-bold text-fg">
                    {fmtMoney(v.total)}
                  </span>
                  <ChevronRight size={15} className="shrink-0 text-fg-3" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sale detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.55)]"
          onClick={() => setSelected(null)}
        >
          <div
            className="flex w-[420px] max-h-[80vh] flex-col overflow-hidden rounded-xl border border-border-2 bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 pb-3.5 pt-4">
              <div>
                <p className="font-display text-base font-bold tracking-[0.04em] text-fg">
                  {t("ventes_detail_title")}
                </p>
                <p className="mt-0.5 text-xs text-fg-3">{fmtDate(selected.date, lang)}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="btn-icon p-1 text-fg-3 hover:text-fg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Line items */}
            <div className="flex-1 overflow-y-auto px-5 py-3.5">
              <div className="flex flex-col gap-1.5">
                {selected.lignes.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-md border border-border bg-surface-2 px-3 py-2"
                  >
                    <p className="flex-1 text-[13px] text-fg">{l.nom}</p>
                    <span className="font-mono text-xs text-fg-3">
                      {fmtMoney(l.prix)} × {l.quantite}
                    </span>
                    <span className="min-w-[60px] text-right font-mono text-[13px] font-semibold text-fg">
                      {fmtMoney(l.prix * l.quantite)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-border bg-accent-dim px-5 py-3.5">
              <span className="font-display text-sm font-bold uppercase tracking-[0.06em] text-accent">
                {t("caisse_total")}
              </span>
              <span className="font-mono text-[22px] font-bold text-accent">
                {fmtMoney(selected.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
