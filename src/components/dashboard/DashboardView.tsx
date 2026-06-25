import { BarChart2, Car, ShoppingBag, TrendingUp, Package } from "lucide-react";
import { useGarage } from "../../hooks/useGarage";
import { useVentes } from "../../hooks/useVentes";
import { STATUS_LABELS, STATUS_ORDER, STATUS_CLASSES } from "../../types";
import { useSettings } from "../../context/SettingsContext";
import { cn } from "../../lib/cn";

const fmtMoney = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const shortDay = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });

/* ── KPI card ── */
type KpiProps = {
  label: string;
  value: string;
  sub?: string;
  icon: typeof BarChart2;
  accent?: boolean;
};
const KpiCard = ({ label, value, sub, icon: Icon, accent }: KpiProps) => (
  <div className={cn(
    "flex flex-col gap-3 rounded-xl border p-4",
    accent
      ? "border-accent-border bg-accent-dim"
      : "border-border bg-surface-2"
  )}>
    <div className="flex items-center justify-between">
      <span className={cn("text-[11px] font-semibold uppercase tracking-widest", accent ? "text-accent" : "text-fg-3")}>
        {label}
      </span>
      <div className={cn("flex size-7 items-center justify-center rounded-lg", accent ? "bg-accent/20" : "bg-surface-3")}>
        <Icon size={14} className={accent ? "text-accent" : "text-fg-3"} />
      </div>
    </div>
    <div>
      <p className={cn("font-mono text-[26px] font-bold leading-none", accent ? "text-accent" : "text-fg")}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-fg-3">{sub}</p>}
    </div>
  </div>
);

/* ── Main view ── */
export const DashboardView = () => {
  const { t } = useSettings();
  const { voitures, interventions } = useGarage();
  const { ventes, ventesOfDay } = useVentes();

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);

  /* KPIs */
  const caTotal    = ventes.reduce((s, v) => s + v.total, 0);
  const caMonth    = ventes.filter(v => v.date.slice(0, 7) === currentMonth).reduce((s, v) => s + v.total, 0);
  const actifs     = voitures.filter(v => v.statut !== "livree").length;
  const ventesJour = ventesOfDay(today).length;

  /* Répartition des statuts */
  const maxStatutCount = Math.max(...STATUS_ORDER.map(s => voitures.filter(v => v.statut === s).length), 1);

  /* CA 7 derniers jours */
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const revenueByDay = last7.map(date => ({
    date,
    total: ventesOfDay(date).reduce((s, v) => s + v.total, 0),
  }));
  const maxRevenue = Math.max(...revenueByDay.map(d => d.total), 1);

  /* Top 5 produits par CA */
  const produitStats = Object.values(
    ventes
      .flatMap(v => v.lignes)
      .reduce((acc, l) => {
        if (!acc[l.produitId]) acc[l.produitId] = { nom: l.nom, quantite: 0, revenue: 0 };
        acc[l.produitId].quantite += l.quantite;
        acc[l.produitId].revenue += l.prix * l.quantite;
        return acc;
      }, {} as Record<string, { nom: string; quantite: number; revenue: number }>)
  ).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  /* Moyennes */
  const avgInterv = voitures.length
    ? (interventions.length / voitures.length).toFixed(1)
    : "—";
  const avgPrice = interventions.length
    ? fmtMoney(interventions.reduce((s, i) => s + i.prix, 0) / interventions.length)
    : "—";

  return (
    <div className="h-full overflow-y-auto bg-bg px-6 py-5">
      <div className="mx-auto max-w-[960px] space-y-6">

        {/* Page title */}
        <div>
          <h1 className="font-display text-xl font-bold tracking-[0.04em] text-fg">
            {t("nav_dashboard")}
          </h1>
          <p className="mt-0.5 text-[12px] text-fg-3">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label={t("dash_ca_total")}         value={fmtMoney(caTotal)}    icon={TrendingUp}   accent />
          <KpiCard label={t("dash_ca_month")}         value={fmtMoney(caMonth)}    icon={BarChart2}    sub={currentMonth} />
          <KpiCard label={t("dash_active_vehicles")}  value={String(actifs)}       icon={Car}          sub={`/ ${voitures.length} total`} />
          <KpiCard label={t("dash_sales_today")}      value={String(ventesJour)}   icon={ShoppingBag}  sub={t("ventes_filter_today")} />
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Statuts */}
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-fg-3">
              {t("dash_status_dist")}
            </h2>
            {voitures.length === 0 ? (
              <p className="text-[12px] text-fg-3">{t("dash_no_vehicles")}</p>
            ) : (
              <div className="space-y-3">
                {STATUS_ORDER.map(statut => {
                  const count = voitures.filter(v => v.statut === statut).length;
                  const pct   = Math.round((count / Math.max(voitures.length, 1)) * 100);
                  const barPct = Math.round((count / maxStatutCount) * 100);
                  const sc    = STATUS_CLASSES[statut];
                  return (
                    <div key={statut}>
                      <div className="mb-1 flex items-center justify-between text-[12px]">
                        <span className={cn("status-pill text-[11px]", sc.pill)}>
                          <span className={cn("size-1.5 shrink-0 rounded-full", sc.dot)} />
                          {STATUS_LABELS[statut]}
                        </span>
                        <span className="font-mono text-[12px] text-fg-2">{count} <span className="text-fg-3">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                        <div
                          className="h-full rounded-full bg-fg-3 transition-all duration-500"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CA 7 jours */}
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-fg-3">
              {t("dash_revenue_7days")}
            </h2>
            {ventes.length === 0 ? (
              <p className="text-[12px] text-fg-3">{t("dash_no_sales")}</p>
            ) : (
              <div className="flex h-28 items-end gap-1.5">
                {revenueByDay.map(({ date, total }) => {
                  const barH = Math.max((total / maxRevenue) * 100, total > 0 ? 4 : 0);
                  const isToday = date === today;
                  return (
                    <div key={date} className="group flex flex-1 flex-col items-center gap-1">
                      {total > 0 && (
                        <span className="hidden text-[9px] text-fg-3 group-hover:block">
                          {fmtMoney(total)}
                        </span>
                      )}
                      <div className="relative flex w-full flex-1 items-end">
                        <div
                          className={cn(
                            "w-full rounded-t-sm border-x border-t transition-all duration-500",
                            isToday
                              ? "border-accent-border bg-accent-dim"
                              : "border-border-2 bg-surface-3"
                          )}
                          style={{ height: `${barH}%`, minHeight: total > 0 ? "4px" : "0" }}
                        />
                      </div>
                      <span className={cn("text-[9px]", isToday ? "font-semibold text-accent" : "text-fg-3")}>
                        {shortDay(date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Top produits */}
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-fg-3">
              {t("dash_top_products")}
            </h2>
            {produitStats.length === 0 ? (
              <p className="text-[12px] text-fg-3">{t("dash_no_sales")}</p>
            ) : (
              <div className="space-y-2">
                {produitStats.map((p, idx) => (
                  <div key={p.nom} className="flex items-center gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-fg-3">
                      {idx + 1}
                    </span>
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-3">
                      <Package size={13} className="text-fg-3" />
                    </div>
                    <p className="min-w-0 flex-1 truncate text-[13px] text-fg">{p.nom}</p>
                    <div className="text-right">
                      <p className="font-mono text-[13px] font-semibold text-accent">{fmtMoney(p.revenue)}</p>
                      <p className="text-[10px] text-fg-3">× {p.quantite}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Moyennes */}
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-fg-3">
              Moyennes
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-3 px-4 py-3">
                <span className="text-[12px] text-fg-2">{t("dash_avg_interventions")}</span>
                <span className="font-mono text-[18px] font-bold text-fg">{avgInterv}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-3 px-4 py-3">
                <span className="text-[12px] text-fg-2">{t("dash_avg_price")}</span>
                <span className="font-mono text-[18px] font-bold text-fg">{avgPrice}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-3 px-4 py-3">
                <span className="text-[12px] text-fg-2">Véhicules traités</span>
                <span className="font-mono text-[18px] font-bold text-fg">
                  {voitures.filter(v => v.statut === "livree").length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-3 px-4 py-3">
                <span className="text-[12px] text-fg-2">Produits en catalogue</span>
                <span className="font-mono text-[18px] font-bold text-fg">
                  {Object.keys(
                    ventes.flatMap(v => v.lignes).reduce((a, l) => ({ ...a, [l.produitId]: true }), {})
                  ).length || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
