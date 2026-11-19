import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLogos } from "@/config/logo";
import { SITE, telHref } from "@/config/site";
import { adresseComplete, useEntreprise } from "@/config/entreprise";
import { NAV_CTA, useNavLinks } from "@/config/nav";
import LienMesDemandes from "@/components/LienMesDemandes";

/**
 * Composition « Atelier » — barre de navigation classique, en haut.
 *
 * L'identité Atelier passe par la matière (béton, filets d'acier, rouges
 * sécurité, Barlow), pas par une navigation exotique : logo à gauche, liens
 * au centre, action à droite. C'est le parcours que tout le monde connaît.
 */
export default function NavbarAtelier() {
  const logos = useLogos();
  const entreprise = useEntreprise();
  const navLinks = useNavLinks();
  const [ouvert, setOuvert] = useState(false);

  const fermer = () => setOuvert(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-t-4 border-brand-red bg-[color:var(--at-paper)]">
      <div className="border-b-2 border-[color:var(--at-ink)]">
        <div className="mx-auto flex h-20 max-w-[92rem] items-center gap-6 px-5">
          <Link to="/" className="flex shrink-0 items-center gap-3" onClick={fermer}>
            <img src={logos.normal} alt={SITE.logoAlt} className="h-11 w-auto object-contain" />
            <span className="hidden h-8 w-px bg-[color:var(--at-line)] lg:block" aria-hidden="true" />
            <span className="hidden text-[10px] font-bold uppercase leading-[1.5] tracking-[0.14em] text-text-secondary lg:block">
              Concession<br />& atelier
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {navLinks.map((lien) => (
              <NavLink
                key={lien.to}
                to={lien.to}
                end={lien.to === "/"}
                className={({ isActive }) =>
                  `border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-brand-red text-brand-red"
                      : "border-transparent text-text-primary hover:border-[color:var(--at-line)] hover:text-brand-red"
                  }`
                }
              >
                {lien.name}
              </NavLink>
            ))}
            <LienMesDemandes
              className={({ isActive }) =>
                `border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-brand-red text-brand-red"
                    : "border-transparent text-text-primary hover:border-[color:var(--at-line)] hover:text-brand-red"
                }`
              }
            />
          </div>

          <Link
            to={NAV_CTA.to}
            className="ml-auto hidden items-center gap-2 bg-brand-red px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90 md:inline-flex"
            onClick={fermer}
          >
            {NAV_CTA.name}
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
          </Link>

          <button
            type="button"
            onClick={() => setOuvert(!ouvert)}
            aria-expanded={ouvert}
            aria-label="Ouvrir le menu"
            className="ml-auto flex h-10 w-10 items-center justify-center border border-[color:var(--at-line)] text-text-primary md:hidden"
          >
            <span className="material-symbols-outlined">{ouvert ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {ouvert && (
        <div className="max-h-[calc(100svh-5rem)] overflow-y-auto border-b-2 border-[color:var(--at-ink)] bg-[color:var(--at-paper)] px-5 py-4 md:hidden">
          <nav className="space-y-0.5" aria-label="Navigation principale">
            {navLinks.map((lien) => (
              <NavLink
                key={lien.to}
                to={lien.to}
                end={lien.to === "/"}
                onClick={fermer}
                className={({ isActive }) =>
                  `flex items-center justify-between border-b border-[color:var(--at-line)] py-3 text-sm font-semibold ${
                    isActive ? "text-brand-red" : "text-text-primary"
                  }`
                }
              >
                {lien.name}
                <span className="material-symbols-outlined text-[17px] text-text-muted" aria-hidden="true">arrow_outward</span>
              </NavLink>
            ))}
            <LienMesDemandes
              onClick={fermer}
              className={({ isActive }) =>
                `flex items-center justify-between border-b border-[color:var(--at-line)] py-3 text-sm font-semibold ${
                  isActive ? "text-brand-red" : "text-text-primary"
                }`
              }
              apres={<span className="material-symbols-outlined text-[17px] text-text-muted" aria-hidden="true">arrow_outward</span>}
            />
          </nav>

          <div className="mt-4 space-y-2 text-xs text-text-secondary">
            <p className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px]" aria-hidden="true">call</span>
              <a href={telHref(entreprise.telephoneMobile)}>{entreprise.telephoneMobile}</a>
            </p>
            <p className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[17px]" aria-hidden="true">location_on</span>
              {adresseComplete(entreprise)}
            </p>
          </div>

          <Link
            to={NAV_CTA.to}
            onClick={fermer}
            className="mt-4 flex w-full items-center justify-center gap-2 bg-brand-red px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white"
          >
            {NAV_CTA.name}
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
