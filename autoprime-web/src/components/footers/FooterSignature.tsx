import { Link } from "react-router-dom";
import { useLogos } from "@/config/logo";
import { SITE, mailtoHref, telHref } from "@/config/site";
import { adresseComplete, useEntreprise } from "@/config/entreprise";
import { useNavLinks } from "@/config/nav";

/**
 * Composition « Signature » — pied de page nocturne.
 * Dégradé profond, halos animés, quatre colonnes centrées sur la confiance.
 */
export default function FooterSignature() {
  // Logo : réglage admin (repli = dossier public)
  const logos = useLogos();

  const entreprise = useEntreprise();
  const navLinks = useNavLinks();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-brand-blue-dark to-[#0a1020] text-white mt-auto relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-red/20 rounded-full blur-3xl pointer-events-none animate-float-slow" aria-hidden="true" />
      <div className="absolute -bottom-28 -left-20 w-72 h-72 bg-brand-blue/25 rounded-full blur-3xl pointer-events-none animate-drift" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src={logos.invert} alt={SITE.logoAlt} className="h-12 w-auto object-contain rounded mb-4" />
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{entreprise.slogan}</p>
            <p className="text-gray-400 text-sm">
              © {currentYear} {entreprise.nom}. Tous droits réservés.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 relative inline-block">
              Liens Rapides
              <span className="absolute -bottom-1 left-0 h-0.5 w-8 bg-brand-red" />
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 relative inline-block">
              Nous Contacter
              <span className="absolute -bottom-1 left-0 h-0.5 w-8 bg-brand-red" />
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="material-symbols-outlined text-brand-red mr-2 mt-0.5">location_on</span>
                <span className="text-gray-300 text-sm">{adresseComplete(entreprise)}</span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-brand-red mr-2 mt-0.5">phone</span>
                <span className="text-gray-300 text-sm">
                  <a href={telHref(entreprise.telephoneFixe)} className="hover:text-white transition-colors">
                    {entreprise.telephoneFixe}
                  </a>
                  <br />
                  <a href={telHref(entreprise.telephoneMobile)} className="hover:text-white transition-colors">
                    {entreprise.telephoneMobile}
                  </a>
                </span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-brand-red mr-2 mt-0.5">email</span>
                <a href={mailtoHref(entreprise.email)} className="text-gray-300 hover:text-white transition-colors text-sm">
                  {entreprise.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 relative inline-block">
              Horaires
              <span className="absolute -bottom-1 left-0 h-0.5 w-8 bg-brand-red" />
            </h3>
            <ul className="space-y-2 text-sm">
              {entreprise.horaires.map((horaire) => (
                <li
                  key={horaire.jour}
                  className="flex justify-between border-b border-white/10 pb-2 last:border-b-0"
                >
                  <span className="text-gray-300">{horaire.jour}</span>
                  <span className="text-white font-medium">{horaire.heures}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
