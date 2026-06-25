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
  const [prix, setPrix]   = useState("");
  const [error, setError] = useState("");
  const total = interventions.reduce((s, i) => s + i.prix, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { setError("La description est obligatoire."); return; }
    const p = parseFloat(prix);
    if (isNaN(p) || p < 0) { setError("Prix invalide."); return; }
    onAdd({ description: description.trim(), prix: p });
    setDescription(""); setPrix(""); setError("");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="flex shrink-0 items-start gap-4 border-b border-border bg-surface px-6 py-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="plate text-[13px]">{voiture.immatriculation}</span>
            <span className="font-display text-[16px] font-semibold tracking-[0.02em] text-fg">
              {voiture.marque} {voiture.modele}
            </span>
          </div>
          <p className="text-[12px] text-fg-2">
            Client : <span className="font-medium text-fg">{voiture.nomClient}</span>
            <span className="mx-2 opacity-30">·</span>
            Entrée le {new Date(voiture.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </p>
        </div>
        <button className="btn-icon shrink-0 p-1.5 rounded-md text-fg-3 hover:bg-surface-2 hover:text-fg" onClick={onClose}>
          <X size={15} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">

        {/* Total block */}
        {interventions.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-accent-border bg-accent-dim px-5 py-4">
            <div>
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-accent mb-1">
                Total à payer
              </p>
              <p className="text-[12px] text-fg-2">
                {interventions.length} intervention{interventions.length > 1 ? "s" : ""}
              </p>
            </div>
            <span className="font-mono text-[26px] font-bold text-accent">
              {total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </span>
          </div>
        )}

        {/* Add form */}
        <div>
          <div className="section-label">Ajouter une intervention</div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea
              className="field resize-y"
              style={{ minHeight: 72 }}
              placeholder="Description de l'intervention..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <div className="flex items-center gap-2">
              <div className="relative max-w-[152px] flex-1">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-3">
                  <Euro size={12} />
                </span>
                <input
                  className="field pl-7"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Prix (€)"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <Plus size={13} /> Ajouter
              </button>
            </div>
            {error && <p className="text-[11px] text-danger">{error}</p>}
          </form>
        </div>

        {/* List */}
        <div>
          <div className="section-label">
            Interventions {interventions.length > 0 && `(${interventions.length})`}
          </div>
          {interventions.length === 0 ? (
            <div className="empty py-8">
              <span className="text-2xl opacity-30">🔧</span>
              <p className="text-[12px] text-fg-3">Aucune intervention enregistrée.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {interventions.map((i) => (
                <div key={i.id} className="intervention-row">
                  <p className="min-w-0 flex-1 text-[13px] leading-snug text-fg">{i.description}</p>
                  <span className="shrink-0 font-mono text-[13px] font-semibold text-fg">
                    {i.prix.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                  <button
                    className="btn-icon shrink-0 p-1 rounded text-fg-3 hover:text-danger"
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
    </div>
  );
};
