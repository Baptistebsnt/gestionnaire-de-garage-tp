import { Voiture, Intervention } from "../types";

const fmt = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export const printFacture = (voiture: Voiture, interventions: Intervention[]) => {
  const total = interventions.reduce((s, i) => s + i.prix, 0);

  const rows = interventions
    .map(
      (i) => `
      <tr>
        <td>${i.description}</td>
        <td class="prix">${fmt(i.prix)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Facture — ${voiture.immatriculation}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 40px; max-width: 700px; margin: 0 auto; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 20px; border-bottom: 3px solid #111; }
  .brand { font-size: 26px; font-weight: 900; letter-spacing: 0.08em; }
  .brand-sub { font-size: 11px; color: #888; margin-top: 3px; }
  .doc-title { font-size: 24px; font-weight: 700; text-align: right; }
  .doc-date { font-size: 11px; color: #888; text-align: right; margin-top: 4px; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 32px; }
  .info-block h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #999; margin-bottom: 8px; }
  .plate { display: inline-block; font-family: monospace; font-weight: 700; font-size: 15px; background: #f5f5f5; border: 1px solid #ddd; padding: 3px 9px; border-radius: 4px; letter-spacing: 0.06em; }
  .client-name { font-size: 16px; font-weight: 700; }
  .meta { font-size: 11px; color: #888; margin-top: 4px; }

  table { width: 100%; border-collapse: collapse; }
  thead th { background: #111; color: #fff; text-align: left; padding: 9px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
  thead th.prix { text-align: right; }
  tbody td { padding: 10px 14px; border-bottom: 1px solid #eee; line-height: 1.5; }
  tbody td.prix { text-align: right; font-family: monospace; font-weight: 600; white-space: nowrap; }
  tbody tr:last-child td { border-bottom: none; }

  .total-bar { display: flex; justify-content: flex-end; border-top: 2px solid #111; margin-top: 0; }
  .total-inner { padding: 14px 16px; min-width: 260px; display: flex; justify-content: space-between; align-items: center; gap: 40px; }
  .total-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #555; }
  .total-amount { font-family: monospace; font-size: 24px; font-weight: 900; }

  .footer { margin-top: 48px; padding-top: 14px; border-top: 1px solid #e5e5e5; font-size: 10px; color: #bbb; text-align: center; }

  @media print { body { padding: 16px; } }
</style>
</head>
<body>

  <div class="header">
    <div>
      <div class="brand">GARAGE</div>
      <div class="brand-sub">Gestionnaire de garage</div>
    </div>
    <div>
      <div class="doc-title">FACTURE</div>
      <div class="doc-date">Émise le ${fmtDate(new Date().toISOString())}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-block">
      <h3>Véhicule</h3>
      <p><span class="plate">${voiture.immatriculation}</span></p>
      <p style="margin-top:7px; font-size:14px; font-weight:600;">${voiture.marque} ${voiture.modele}</p>
      <p class="meta">Entrée le ${fmtDate(voiture.createdAt)}</p>
    </div>
    <div class="info-block">
      <h3>Client</h3>
      <p class="client-name">${voiture.nomClient}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description de l'intervention</th>
        <th class="prix">Montant TTC</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="total-bar">
    <div class="total-inner">
      <span class="total-label">Total TTC</span>
      <span class="total-amount">${fmt(total)}</span>
    </div>
  </div>

  <div class="footer">Merci de votre confiance &mdash; Garage Manager</div>

</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
};
