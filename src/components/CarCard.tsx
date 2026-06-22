import { ArrowRight, Wrench, Trash2 } from "lucide-react";
import { Voiture, STATUS_LABELS, STATUS_COLORS } from "../types";

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
  const sc = STATUS_COLORS[voiture.statut];
  const isLast = voiture.statut === "livree";

  return (
    <div
      className={`car-card${selected ? " selected" : ""}`}
      onClick={onSelect}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div>
          <span className="plate">{voiture.immatriculation}</span>
          <div
            style={{
              marginTop: 5,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text)",
            }}
          >
            {voiture.marque} {voiture.modele}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 1 }}>
            {voiture.nomClient}
          </div>
        </div>
        <span className="status-pill" style={sc}>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: sc.dot,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          {STATUS_LABELS[voiture.statut]}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          className="btn btn-advance"
          style={{ fontSize: 11, padding: "4px 8px" }}
          disabled={isLast}
          onClick={(e) => {
            e.stopPropagation();
            onAdvance();
          }}
        >
          <ArrowRight size={12} /> Avancer
        </button>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 11, padding: "4px 8px" }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <Wrench size={12} />
          {interventionCount > 0
            ? `${interventionCount} intervention${interventionCount > 1 ? "s" : ""}`
            : "Interventions"}
        </button>
        <button
          className="btn btn-danger"
          style={{ marginLeft: "auto", padding: "4px 8px" }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
