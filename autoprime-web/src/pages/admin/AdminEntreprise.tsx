import { adresseComplete, resetEntreprise, setEntreprise, useEntreprise, type EntrepriseInfo, type Statistique } from "@/config/entreprise";
import { resetLogo, setLogo, useLogos, type LogoConfig } from "@/config/logo";
import { SITE } from "@/config/site";

/* ------------------------------------------------------------------ */
/*  PETIT COMPOSANT : sélecteur de fichier logo                        */
/* ------------------------------------------------------------------ */

/**
 * Filepicker d'un logo : lit le fichier choisi en data URL, l'enregistre
 * dans le réglage admin et affiche un aperçu fidèle (fond clair OU sombre
 * selon la variante éditée).
 */
function ChoixLogo({ libelle, variante }: { libelle: string; variante: keyof LogoConfig }) {
  const logos = useLogos();
  const apercu = logos[variante];
  const estRepli = apercu === (variante === "normal" ? SITE.logo : SITE.logoInvert);

  function choisir(event: React.ChangeEvent<HTMLInputElement>) {
    const fichier = event.target.files?.[0];
    if (!fichier) return;
    const lecteur = new FileReader();
    lecteur.onload = () => {
      if (typeof lecteur.result === "string") {
        setLogo({ [variante]: lecteur.result });
      }
    };
    lecteur.readAsDataURL(fichier);
    event.target.value = ""; // permet de re-sélectionner le même fichier
  }

  return (
    <div>
      <span className="block text-sm font-medium text-text-primary">{libelle}</span>
      <div
        className={`mt-2 flex items-center gap-3 rounded-xl border border-border-standard p-3 ${
          variante === "invert" ? "bg-brand-blue-dark" : "bg-white"
        }`}
      >
        <img
          src={apercu}
          alt={`Aperçu du logo ${variante === "normal" ? "clair" : "sombre"}`}
          className={`h-10 w-auto max-w-[10rem] object-contain ${estRepli ? "opacity-60" : ""}`}
          onError={(e) => { (e.currentTarget.style.visibility = "hidden"); }}
        />
        <span className={`text-[11px] uppercase tracking-wider ${variante === "invert" ? "text-white/50" : "text-text-muted"}`}>
          {estRepli ? "Fichier public" : "Personnalisé"}
        </span>
      </div>
      <label className={`mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
        "border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
      }`}>
        <span className="material-symbols-outlined text-base">upload</span>
        Choisir un fichier…
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,.svg"
          onChange={choisir}
          className="sr-only"
        />
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Petits composants de formulaire                                    */
/* ------------------------------------------------------------------ */

const champ =
  "mt-2 w-full rounded-xl border border-border-standard bg-white px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/30";
const carte = "rounded-2xl border border-border-light bg-white p-6 shadow-card";

interface ChampTexteProps {
  libelle: string;
  champCle: keyof Omit<EntrepriseInfo, "horaires" | "statistiques">;
  info: EntrepriseInfo;
  definir: <K extends Exclude<keyof EntrepriseInfo, "horaires" | "statistiques">>(cle: K, valeur: string) => void;
  placeholder?: string;
  txtArea?: boolean;
  maxLength?: number;
}

function ChampTexte({ libelle, champCle, info, definir, placeholder, txtArea, maxLength }: ChampTexteProps) {
  const valeur = info[champCle] as string;
  const maj = txtArea
    ? (event: { target: { value: string } }) => definir(champCle, event.target.value)
    : (event: { target: { value: string } }) => definir(champCle, event.target.value);
  return (
    <label className="block text-sm font-medium text-text-primary">
      {libelle}
      {txtArea ? (
        <textarea value={valeur} onChange={maj} placeholder={placeholder} rows={2} maxLength={maxLength} className={champ} />
      ) : (
        <input value={valeur} onChange={maj} placeholder={placeholder} maxLength={maxLength} className={champ} />
      )}
    </label>
  );
}

export default function AdminEntreprise() {
  const entreprise = useEntreprise();

  const definirChamp = <K extends Exclude<keyof EntrepriseInfo, "horaires" | "statistiques">>(
    cle: K,
    valeur: string,
  ) => setEntreprise({ [cle]: valeur } as Partial<EntrepriseInfo>);

  const definirHoraire = (index: number, champ: "jour" | "heures", valeur: string) => {
    const horaires = entreprise.horaires.map((h, i) => (i === index ? { ...h, [champ]: valeur } : h));
    setEntreprise({ horaires });
  };

  const definirStatistique = (stat: Statistique, champ: "chiffre" | "label", valeur: string) => {
    const statistiques = entreprise.statistiques.map((s) => (s.id === stat.id ? { ...s, [champ]: valeur } : s));
    setEntreprise({ statistiques });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <header>
        <p className="text-sm font-semibold text-brand-red">Personnalisation</p>
        <h1 className="mt-1 text-3xl font-bold text-text-primary">Informations de l’entreprise</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Identité, coordonnées, horaires et chiffres clés affichés partout sur le site. Chaque changement est
          appliqué immédiatement à l’aperçu public et conservé sur cet appareil.
        </p>
      </header>

      {/* ---------- Identité ---------- */}
      <section className={carte} aria-labelledby="identite-heading">
        <h2 id="identite-heading" className="text-lg font-bold text-text-primary">Identité</h2>
        <p className="mt-1 text-sm text-text-secondary">Nom affiché, baseline et textes de référencement.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ChampTexte libelle="Nom court (logo, copyright)" champCle="nom" info={entreprise} definir={definirChamp} maxLength={40} />
          <ChampTexte libelle="Nom long" champCle="nomLong" info={entreprise} definir={definirChamp} maxLength={60} />
          <div className="sm:col-span-2">
            <ChampTexte libelle="Baseline" champCle="baseline" info={entreprise} definir={definirChamp} maxLength={90} placeholder="Vente, Location & Transit de Véhicules" />
          </div>
          <div className="sm:col-span-2">
            <ChampTexte libelle="Slogan de présentation" champCle="slogan" info={entreprise} definir={definirChamp} txtArea maxLength={220} />
          </div>
          <ChampTexte libelle="Ancienneté affichée" champCle="anciennete" info={entreprise} definir={definirChamp} maxLength={40} placeholder="plus de 15 ans" />
          <ChampTexte libelle="Titre des pages (référencement)" champCle="titrePage" info={entreprise} definir={definirChamp} maxLength={70} />
          <div className="sm:col-span-2">
            <ChampTexte libelle="Description des pages (référencement)" champCle="descriptionPage" info={entreprise} definir={definirChamp} txtArea maxLength={160} />
          </div>
        </div>
      </section>

      {/* ---------- Logo ---------- */}
      <section className={carte} aria-labelledby="logo-heading">
        <h2 id="logo-heading" className="text-lg font-bold text-text-primary">Logo</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Fichier PNG ou SVG, choisi depuis l'ordinateur. Le logo est appliqué immédiatement à la navbar,
          au footer et à la barre admin — sans toucher au code ni au dossier public.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ChoixLogo libelle="Logo clair (navbars, footer clair)" variante="normal" />
          <ChoixLogo libelle="Logo sombre (footer sombre, sidebar admin)" variante="invert" />
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={resetLogo}
            className="text-sm font-semibold text-brand-blue hover:text-brand-red underline underline-offset-2 transition-colors"
          >
            Revenir aux fichiers du dossier public
          </button>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section className={carte} aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="text-lg font-bold text-text-primary">Contact</h2>
        <p className="mt-1 text-sm text-text-secondary">Téléphones, WhatsApp et email affichés dans les navbars, footers et la page Contact.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ChampTexte libelle="Téléphone fixe" champCle="telephoneFixe" info={entreprise} definir={definirChamp} maxLength={25} />
          <ChampTexte libelle="Téléphone mobile" champCle="telephoneMobile" info={entreprise} definir={definirChamp} maxLength={25} />
          <ChampTexte libelle="WhatsApp (chiffres uniquement)" champCle="whatsapp" info={entreprise} definir={definirChamp} maxLength={20} placeholder="223XXXXXXXX" />
          <ChampTexte libelle="Email" champCle="email" info={entreprise} definir={definirChamp} maxLength={80} placeholder="contact@votremarque.com" />
        </div>
      </section>

      {/* ---------- Adresse ---------- */}
      <section className={carte} aria-labelledby="adresse-heading">
        <h2 id="adresse-heading" className="text-lg font-bold text-text-primary">Adresse</h2>
        <p className="mt-1 text-sm text-text-secondary">Affichée dans les footers, les bandeaux et la page Contact. Rendue : {adresseComplete(entreprise) || "—"}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <ChampTexte libelle="Rue / quartier" champCle="adresseRue" info={entreprise} definir={definirChamp} maxLength={70} />
          <ChampTexte libelle="Ville" champCle="adresseVille" info={entreprise} definir={definirChamp} maxLength={40} />
          <ChampTexte libelle="Pays" champCle="adressePays" info={entreprise} definir={definirChamp} maxLength={40} />
        </div>
      </section>

      {/* ---------- Horaires ---------- */}
      <section className={carte} aria-labelledby="horaires-heading">
        <h2 id="horaires-heading" className="text-lg font-bold text-text-primary">Horaires d’ouverture</h2>
        <p className="mt-1 text-sm text-text-secondary">Créneaux affichés dans les footers, la navbar Catalogue et la page Contact.</p>
        <div className="mt-4 space-y-3">
          {entreprise.horaires.map((horaire, index) => (
            <div key={`${horaire.jour}-${index}`} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                value={horaire.jour}
                onChange={(e) => definirHoraire(index, "jour", e.target.value)}
                placeholder="Jour (ex. Lundi - Vendredi)"
                aria-label={`Jour de la ligne d’horaires ${index + 1}`}
                className="rounded-xl border border-border-standard bg-white px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/30"
              />
              <input
                value={horaire.heures}
                onChange={(e) => definirHoraire(index, "heures", e.target.value)}
                placeholder="Heures (ex. 08:00 - 18:00 ou Fermé)"
                aria-label={`Heures de la ligne d’horaires ${index + 1}`}
                className="rounded-xl border border-border-standard bg-white px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/30"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Statistiques ---------- */}
      <section className={carte} aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="text-lg font-bold text-text-primary">Chiffres clés</h2>
        <p className="mt-1 text-sm text-text-secondary">Quatre couples chiffre / libellé affichés dans les bandeaux de statistiques des pages d’accueil et Services.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {entreprise.statistiques.map((stat) => (
            <div key={stat.id} className="rounded-xl border border-border-light p-4">
              <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
                <input
                  value={stat.chiffre}
                  onChange={(e) => definirStatistique(stat, "chiffre", e.target.value)}
                  aria-label={`Chiffre du couple ${stat.id}`}
                  maxLength={12}
                  className="rounded-lg border border-border-standard bg-brand-surface px-3 py-2.5 text-center text-lg font-extrabold text-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
                />
                <input
                  value={stat.label}
                  onChange={(e) => definirStatistique(stat, "label", e.target.value)}
                  aria-label={`Libellé du couple ${stat.id}`}
                  maxLength={40}
                  className="rounded-lg border border-border-standard bg-white px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/30"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Réinitialisation ---------- */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => resetEntreprise()}
          className="rounded-xl border border-border-standard px-5 py-3 font-semibold text-text-secondary hover:bg-brand-light"
        >
          Rétablir les valeurs du template
        </button>
        <span className="text-xs text-text-muted">Enregistré au fil de la frappe — le site public se met à jour en direct.</span>
      </div>
    </div>
  );
}
