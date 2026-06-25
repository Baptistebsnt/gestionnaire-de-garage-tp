import { useRef, useState } from "react";
import { X, Moon, Sun, Globe, Download, Upload, AlertTriangle } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "./Toast";
import { cn } from "../lib/cn";

type Props = { onClose: () => void };

const BACKUP_KEYS = [
  "garage_voitures",
  "garage_interventions",
  "garage_produits",
  "garage_ventes",
] as const;

const exportData = () => {
  const data: Record<string, unknown> = {};
  for (const key of BACKUP_KEYS) {
    try { data[key] = JSON.parse(localStorage.getItem(key) ?? "[]"); }
    catch { data[key] = []; }
  }
  const blob = new Blob(
    [JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `garage-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const SettingsPanel = ({ onClose }: Props) => {
  const { t, theme, setTheme, lang, setLang } = useSettings();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState("");
  const [pendingData, setPendingData] = useState<Record<string, unknown> | null>(null);

  const handleExport = () => {
    exportData();
    toast(t("notif_backup_exported"));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (!json.data || typeof json.data !== "object") throw new Error();
        setPendingData(json.data as Record<string, unknown>);
      } catch {
        setImportError(t("backup_invalid"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = () => {
    if (!pendingData) return;
    for (const key of BACKUP_KEYS) {
      if (pendingData[key] !== undefined) {
        localStorage.setItem(key, JSON.stringify(pendingData[key]));
      }
    }
    toast(t("notif_backup_imported"));
    setPendingData(null);
    setTimeout(() => window.location.reload(), 900);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[400px] overflow-hidden rounded-2xl border border-border-2 bg-surface shadow-[0_24px_64px_rgba(0,0,0,0.7)]"
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
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-fg-3">
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
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-fg-3">
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

          {/* Backup */}
          <div>
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-fg-3">
              <Download size={12} /> {t("backup_section")}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="btn btn-ghost flex-1 justify-center"
              >
                <Download size={13} /> {t("backup_export")}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="btn btn-ghost flex-1 justify-center"
              >
                <Upload size={13} /> {t("backup_import")}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {importError && (
              <p className="mt-2 text-[11px] text-danger">{importError}</p>
            )}
          </div>
        </div>

        {/* Import confirm modal */}
        {pendingData && (
          <div className="border-t border-border bg-danger-dim px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-danger" />
              <p className="text-[13px] font-semibold text-fg">{t("backup_confirm_title")}</p>
            </div>
            <p className="mb-4 text-[12px] text-fg-2">{t("backup_confirm_body")}</p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setPendingData(null)}>
                {t("btn_cancel")}
              </button>
              <button className="btn btn-danger btn-sm" onClick={confirmImport}>
                {t("btn_confirm")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
