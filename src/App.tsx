import { useState } from "react";
import { Wrench } from "lucide-react";
import { useGarage } from "./hooks/useGarage";
import { Sidebar } from "./components/Sidebar";
import { InterventionPanel } from "./components/InterventionPanel";
import { DeleteModal } from "./components/DeleteModal";
import { TopNav, NavTab } from "./components/TopNav";
import { SettingsPanel } from "./components/SettingsPanel";
import { CatalogueView } from "./components/catalogue/CatalogueView";
import { CaisseView } from "./components/caisse/CaisseView";
import { VentesView } from "./components/ventes/VentesView";
import { DashboardView } from "./components/dashboard/DashboardView";

const VoituresLayout = () => {
  const garage = useGarage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const selectedVoiture =
    garage.voitures.find((v) => v.id === selectedId) ?? null;
  const deleteVoiture =
    garage.voitures.find((v) => v.id === deleteTarget) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleAdd = (data: Parameters<typeof garage.addVoiture>[0]) => {
    const v = garage.addVoiture(data);
    setSelectedId(v.id);
  };

  const handleDelete = (id: string) => {
    garage.deleteVoiture(id);
    if (selectedId === id) setSelectedId(null);
    setDeleteTarget(null);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar
        voitures={garage.voitures}
        interventions={garage.interventions}
        selectedId={selectedId}
        onSelect={handleSelect}
        onAdd={handleAdd}
        onAdvance={garage.advanceStatut}
        onDeleteRequest={setDeleteTarget}
      />

      <div className="flex flex-1 flex-col overflow-hidden bg-bg">
        {selectedVoiture ? (
          <InterventionPanel
            voiture={selectedVoiture}
            interventions={garage.interventionsFor(selectedVoiture.id)}
            onAdd={(data) =>
              garage.addIntervention({ ...data, voitureId: selectedVoiture.id })
            }
            onDelete={garage.deleteIntervention}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-fg-3">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-border bg-surface-2 opacity-60">
              <Wrench size={28} />
            </div>
            <p className="mb-1.5 text-[14px] font-medium text-fg-2">
              Sélectionnez un véhicule
            </p>
            <p className="text-[13px]">
              Cliquez sur une voiture pour gérer ses interventions.
            </p>
          </div>
        )}
      </div>

      {deleteTarget && deleteVoiture && (
        <DeleteModal
          voiture={deleteVoiture}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

const App = () => {
  const [tab, setTab] = useState<NavTab>("voitures");
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg">
      <TopNav
        active={tab}
        onChange={setTab}
        onSettings={() => setShowSettings(true)}
      />

      <div className="flex-1 overflow-hidden">
        {tab === "voitures"  && <VoituresLayout />}
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
