import { useState } from "react";
import { Plus, X, Car } from "lucide-react";
import { Voiture, Intervention } from "../types";
import { CarCard } from "./CarCard";
import { CarForm } from "./CarForm";

type Props = {
  voitures: Voiture[];
  interventions: Intervention[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (data: Omit<Voiture, "id" | "statut" | "createdAt">) => void;
  onAdvance: (id: string) => void;
  onDeleteRequest: (id: string) => void;
};

export const Sidebar = ({
  voitures,
  interventions,
  selectedId,
  onSelect,
  onAdd,
  onAdvance,
  onDeleteRequest,
}: Props) => {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (data: Omit<Voiture, "id" | "statut" | "createdAt">) => {
    onAdd(data);
    setShowForm(false);
  };

  return (
    <div
      style={{
        width: 380,
        minWidth: 320,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 16px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--accent)",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0c0c12",
              flexShrink: 0,
            }}
          >
            <Car size={16} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "0.03em",
                color: "var(--text)",
                lineHeight: 1.2,
              }}
            >
              GARAGE MANAGER
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-3)",
                letterSpacing: "0.04em",
              }}
            >
              {voitures.length} véhicule{voitures.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm((f) => !f)}
        >
          {showForm ? (
            <>
              <X size={13} /> Annuler
            </>
          ) : (
            <>
              <Plus size={13} /> Ajouter
            </>
          )}
        </button>
      </div>

      {/* Add form */}
      {showForm && <CarForm onSubmit={handleAdd} />}

      {/* Car list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {voitures.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🚗</div>
            <div
              style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}
            >
              Aucun véhicule
            </div>
            <div style={{ fontSize: 12 }}>
              Cliquez sur « Ajouter » pour commencer.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {voitures.map((v) => (
              <CarCard
                key={v.id}
                voiture={v}
                interventionCount={
                  interventions.filter((i) => i.voitureId === v.id).length
                }
                selected={selectedId === v.id}
                onSelect={() => onSelect(v.id)}
                onAdvance={() => onAdvance(v.id)}
                onDelete={() => onDeleteRequest(v.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
