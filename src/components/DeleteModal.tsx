import { Trash2, AlertTriangle } from "lucide-react";
import { Voiture } from "../types";

interface Props {
  voiture: Voiture;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal = ({ voiture, onConfirm, onCancel }: Props) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onClick={onCancel}
  >
    <div
      className="w-[90%] max-w-sm overflow-hidden rounded-2xl border border-border-2 bg-surface shadow-[0_24px_64px_rgba(0,0,0,0.7)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top stripe */}
      <div className="flex items-center gap-3 border-b border-border bg-danger-dim px-6 py-4">
        <AlertTriangle size={18} className="shrink-0 text-danger" />
        <p className="font-display text-[16px] font-bold tracking-[0.03em] text-fg">
          Supprimer ce véhicule ?
        </p>
      </div>

      <div className="px-6 py-5">
        <p className="mb-1 text-[13px] text-fg-2">
          <span className="plate text-[12px]">{voiture.immatriculation}</span>
          {" — "}{voiture.marque} {voiture.modele}
        </p>
        <p className="mb-5 text-[12.5px] text-fg-3">
          Toutes les interventions associées seront supprimées. Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onCancel}>Annuler</button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
          >
            <Trash2 size={13} /> Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
);
