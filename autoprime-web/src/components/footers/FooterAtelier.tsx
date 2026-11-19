import { Link } from "react-router-dom";
import { useLogos } from "@/config/logo";
import { SITE, mailtoHref, telHref } from "@/config/site";
import { adresseComplete, useEntreprise } from "@/config/entreprise";
import { useNavLinks } from "@/config/nav";
import { usePages } from "@/config/pages";

const label = "text-[10px] font-bold uppercase tracking-[0.2em] text-white/45";

/**
 * Composition « Atelier » — pied de page de concession technique.
 * Fond graphite, filets d'acier, blocs carrés et accents rouge sécurité.
 */
export default function FooterAtelier() {
  const logos = useLogos();
  const entreprise = useEntreprise();
  const navLinks = useNavLinks();
  const pages = usePages();
  const annee = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-4 border-brand-red bg-[color:var(--at-ink)] text-[color:var(--at-paper)]">
      <div className="mx-auto max-w-[92rem] px-5 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <img src={logos.invert} alt={SITE.logoAlt} className="h-11 w-auto object-contain" />
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">{entreprise.slogan}</p>
            <p className="mt-5 inline-flex border border-white/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
              Atelier · {entreprise.anciennete}
            </p>
          </div>

          <div>
            <p className={label}>Plan du site</p>
            <ul className="mt-4 space-y-2">
              {navLinks.map((lien) => (
                <li key={lien.to}>
                  <Link
                    to={lien.to}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition-colors hover:text-white"
                  >
                    <span className="h-1 w-1 bg-brand-red" aria-hidden="true" />
                    {lien.name}
                  </Link>
                </li>
              ))}
              {pages["mes-demandes"] && (
                <li>
                  <Link
                    to="/mes-demandes"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition-colors hover:text-white"
                  >
                    <span className="h-1 w-1 bg-brand-red" aria-hidden="true" />
                    Mes demandes
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className={label}>Nous joindre</p>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-brand-red" aria-hidden="true">location_on</span>
                <span>{adresseComplete(entreprise)}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-brand-red" aria-hidden="true">call</span>
                <a href={telHref(entreprise.telephoneMobile)} className="hover:text-white">{entreprise.telephoneMobile}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-brand-red" aria-hidden="true">mail</span>
                <a href={mailtoHref(entreprise.email)} className="hover:text-white">{entreprise.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {annee} {entreprise.nom}. Tous droits réservés.</p>
          <p className="flex items-center gap-4">
            <span>{entreprise.baseline}</span>
            <Link to="/contact" className="transition-colors hover:text-white">Contact</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
