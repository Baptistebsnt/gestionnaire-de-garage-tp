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
    <aside className="flex w-[340px] shrink-0 flex-col overflow-hidden border-r border-border bg-surface">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent-border">
            <Car size={15} className="text-accent" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-[15px] font-bold leading-tight tracking-[0.04em] text-fg">
              GARAGE MANAGER
            </p>
            <p className="text-[11px] text-fg-3">
              {voitures.length} véhicule{voitures.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm((f) => !f)}
        >
          {showForm ? <><X size={12} /> Annuler</> : <><Plus size={12} /> Ajouter</>}
        </button>
      </div>

      {/* Add form */}
      {showForm && <CarForm onSubmit={handleAdd} />}

      {/* Vehicle list */}
      <div className="flex-1 overflow-y-auto p-3">
        {voitures.length === 0 ? (
          <div className="empty">
            <div className="mb-1 text-4xl opacity-30">🚗</div>
            <p className="text-[13px] font-medium text-fg-2">Aucun véhicule</p>
            <p className="text-xs text-fg-3">Cliquez sur « Ajouter » pour commencer.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {voitures.map((v) => (
              <CarCard
                key={v.id}
                voiture={v}
                interventionCount={interventions.filter((i) => i.voitureId === v.id).length}
                selected={selectedId === v.id}
                onSelect={() => onSelect(v.id)}
                onAdvance={() => onAdvance(v.id)}
                onDelete={() => onDeleteRequest(v.id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
