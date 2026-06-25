import { ArrowRight, Wrench, Trash2 } from "lucide-react";
import { Voiture, STATUS_LABELS, STATUS_CLASSES } from "../types";
import { cn } from "../lib/cn";

type Props = {
  voiture: Voiture;
  interventionCount: number;
  selected: boolean;
  onSelect: () => void;
  onAdvance: () => void;
  onDelete: () => void;
};

export const CarCard = ({
  voiture,
  interventionCount,
  selected,
  onSelect,
  onAdvance,
  onDelete,
}: Props) => {
  const sc = STATUS_CLASSES[voiture.statut];
  const isLast = voiture.statut === "livree";

  return (
    <div
      className={cn("car-card", selected && "selected")}
      onClick={onSelect}
    >
      {/* Top row: plate + status */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="plate">{voiture.immatriculation}</span>
          <p className="mt-1.5 text-[13px] font-semibold leading-tight text-fg">
            {voiture.marque} {voiture.modele}
          </p>
          <p className="mt-0.5 text-[11.5px] text-fg-2">{voiture.nomClient}</p>
        </div>
        <span className={cn("status-pill", sc.pill)}>
          <span className={cn("size-1.5 shrink-0 rounded-full", sc.dot)} />
          {STATUS_LABELS[voiture.statut]}
        </span>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-1">
        <button
          className="btn btn-advance btn-sm"
          disabled={isLast}
          onClick={(e) => { e.stopPropagation(); onAdvance(); }}
        >
          <ArrowRight size={11} /> Avancer
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
          <Wrench size={11} />
          {interventionCount > 0
            ? `${interventionCount} intervention${interventionCount > 1 ? "s" : ""}`
            : "Interventions"}
        </button>

        <button
          className="btn-icon ml-auto p-1.5 rounded-md text-fg-3 hover:text-danger hover:bg-danger-dim"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
