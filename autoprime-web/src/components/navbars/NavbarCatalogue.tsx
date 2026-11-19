import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, type FormEvent } from "react";
import { useLogos } from "@/config/logo";
import { SITE, telHref } from "@/config/site";
import { adresseComplete, useEntreprise } from "@/config/entreprise";
import { NAV_CTA, useNavLinks } from "@/config/nav";
import { usePages } from "@/config/pages";

/**
 * Composition « Catalogue » — barre utilitaire de concession.
 *
 * Bandeau utilitaire sombre (horaires, téléphone, WhatsApp, suivi), puis barre
 * principale claire avec un vrai moteur de recherche qui envoie la requête au
 * catalogue (`/vente?recherche=…`), et une rangée de rayons. Angles nets,
 * aucune transparence : on est dans un outil, pas dans une vitrine.
 */
export default function NavbarCatalogue() {
  // Logo : réglage admin (repli = dossier public)
  const logos = useLogos();

  const navigate = useNavigate();
  const entreprise = useEntreprise();
  const navLinks = useNavLinks();
  const pages = usePages();
  const [recherche, setRecherche] = useState("");
  const [service, setService] = useState<"vente" | "location">("vente");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Le moteur de recherche ne propose que les activités du client.
  const rechercheDisponible = pages.vente || pages.location;
  const serviceEffectif: "vente" | "location" =
    pages[service] ? service : pages.vente ? "vente" : "location";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const lancerRecherche = (event: FormEvent) => {
    event.preventDefault();
    const terme = recherche.trim();
    const base = serviceEffectif === "location" ? "/location" : "/vente";
    navigate(terme ? `${base}?recherche=${encodeURIComponent(terme)}` : base);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50">
      {/* Bandeau utilitaire */}
      <div className="hidden md:block bg-brand-blue-dark text-white">
        <div className="max-w-[92rem] mx-auto px-5 h-9 flex items-center justify-between text-[12px]">
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
            Ouvert aujourd'hui {entreprise.horaires[0]?.heures} · {adresseComplete(entreprise)}
          </p>
          <div className="flex items-center gap-5">
            <a href={telHref(entreprise.telephoneMobile)} className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">call</span>
              {entreprise.telephoneMobile}
            </a>
            <a
              href={`https://wa.me/${entreprise.whatsapp}?text=${encodeURIComponent("Bonjour, je vous contacte depuis votre site.")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-300 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">chat</span>
              WhatsApp
            </a>
            {pages["mes-demandes"] && (
              <Link to="/mes-demandes" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">assignment</span>
                Suivi de demande
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Barre principale : identité + moteur de recherche */}
      <div className={`bg-white border-b border-black/10 transition-shadow duration-300 ${isScrolled ? "shadow-md" : ""}`}>
        <div className="max-w-[92rem] mx-auto px-5 h-20 flex items-center gap-5">
          <Link to="/" className="flex-shrink-0">
            <img src={logos.normal} alt={SITE.logoAlt} className="h-11 w-auto object-contain" />
          </Link>

          {rechercheDisponible && (
          <form onSubmit={lancerRecherche} className="hidden md:flex flex-1 max-w-2xl items-stretch" role="search">
            <label className="sr-only" htmlFor="nav-service">Type de véhicule recherché</label>
            <select
              id="nav-service"
              value={serviceEffectif}
              onChange={(event) => setService(event.target.value as "vente" | "location")}
              className="border border-r-0 border-black/20 bg-brand-surface px-3 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40"
            >
              {pages.vente && <option value="vente">Achat</option>}
              {pages.location && <option value="location">Location</option>}
            </select>
            <label className="sr-only" htmlFor="nav-recherche">Rechercher un véhicule</label>
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl" aria-hidden="true">
                search
              </span>
              <input
                id="nav-recherche"
                type="search"
                value={recherche}
                onChange={(event) => setRecherche(event.target.value)}
                placeholder="Marque, modèle, année…"
                className="w-full h-full border border-black/20 pl-11 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/40"
              />
            </div>
            <button type="submit" className="bg-brand-red px-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-red-dark transition-colors">
              Chercher
            </button>
          </form>
          )}

          <div className="hidden md:flex items-center gap-4 ml-auto">
            {pages.services && (
              <Link to="/services" className="flex flex-col items-center text-text-secondary hover:text-brand-red transition-colors">
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">storefront</span>
                <span className="text-[11px] font-semibold">Services</span>
              </Link>
            )}
            <Link to={NAV_CTA.to} className="bg-brand-blue px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-blue-dark transition-colors">
              {NAV_CTA.name}
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-1 ml-auto">
            {rechercheDisponible && (
              <Link
                to={pages.vente ? "/vente" : "/location"}
                aria-label="Rechercher dans le catalogue"
                className="p-2 text-text-primary"
              >
                <span className="material-symbols-outlined text-3xl">search</span>
              </Link>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-text-primary" aria-expanded={isMenuOpen} aria-label="Ouvrir le menu">
              <span className="material-symbols-outlined text-3xl">{isMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rangée de rayons */}
      <div className="bg-white border-b-2 border-brand-red/20">
        <div className="max-w-[92rem] mx-auto px-5 hidden md:flex items-stretch">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative px-4 py-3 text-[13px] font-bold uppercase tracking-wide text-text-primary transition-colors hover:text-brand-red after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-brand-red after:transition-transform hover:after:scale-x-100"
            >
              {link.name}
            </Link>
          ))}
          <span className="ml-auto flex items-center gap-1.5 py-3 text-[13px] font-semibold text-text-muted">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">support_agent</span>
            Conseil téléphonique 7j/7
          </span>
        </div>

        <div className="md:hidden flex items-center gap-2 px-5 h-11 overflow-x-auto">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="whitespace-nowrap text-[12px] font-bold uppercase tracking-wide text-text-secondary">
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-black/10 animate-fade-in">
          {rechercheDisponible && (
          <form onSubmit={lancerRecherche} className="flex items-stretch border-b border-black/10" role="search">
            <label className="sr-only" htmlFor="nav-recherche-mobile">Rechercher un véhicule</label>
            <input
              id="nav-recherche-mobile"
              type="search"
              value={recherche}
              onChange={(event) => setRecherche(event.target.value)}
              placeholder="Marque, modèle, année…"
              className="flex-1 px-4 py-3 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-brand-red px-5 text-sm font-bold uppercase text-white">
              Ok
            </button>
          </form>
          )}
          <div className="px-5 py-4 space-y-2">
            <a href={telHref(entreprise.telephoneMobile)} className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">call</span>
              {entreprise.telephoneMobile}
            </a>
            <p className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">location_on</span>
              {adresseComplete(entreprise)}
            </p>
            <Link to={NAV_CTA.to} onClick={() => setIsMenuOpen(false)} className="block bg-brand-blue px-5 py-3 text-center text-sm font-bold uppercase tracking-wide text-white">
              {NAV_CTA.name}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
