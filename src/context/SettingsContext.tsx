import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Lang, Theme } from "../types";
import { TKey, t as translate } from "../i18n";

type SettingsCtx = {
  lang: Lang;
  theme: Theme;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  t: (key: TKey) => string;
};

const SettingsContext = createContext<SettingsCtx>({} as SettingsCtx);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem("garage_lang") as Lang) || "fr",
  );
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("garage_theme") as Theme) || "dark",
  );

  const setLang = (l: Lang) => {
    localStorage.setItem("garage_lang", l);
    setLangState(l);
  };

  const setTheme = (th: Theme) => {
    localStorage.setItem("garage_theme", th);
    setThemeState(th);
  };

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const t = (key: TKey) => translate(lang, key);

  return (
    <SettingsContext.Provider value={{ lang, theme, setLang, setTheme, t }}>
      {children}
    </SettingsContext.Provider>
  );
};
