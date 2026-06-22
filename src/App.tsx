import { useState } from "react";
import { Wrench } from "lucide-react";
import { useGarage } from "./hooks/useGarage";
import { Sidebar } from "./components/Sidebar";
import { InterventionPanel } from "./components/InterventionPanel";
import { DeleteModal } from "./components/DeleteModal";

const App = () => {
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
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      <Sidebar
        voitures={garage.voitures}
        interventions={garage.interventions}
        selectedId={selectedId}
        onSelect={handleSelect}
        onAdd={handleAdd}
        onAdvance={garage.advanceStatut}
        onDeleteRequest={setDeleteTarget}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
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
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-3)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                opacity: 0.6,
              }}
            >
              <Wrench size={28} />
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-2)",
                marginBottom: 6,
              }}
            >
              Sélectionnez un véhicule
            </div>
            <div style={{ fontSize: 13 }}>
              Cliquez sur une voiture pour gérer ses interventions.
            </div>
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

export default App;
