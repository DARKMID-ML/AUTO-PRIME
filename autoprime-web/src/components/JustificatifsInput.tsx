import { useState } from "react";
import type { Justificatif, TypeJustificatif } from "@/types/demandes";
import { LIBELLES_JUSTIFICATIFS, tailleLisible } from "@/store/demandes";

interface Props {
  /** Le permis de conduire est obligatoire (demande de location). */
  permisObligatoire: boolean;
  valeur: Justificatif[];
  onChange: (v: Justificatif[]) => void;
}

/**
 * Le client choisit les justificatifs qu'il envoie : il coche ce qu'il a,
 * puis joint un fichier ou colle un lien pour chaque document coché.
 */
export default function JustificatifsInput({ permisObligatoire, valeur, onChange }: Props) {
  const [enCours, setEnCours] = useState<string>("");

  const estCoche = (type: TypeJustificatif) => valeur.some((j) => j.type === type);

  function basculer(type: TypeJustificatif) {
    const deja = estCoche(type);
    if (!deja) {
      onChange([
        ...valeur,
        {
          type,
          libelle: LIBELLES_JUSTIFICATIFS.find((l) => l.type === type)?.label ?? type,
        },
      ]);
    } else if (!permisObligatoire || type !== "permis") {
      onChange(valeur.filter((j) => j.type !== type));
    }
  }

  function maj(type: TypeJustificatif, patch: Partial<Justificatif>) {
    onChange(valeur.map((j) => (j.type === type ? { ...j, ...patch } : j)));
  }

  async function choisirFichier(type: TypeJustificatif, fichier: File | undefined) {
    if (!fichier) return;
    setEnCours(type);
    // On lit le fichier puis on construit le justificatif (aperçu image si possible)
    const taille = fichier.size;
    const apercu =
      fichier.type.startsWith("image/") && taille < 700 * 1024
        ? await new Promise<string | undefined>((resolve) => {
            const lecteur = new FileReader();
            lecteur.onload = () => resolve(String(lecteur.result));
            lecteur.onerror = () => resolve(undefined);
            lecteur.readAsDataURL(fichier);
          })
        : undefined;

    maj(type, {
      nomFichier: fichier.name,
      taille,
      apercu,
      lien: undefined,
    });
    setEnCours("");
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-text-primary">
        Justificatifs{" "}
        <span className="text-text-muted font-normal">(cochez ce que vous envoyez)</span>
      </legend>

      {/* Cases à cocher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LIBELLES_JUSTIFICATIFS.map((l) => {
          const actif = estCoche(l.type);
          const obligatoire = l.type === "permis" && permisObligatoire;
          return (
            <button
              key={l.type}
              type="button"
              onClick={() => basculer(l.type)}
              className={`flex items-start gap-3 text-left rounded-xl border p-3 transition-colors ${
                actif
                  ? "border-brand-red bg-brand-red/5"
                  : "border-border-standard hover:bg-brand-light"
              }`}
            >
              <span
                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                  actif ? "bg-brand-red border-brand-red" : "border-border-standard"
                }`}
                aria-hidden="true"
              >
                {actif && <span className="material-symbols-outlined text-white text-sm">check</span>}
              </span>
              <span>
                <span className="block text-sm font-medium text-text-primary">
                  {l.label}
                  {obligatoire && <span className="text-brand-red"> *</span>}
                </span>
                <span className="block text-xs text-text-muted">{l.aide}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Fichier / lien pour chaque justificatif coché */}
      {valeur.map((j) => (
        <div key={j.type} className="border border-border-light rounded-xl p-3 space-y-2">
          <p className="text-sm font-semibold text-text-primary">{j.libelle}</p>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border-standard text-sm font-medium text-text-secondary hover:bg-brand-light cursor-pointer">
              <span className="material-symbols-outlined text-lg">attach_file</span>
              {j.nomFichier ? "Changer le fichier" : "Joindre un fichier"}
              <input
                type="file"
                className="hidden"
                onChange={(e) => void choisirFichier(j.type, e.target.files?.[0])}
              />
            </label>

            {enCours === j.type && <span className="text-xs text-text-muted">Lecture…</span>}

            {j.nomFichier && (
              <span className="text-xs text-text-secondary">
                {j.nomFichier} ({tailleLisible(j.taille)})
                {!j.apercu && j.taille && j.taille > 700 * 1024 && (
                  <span className="text-text-muted"> · aperçu non affiché (fichier lourd)</span>
                )}
              </span>
            )}
          </div>

          {/* Aperçu de l'image */}
          {j.apercu && (
            <img
              src={j.apercu}
              alt={`Aperçu — ${j.libelle}`}
              className="max-h-28 rounded-lg border border-border-light"
            />
          )}

          {/* Lien alternatif (Drive, WhatsApp…) */}
          <input
            type="url"
            value={j.lien ?? ""}
            onChange={(e) => maj(j.type, { lien: e.target.value })}
            placeholder="ou collez un lien vers le document (optionnel)"
            className="w-full rounded-lg border border-border-standard bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red"
          />
        </div>
      ))}
    </fieldset>
  );
}
