import { BarChart2, ShoppingBag, TrendingUp, Package } from "lucide-react";
import { useVentes } from "../../hooks/useVentes";
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
  const { ventes, ventesOfDay } = useVentes();

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);

  /* KPIs */
  const caTotal    = ventes.reduce((s, v) => s + v.total, 0);
  const caMonth    = ventes.filter(v => v.date.slice(0, 7) === currentMonth).reduce((s, v) => s + v.total, 0);
  const ventesJour = ventesOfDay(today).length;
  const nbProduits = Object.keys(
    ventes.flatMap(v => v.lignes).reduce((a, l) => ({ ...a, [l.produitId]: true }), {})
  ).length;

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
          <KpiCard label={t("dash_ca_total")}      value={fmtMoney(caTotal)}  icon={TrendingUp}  accent />
          <KpiCard label={t("dash_ca_month")}      value={fmtMoney(caMonth)}  icon={BarChart2}   sub={currentMonth} />
          <KpiCard label={t("dash_sales_today")}   value={String(ventesJour)} icon={ShoppingBag} sub={t("ventes_filter_today")} />
          <KpiCard label={t("dash_products_sold")} value={String(nbProduits)} icon={Package}     sub={t("dash_distinct_products")} />
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

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
        </div>

      </div>
    </div>
  );
};
