import { useState } from "react";
import { Plus, Trash2, Euro, X } from "lucide-react";
import { Voiture, Intervention } from "../types";

interface Props {
  voiture: Voiture;
  interventions: Intervention[];
  onAdd: (data: Omit<Intervention, "id" | "voitureId">) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const InterventionPanel = ({
  voiture,
  interventions,
  onAdd,
  onDelete,
  onClose,
}: Props) => {
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [error, setError] = useState("");
  const total = interventions.reduce((s, i) => s + i.prix, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("La description est obligatoire.");
      return;
    }
    const p = parseFloat(prix);
    if (isNaN(p) || p < 0) {
      setError("Prix invalide.");
      return;
    }
    onAdd({ description: description.trim(), prix: p });
    setDescription("");
    setPrix("");
    setError("");
  };

  return (
    <>
      {/* Header */}
      <div
        style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
                flexWrap: "wrap",
              }}
            >
              <span className="plate" style={{ fontSize: 15 }}>
                {voiture.immatriculation}
              </span>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--text)",
                }}
              >
                {voiture.marque} {voiture.modele}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)" }}>
              Client :{" "}
              <span style={{ color: "var(--text)", fontWeight: 500 }}>
                {voiture.nomClient}
              </span>
              <span style={{ margin: "0 8px", color: "var(--border-2)" }}>
                ·
              </span>
              Entrée le{" "}
              {new Date(voiture.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <button
            className="btn btn-ghost"
            style={{ padding: "5px 8px", flexShrink: 0 }}
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* Total */}
        {interventions.length > 0 && (
          <div className="total-block">
            <div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 2,
                }}
              >
                Total à payer
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                {interventions.length} intervention
                {interventions.length > 1 ? "s" : ""}
              </div>
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 28,
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {total.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
          </div>
        )}

        {/* Add form */}
        <div>
          <div className="section-label">Ajouter une intervention</div>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <textarea
              className="field"
              placeholder="Description de l'intervention..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ resize: "vertical", minHeight: 70 }}
            />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1, maxWidth: 160 }}>
                <div
                  style={{
                    position: "absolute",
                    left: 9,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-3)",
                    pointerEvents: "none",
                    display: "flex",
                  }}
                >
                  <Euro size={13} />
                </div>
                <input
                  className="field"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Prix (€)"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  style={{ paddingLeft: 28 }}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <Plus size={13} /> Ajouter
              </button>
            </div>
            {error && (
              <div style={{ fontSize: 12, color: "var(--red)" }}>{error}</div>
            )}
          </form>
        </div>

        {/* List */}
        <div>
          <div className="section-label">
            Interventions{" "}
            {interventions.length > 0 && `(${interventions.length})`}
          </div>
          {interventions.length === 0 ? (
            <div className="empty" style={{ padding: "28px 20px" }}>
              <div className="empty-icon" style={{ fontSize: 24 }}>
                🔧
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                Aucune intervention enregistrée.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {interventions.map((i) => (
                <div key={i.id} className="intervention-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text)",
                        lineHeight: 1.4,
                      }}
                    >
                      {i.description}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {i.prix.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "4px 6px", flexShrink: 0 }}
                    onClick={() => onDelete(i.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
