import { useState } from "react";
import { Link } from "react-router-dom";
import { useDemandes } from "@/store/demandes";
import type { StatutDemande, StatutSinistre } from "@/types/demandes";
import { formatDate } from "@/utils/format";
import JustificatifsListe from "@/components/JustificatifsListe";
import PageHeader from "@/components/PageHeader";
import SinistreModal from "@/components/SinistreModal";

// Libellés / couleurs des statuts
const STATUTS_DEMANDE: { valeur: StatutDemande; label: string; couleur: string }[] = [
  { valeur: "en_attente", label: "En attente", couleur: "bg-orange-500 text-white" },
  { valeur: "validee", label: "Validée", couleur: "bg-green-600 text-white" },
  { valeur: "refusee", label: "Refusée", couleur: "bg-red-600 text-white" },
];

const STATUTS_SINISTRE: { valeur: StatutSinistre; label: string; couleur: string }[] = [
  { valeur: "recue", label: "Reçue", couleur: "bg-brand-blue text-white" },
  { valeur: "en_examen", label: "En examen", couleur: "bg-orange-500 text-white" },
  { valeur: "acceptee", label: "Acceptée", couleur: "bg-green-600 text-white" },
  { valeur: "refusee", label: "Refusée", couleur: "bg-red-600 text-white" },
];

function couleurDemande(s: StatutDemande) {
  return STATUTS_DEMANDE.find((x) => x.valeur === s)?.couleur ?? "bg-gray-400 text-white";
}

function labelDemande(s: StatutDemande) {
  return STATUTS_DEMANDE.find((x) => x.valeur === s)?.label ?? s;
}

function couleurSinistre(s: StatutSinistre) {
  return STATUTS_SINISTRE.find((x) => x.valeur === s)?.couleur ?? "bg-gray-400 text-white";
}

function labelSinistre(s: StatutSinistre) {
  return STATUTS_SINISTRE.find((x) => x.valeur === s)?.label ?? s;
}

const inputCls =
  "w-full rounded-lg border border-border-standard bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red transition-colors";

/** Page publique : le client suit ses demandes et signale un problème. */
export default function MesDemandes() {
  const { locations, essais, sinistres } = useDemandes();

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [recherche, setRecherche] = useState<{ nom: string; tel: string } | null>(null);
  const [sinistreOuvert, setSinistreOuvert] = useState(false);

  const tel = recherche?.tel.replace(/\s/g, "") ?? "";
  // Tant que le client n'a pas lancé la recherche, aucune demande ne correspond.
  // Un nom enregistré vide ne bloque pas l'affichage : le téléphone fait foi.
  const correspond = (cNom: string, cTel: string) =>
    recherche !== null &&
    cTel.replace(/\s/g, "").includes(tel) &&
    (recherche.nom === "" ||
      cNom.trim() === "" ||
      cNom.toLowerCase().includes(recherche.nom.toLowerCase()));

  // Nom réellement associé à ce téléphone (pour rattacher un signalement à la bonne fiche)
  const nomDuClient =
    recherche === null
      ? nom.trim()
      : locations.find((d) => d.telephone.replace(/\s/g, "").includes(tel))?.client.trim() ||
        recherche.nom ||
        nom.trim();

  const mesLocations = locations.filter((d) => correspond(d.client, d.telephone));
  const mesEssais = essais.filter((d) => correspond(d.client, d.telephone));
  const mesSinistres = sinistres.filter((d) => correspond(d.client, d.telephone));
  const total = mesLocations.length + mesEssais.length + mesSinistres.length;

  return (
    <>
      {/* En-tête (commun aux compositions) */}
      <PageHeader page="mes-demandes" />

      <section className="py-12 bg-brand-light min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Recherche */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setRecherche({ nom: nom.trim(), tel: telephone.trim() });
            }}
            className="bg-white rounded-2xl shadow-card p-5 space-y-4"
          >
            <h2 className="font-bold text-text-primary">Retrouver mes demandes</h2>
            <p className="text-sm text-text-muted">
              Saisissez le nom et le téléphone utilisés lors de la demande.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                className={inputCls}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom (ex: Amadou)"
                aria-label="Nom"
              />
              <input
                required
                className={inputCls}
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="Téléphone"
                aria-label="Téléphone"
              />
              <button
                type="submit"
                className="bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red-dark transition-colors px-5 py-2"
              >
                Afficher mes demandes
              </button>
            </div>
          </form>

          {/* Résultats */}
          {recherche && (
            <>
              <p className="text-text-secondary">
                {total === 0 ? (
                  "Aucune demande trouvée pour ce numéro."
                ) : (
                  <>
                    <span className="font-semibold text-text-primary">{total}</span> demande(s)
                    trouvée(s) pour le {recherche.tel}.
                  </>
                )}
              </p>

              {/* Demande de location */}
              {mesLocations.map((d) => (
                <article key={d.id} className="bg-white rounded-2xl shadow-card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-text-primary">{d.vehicule}</h3>
                      <p className="text-sm text-text-muted">
                        Demandé le {formatDate(d.createdAt)}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${couleurDemande(d.statut)}`}>
                      {labelDemande(d.statut)}
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary">
                    Du {d.dateDebut} au {d.dateFin} ({d.jours} jour(s))
                  </p>

                  {d.motifRefus && (
                    <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                      Motif du refus : {d.motifRefus}
                    </p>
                  )}

                  <div>
                    <p className="text-xs uppercase text-text-muted mb-2">Justificatifs envoyés</p>
                    <JustificatifsListe justificatifs={d.justificatifs} />
                  </div>

                  {d.statut === "validee" && (
                    <button
                      type="button"
                      onClick={() => setSinistreOuvert(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-brand-red/40 text-brand-red hover:bg-brand-red/10"
                    >
                      <span className="material-symbols-outlined text-lg">report_problem</span>
                      Signaler un problème sur cette location
                    </button>
                  )}
                </article>
              ))}

              {/* Demande d'essai */}
              {mesEssais.map((d) => (
                <article key={d.id} className="bg-white rounded-2xl shadow-card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-text-primary">
                        Essai — {d.vehicule}
                      </h3>
                      <p className="text-sm text-text-muted">
                        Demandé le {formatDate(d.createdAt)}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${couleurDemande(d.statut)}`}>
                      {labelDemande(d.statut)}
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary">Date souhaitée : {d.dateEssai}</p>

                  {d.motifRefus && (
                    <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                      Motif du refus : {d.motifRefus}
                    </p>
                  )}

                  <div>
                    <p className="text-xs uppercase text-text-muted mb-2">Justificatifs envoyés</p>
                    <JustificatifsListe justificatifs={d.justificatifs} />
                  </div>
                </article>
              ))}

              {/* Sinistres */}
              {mesSinistres.map((s) => (
                <article key={s.id} className="bg-white rounded-2xl shadow-card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-text-primary">
                        Signalement — {s.vehicule}
                      </h3>
                      <p className="text-sm text-text-muted">Envoyé le {formatDate(s.createdAt)}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${couleurSinistre(s.statut)}`}>
                      {labelSinistre(s.statut)}
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary">{s.description}</p>

                  {s.decision && (
                    <p className="bg-brand-light rounded-xl p-3 text-sm text-text-secondary">
                      <span className="font-semibold text-text-primary">Réponse : </span>
                      {s.decision}
                    </p>
                  )}

                  <div>
                    <p className="text-xs uppercase text-text-muted mb-2">Justificatifs transmis</p>
                    <JustificatifsListe justificatifs={s.justificatifs} />
                  </div>
                </article>
              ))}

              {/* Pas encore de demande */}
              {total === 0 && (
                <div className="bg-white rounded-2xl shadow-card p-10 text-center">
                  <span className="material-symbols-outlined text-text-muted" style={{ fontSize: "48px" }}>
                    search_off
                  </span>
                  <p className="mt-3 font-semibold text-text-primary">Aucune demande trouvée</p>
                  <p className="text-text-secondary mt-1">
                    Vous pouvez faire une demande depuis la page{" "}
                    <Link to="/location" className="text-brand-red font-semibold hover:underline">
                      Location
                    </Link>{" "}
                    ou{" "}
                    <Link to="/vente" className="text-brand-red font-semibold hover:underline">
                      Vente
                    </Link>
                    .
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {sinistreOuvert && (
        <SinistreModal
          client={nomDuClient}
          telephone={recherche?.tel || telephone}
          vehicule={mesLocations[0]?.vehicule}
          onClose={() => setSinistreOuvert(false)}
        />
      )}
    </>
  );
}
