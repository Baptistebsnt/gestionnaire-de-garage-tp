import { X, Moon, Sun, Globe } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { cn } from "../lib/cn";

type Props = { onClose: () => void };

export const SettingsPanel = ({ onClose }: Props) => {
  const { t, theme, setTheme, lang, setLang } = useSettings();

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[380px] overflow-hidden rounded-2xl border border-border-2 bg-surface shadow-[0_24px_64px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-display text-[16px] font-bold tracking-[0.04em] text-fg">
            {t("settings_title")}
          </span>
          <button
            onClick={onClose}
            className="btn-icon p-1.5 rounded-md text-fg-3 hover:bg-surface-2 hover:text-fg"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6">
          {/* Theme */}
          <div>
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.10em] text-fg-3">
              <Moon size={12} /> {t("settings_theme")}
            </div>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((th) => (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border py-3 font-sans text-[13px] font-medium transition-all duration-150",
                    theme === th
                      ? "border-accent-border bg-accent-dim text-accent"
                      : "border-border-2 bg-surface-2 text-fg-2 hover:border-border-3 hover:bg-surface-3 hover:text-fg"
                  )}
                >
                  {th === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                  {t(th === "dark" ? "settings_theme_dark" : "settings_theme_light")}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.10em] text-fg-3">
              <Globe size={12} /> {t("settings_lang")}
            </div>
            <div className="flex gap-2">
              {(["fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border py-3 font-sans text-[13px] font-medium transition-all duration-150",
                    lang === l
                      ? "border-accent-border bg-accent-dim text-accent"
                      : "border-border-2 bg-surface-2 text-fg-2 hover:border-border-3 hover:bg-surface-3 hover:text-fg"
                  )}
                >
                  <span className="text-[16px]">{l === "fr" ? "🇫🇷" : "🇬🇧"}</span>
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
