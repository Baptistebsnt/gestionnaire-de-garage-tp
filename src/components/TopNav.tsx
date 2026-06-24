import { Car, Package, ShoppingCart, BarChart2, Settings } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export type NavTab = "voitures" | "catalogue" | "caisse" | "ventes";

type Props = {
  active: NavTab;
  onChange: (tab: NavTab) => void;
  onSettings: () => void;
};

export const TopNav = ({ active, onChange, onSettings }: Props) => {
  const { t } = useSettings();

  const tabs: { id: NavTab; icon: typeof Car; key: Parameters<typeof t>[0] }[] = [
    { id: "voitures", icon: Car, key: "nav_voitures" },
    { id: "catalogue", icon: Package, key: "nav_catalogue" },
    { id: "caisse", icon: ShoppingCart, key: "nav_caisse" },
    { id: "ventes", icon: BarChart2, key: "nav_ventes" },
  ];

  return (
    <div
      style={{
        height: 48,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 4,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginRight: 16,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            background: "var(--accent)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0c0c12",
            flexShrink: 0,
          }}
        >
          <Car size={14} />
        </div>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: "var(--text)",
          }}
        >
          GARAGE
        </span>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 2,
          flex: 1,
        }}
      >
        {tabs.map(({ id, icon: Icon, key }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                background: isActive ? "var(--surface-3)" : "transparent",
                border: "1px solid",
                borderColor: isActive ? "var(--border-2)" : "transparent",
                borderRadius: 6,
                color: isActive ? "var(--text)" : "var(--text-3)",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: isActive ? 500 : 400,
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              <Icon size={14} />
              {t(key)}
            </button>
          );
        })}
      </div>

      {/* Settings */}
      <button
        onClick={onSettings}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          background: "transparent",
          border: "1px solid transparent",
          borderRadius: 6,
          color: "var(--text-3)",
          cursor: "pointer",
          transition: "all 0.12s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--surface-3)";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "var(--border)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
        }}
      >
        <Settings size={15} />
      </button>
    </div>
  );
};
