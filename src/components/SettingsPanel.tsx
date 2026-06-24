import { X, Moon, Sun, Globe } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

type Props = { onClose: () => void };

export const SettingsPanel = ({ onClose }: Props) => {
  const { t, theme, setTheme, lang, setLang } = useSettings();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-2)",
          borderRadius: 12,
          width: 380,
          padding: "0",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px 14px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "var(--text)",
            }}
          >
            {t("settings_title")}
          </div>
          <button
            onClick={onClose}
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

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {/* Theme */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-2)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <Moon size={13} />
              {t("settings_theme")}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["dark", "light"] as const).map((th) => (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 16px",
                    background:
                      theme === th ? "var(--accent-dim)" : "var(--surface-2)",
                    border: "1px solid",
                    borderColor:
                      theme === th
                        ? "var(--accent)"
                        : "var(--border)",
                    borderRadius: 8,
                    color: theme === th ? "var(--accent)" : "var(--text-2)",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: theme === th ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {th === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                  {t(th === "dark" ? "settings_theme_dark" : "settings_theme_light")}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-2)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <Globe size={13} />
              {t("settings_lang")}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 16px",
                    background:
                      lang === l ? "var(--accent-dim)" : "var(--surface-2)",
                    border: "1px solid",
                    borderColor:
                      lang === l ? "var(--accent)" : "var(--border)",
                    borderRadius: 8,
                    color: lang === l ? "var(--accent)" : "var(--text-2)",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: lang === l ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {t(l === "fr" ? "settings_lang_fr" : "settings_lang_en")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
