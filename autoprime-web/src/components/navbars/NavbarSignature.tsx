import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLogos } from "@/config/logo";
import { SITE } from "@/config/site";
import { useEntreprise } from "@/config/entreprise";
import { NAV_CTA, useNavLinks } from "@/config/nav";
import { usePages } from "@/config/pages";

/**
 * Composition « Signature » — barre de navigation en verre flottant.
 * Logo à gauche, liens centrés avec soulignement animé, bouton d'action à
 * droite, fine barre de progression de lecture en bas.
 */
export default function NavbarSignature() {
  // Logo : réglage admin (repli = dossier public)
  const logos = useLogos();

  const entreprise = useEntreprise();
  const navLinks = useNavLinks();
  const pages = usePages();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [progression, setProgression] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const hauteurMax = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgression(hauteurMax > 0 ? (window.scrollY / hauteurMax) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass shadow-premium" : "bg-white/95 shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <img src={logos.normal} alt={SITE.logoAlt} title={entreprise.nomLong} className="h-12 w-auto object-contain" />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group relative text-text-primary hover:text-brand-red font-medium transition-colors py-2"
              >
                {link.name}
                <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-brand-red transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            {pages["mes-demandes"] && (
              <Link
                to="/mes-demandes"
                className="group relative text-text-primary hover:text-brand-red font-medium transition-colors py-2"
              >
                Mes demandes
                <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-brand-red transition-all duration-300 group-hover:w-full" />
              </Link>
            )}
          </div>

          <div className="hidden md:block">
            <Link to={NAV_CTA.to} className="btn-premium inline-block text-white font-bold py-2.5 px-5 rounded-full">
              {NAV_CTA.name}
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-text-primary" aria-expanded={isMenuOpen} aria-label="Ouvrir le menu">
              <span className="material-symbols-outlined text-3xl">{isMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden glass border-t border-border-standard animate-fade-in">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-3 py-2 text-base font-medium text-text-primary hover:text-brand-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {pages["mes-demandes"] && (
              <Link
                to="/mes-demandes"
                className="block px-3 py-2 text-base font-medium text-text-primary hover:text-brand-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mes demandes
              </Link>
            )}
            <Link
              to={NAV_CTA.to}
              onClick={() => setIsMenuOpen(false)}
              className="btn-premium block w-full mt-4 text-center text-white font-bold py-2.5 px-4 rounded-full"
            >
              {NAV_CTA.name}
            </Link>
          </div>
        </div>
      )}

      <div className="h-0.5 w-full bg-black/5" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-brand-red to-brand-blue transition-[width] duration-150 ease-out"
          style={{ width: `${progression}%` }}
        />
      </div>
    </nav>
  );
}
