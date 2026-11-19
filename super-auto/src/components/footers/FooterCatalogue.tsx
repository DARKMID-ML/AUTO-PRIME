import { Link } from "react-router-dom";
import { useLogos } from "@/config/logo";
import { SITE, mailtoHref, telHref } from "@/config/site";
import { adresseComplete, useEntreprise } from "@/config/entreprise";
import { usePages, type ClePage } from "@/config/pages";

/**
 * Composition « Catalogue » — plan de site utilitaire.
 * Surface claire, angles nets, filets fins, bandeau de coordonnées en tuiles.
 */
export default function FooterCatalogue() {
  // Logo : réglage admin (repli = dossier public)
  const logos = useLogos();

  const entreprise = useEntreprise();
  const pages = usePages();
  const currentYear = new Date().getFullYear();

  type LienFooter = { nom: string; to: string; page?: ClePage };

  const colonnes: { titre: string; liens: LienFooter[] }[] = [
    {
      titre: "Acheter",
      liens: [
        { nom: "Véhicules à vendre", to: "/vente", page: "vente" },
        { nom: "Véhicules en location", to: "/location", page: "location" },
        { nom: "Demander un devis", to: "/contact" },
      ],
    },
    {
      titre: "Nos rayons",
      liens: [
        { nom: "Vente de véhicules", to: "/vente", page: "vente" },
        { nom: "Location courte & longue durée", to: "/location", page: "location" },
        { nom: "Transit & importation", to: "/transit", page: "transit" },
        { nom: "Tous nos services", to: "/services", page: "services" },
      ],
    },
    {
      titre: "Informations",
      liens: [
        { nom: "Suivi de demande", to: "/mes-demandes", page: "mes-demandes" },
        { nom: "Nous contacter", to: "/contact" },
        { nom: "Horaires & accès", to: "/contact" },
      ],
    },
  ];

  // On retire les liens des pages désactivées, puis les colonnes vides.
  const colonnesVisibles = colonnes
    .map((colonne) => ({
      ...colonne,
      liens: colonne.liens.filter((lien) => !lien.page || pages[lien.page]),
    }))
    .filter((colonne) => colonne.liens.length > 0);

  return (
    <footer className="mt-auto bg-white border-t-4 border-brand-red">
      {/* Bandeau de coordonnées */}
      <div className="bg-brand-surface border-b border-black/10">
        <div className="max-w-[92rem] mx-auto px-5 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-brand-red text-3xl" aria-hidden="true">location_on</span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-text-secondary">Showroom</p>
              <p className="mt-1 text-sm text-text-primary">{adresseComplete(entreprise)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-brand-red text-3xl" aria-hidden="true">call</span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-text-secondary">Téléphone</p>
              <p className="mt-1 text-sm text-text-primary">
                <a href={telHref(entreprise.telephoneFixe)} className="hover:text-brand-red transition-colors">{entreprise.telephoneFixe}</a>
                <br />
                <a href={telHref(entreprise.telephoneMobile)} className="hover:text-brand-red transition-colors">{entreprise.telephoneMobile}</a>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-brand-red text-3xl" aria-hidden="true">schedule</span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-text-secondary">Horaires</p>
              <ul className="mt-1 text-sm text-text-primary space-y-0.5">
                {entreprise.horaires.map((horaire) => (
                  <li key={horaire.jour} className="flex gap-3">
                    <span className="text-text-muted">{horaire.jour}</span>
                    <span className="font-semibold">{horaire.heures}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-brand-red text-3xl" aria-hidden="true">chat</span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-text-secondary">Réponse rapide</p>
              <a
                href={`https://wa.me/${entreprise.whatsapp}?text=${encodeURIComponent("Bonjour, je vous contacte depuis votre site.")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block bg-brand-blue px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white hover:bg-brand-blue-dark transition-colors"
              >
                Écrire sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Plan de site */}
      <div className="max-w-[92rem] mx-auto px-5 py-10 grid gap-8 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
        <div>
          <img src={logos.normal} alt={SITE.logoAlt} className="h-11 w-auto object-contain" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">{entreprise.slogan}</p>
          <a href={mailtoHref(entreprise.email)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">mail</span>
            {entreprise.email}
          </a>
        </div>

        {colonnesVisibles.map((colonne) => (
          <div key={colonne.titre}>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-text-primary border-b border-black/10 pb-2">{colonne.titre}</p>
            <ul className="mt-3 space-y-2">
              {colonne.liens.map((lien) => (
                <li key={`${colonne.titre}-${lien.nom}`}>
                  <Link to={lien.to} className="text-sm text-text-secondary hover:text-brand-red transition-colors">
                    {lien.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Barre légale */}
      <div className="border-t border-black/10">
        <div className="max-w-[92rem] mx-auto px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[12px] text-text-muted">
          <p>© {currentYear} {entreprise.nom}. Tous droits réservés.</p>
          <p className="flex items-center gap-4">
            <span>{entreprise.baseline}</span>
            <Link to="/contact" className="hover:text-brand-red transition-colors">Mentions & confidentialité</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
