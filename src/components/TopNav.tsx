import { Car, Package, ShoppingCart, BarChart2, Settings } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { cn } from "../lib/cn";

export type NavTab = "voitures" | "catalogue" | "caisse" | "ventes";

type Props = {
  active: NavTab;
  onChange: (tab: NavTab) => void;
  onSettings: () => void;
};

export const TopNav = ({ active, onChange, onSettings }: Props) => {
  const { t } = useSettings();

  const tabs: { id: NavTab; icon: typeof Car; key: Parameters<typeof t>[0] }[] = [
    { id: "voitures",  icon: Car,          key: "nav_voitures" },
    { id: "catalogue", icon: Package,      key: "nav_catalogue" },
    { id: "caisse",    icon: ShoppingCart, key: "nav_caisse" },
    { id: "ventes",    icon: BarChart2,    key: "nav_ventes" },
  ];

  return (
    <header className="flex h-12 shrink-0 items-center gap-1 border-b border-border bg-surface px-4">
      {/* Brand */}
      <div className="mr-4 flex items-center gap-2 shrink-0">
        <div className="flex size-7 items-center justify-center rounded-[7px] bg-accent shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
          <Car size={13} strokeWidth={2.5} className="text-[#0b0b10]" />
        </div>
        <span className="font-display text-[13px] font-bold tracking-[0.08em] text-fg">
          GARAGE
        </span>
      </div>

      {/* Tabs */}
      <nav className="flex flex-1 gap-0.5">
        {tabs.map(({ id, icon: Icon, key }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 font-sans text-[12.5px] transition-all duration-150",
              active === id
                ? "border-border-2 bg-surface-3 font-semibold text-fg"
                : "border-transparent font-normal text-fg-3 hover:bg-surface-2 hover:text-fg-2"
            )}
          >
            <Icon size={13} strokeWidth={active === id ? 2.5 : 1.75} />
            {t(key)}
          </button>
        ))}
      </nav>

      {/* Settings */}
      <button
        onClick={onSettings}
        className="btn-icon size-8 rounded-md text-fg-3 hover:bg-surface-2 hover:text-fg"
      >
        <Settings size={14} />
      </button>
    </header>
  );
};
