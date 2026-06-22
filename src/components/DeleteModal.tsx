import { Trash2 } from "lucide-react";
import { Voiture } from "../types";

interface Props {
  voiture: Voiture;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal = ({ voiture, onConfirm, onCancel }: Props) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(12,12,18,0.85)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-2)",
          borderRadius: 12,
          padding: "24px 28px",
          maxWidth: 360,
          width: "90%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: "0.03em",
            color: "var(--text)",
            marginBottom: 10,
          }}
        >
          Supprimer ce véhicule ?
        </div>
        <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 6 }}>
          <span className="plate" style={{ fontSize: 12 }}>
            {voiture.immatriculation}
          </span>{" "}
          — {voiture.marque} {voiture.modele}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20 }}>
          Cette action supprimera aussi toutes les interventions associées. Elle
          est irréversible.
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onCancel}>
            Annuler
          </button>
          <button
            className="btn"
            style={{
              background: "var(--red)",
              color: "#fff",
              borderColor: "var(--red)",
            }}
            onClick={onConfirm}
          >
            <Trash2 size={13} /> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};
