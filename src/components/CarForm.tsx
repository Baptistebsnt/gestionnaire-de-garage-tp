import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Voiture } from "../types";

interface Props {
  onSubmit: (data: Omit<Voiture, "id" | "statut" | "createdAt">) => void;
}

export const CarForm = ({ onSubmit }: Props) => {
  const [immatriculation, setImmatriculation] = useState("");
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [nomClient, setNomClient] = useState("");
  const [error, setError] = useState("");
  const immatRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    immatRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !immatriculation.trim() ||
      !marque.trim() ||
      !modele.trim() ||
      !nomClient.trim()
    ) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    onSubmit({
      immatriculation: immatriculation.trim().toUpperCase(),
      marque: marque.trim(),
      modele: modele.trim(),
      nomClient: nomClient.trim(),
    });
    setImmatriculation("");
    setMarque("");
    setModele("");
    setNomClient("");
    setError("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-2)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div className="section-label">Nouveau véhicule</div>
      <input
        ref={immatRef}
        className="field"
        placeholder="Immatriculation (ex: AB-123-CD)"
        value={immatriculation}
        onChange={(e) => setImmatriculation(e.target.value)}
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <input
          className="field"
          placeholder="Marque"
          value={marque}
          onChange={(e) => setMarque(e.target.value)}
        />
        <input
          className="field"
          placeholder="Modèle"
          value={modele}
          onChange={(e) => setModele(e.target.value)}
        />
      </div>
      <input
        className="field"
        placeholder="Nom du client"
        value={nomClient}
        onChange={(e) => setNomClient(e.target.value)}
      />
      {error && (
        <div style={{ fontSize: 12, color: "var(--red)" }}>{error}</div>
      )}
      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
      >
        <Plus size={13} /> Enregistrer le véhicule
      </button>
    </form>
  );
};
