import { useState } from "react";
import { TopNav, NavTab } from "./components/TopNav";
import { SettingsPanel } from "./components/SettingsPanel";
import { CatalogueView } from "./components/catalogue/CatalogueView";
import { CaisseView } from "./components/caisse/CaisseView";
import { VentesView } from "./components/ventes/VentesView";
import { DashboardView } from "./components/dashboard/DashboardView";

const App = () => {
  const [tab, setTab] = useState<NavTab>("caisse");
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg">
      <TopNav
        active={tab}
        onChange={setTab}
        onSettings={() => setShowSettings(true)}
      />

      <div className="flex-1 overflow-hidden">
        {tab === "catalogue" && <CatalogueView />}
        {tab === "caisse"    && <CaisseView onNavigate={setTab} />}
        {tab === "ventes"    && <VentesView />}
        {tab === "dashboard" && <DashboardView />}
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default App;
