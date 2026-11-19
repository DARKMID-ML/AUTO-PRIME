import { NavLink, Outlet, Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { estDev, seDeconnecter, useSession, type Role } from "@/config/auth";
import { usePages, type ClePage } from "@/config/pages";
import { useLogos } from "@/config/logo";
import { SITE } from "@/config/site";

type Entree = {
  to: string;
  label: string;
  icon: string;
  end: boolean;
  roles: Role[];
  /** Le lien n'apparaît que si au moins une de ces pages est active. */
  pagesRequises?: ClePage[];
};

type Groupe = {
  titre: string;
  entrees: Entree[];
  /** Groupe visible uniquement pour le compte technique. */
  devSeulement?: boolean;
};

const TOUS: Role[] = ["admin", "vendeur", "dev"];
const ADMIN_DEV: Role[] = ["admin", "dev"];
const DEV: Role[] = ["dev"];

// La navigation est groupée : pilotage, exploitation, compte, puis la
// configuration réservée au compte technique `dev`.
const GROUPES: Groupe[] = [
  {
    titre: "Pilotage",
    entrees: [
      { to: "/admin", label: "Tableau de bord", icon: "dashboard", end: true, roles: TOUS },
    ],
  },
  {
    titre: "Exploitation",
    entrees: [
      { to: "/admin/vehicules", label: "Véhicules", icon: "directions_car", end: false, roles: TOUS, pagesRequises: ["vente", "location"] },
      { to: "/admin/location", label: "Location", icon: "car_rental", end: false, roles: ADMIN_DEV, pagesRequises: ["location"] },
      { to: "/admin/demandes", label: "Demandes", icon: "fact_check", end: false, roles: TOUS, pagesRequises: ["vente", "location"] },
      { to: "/admin/messages", label: "Messages", icon: "mail", end: false, roles: TOUS },
      { to: "/admin/devis", label: "Devis transit", icon: "local_shipping", end: false, roles: TOUS, pagesRequises: ["transit"] },
    ],
  },
  {
    titre: "Compte",
    entrees: [
      { to: "/admin/parametres", label: "Paramètres", icon: "settings", end: false, roles: TOUS },
    ],
  },
  {
    titre: "Configuration",
    devSeulement: true,
    entrees: [
      { to: "/admin/comptes", label: "Comptes", icon: "manage_accounts", end: false, roles: DEV },
      { to: "/admin/pages", label: "Pages du site", icon: "visibility", end: false, roles: DEV },
      { to: "/admin/apparence", label: "Apparence", icon: "palette", end: false, roles: DEV },
      { to: "/admin/entreprise", label: "Identité & logo", icon: "business", end: false, roles: DEV },
      { to: "/admin/contenu", label: "Contenu", icon: "article", end: false, roles: DEV },
      { to: "/admin/services", label: "Services", icon: "handyman", end: false, roles: DEV },
    ],
  },
];

function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .map((mot) => mot[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Console d'administration : barre latérale groupée par usage, contenu à
 * droite. Les entrées sont filtrées par rôle ; la configuration n'apparaît
 * que pour le compte technique `dev`.
 */
export default function AdminLayout() {
  const logos = useLogos();
  const session = useSession();
  const pagesActives = usePages();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);

  if (!session) {
    return <Navigate to="/admin/connexion" replace />;
  }

  const dev = estDev(session);
  const groupes = GROUPES
    .filter((groupe) => !groupe.devSeulement || dev)
    .map((groupe) => ({
      ...groupe,
      entrees: groupe.entrees.filter((entree) =>
        entree.roles.includes(session.role) &&
        (!entree.pagesRequises || entree.pagesRequises.some((page) => pagesActives[page])),
      ),
    }))
    .filter((groupe) => groupe.entrees.length > 0);

  async function deconnexion() {
    await seDeconnecter();
    navigate("/admin/connexion", { replace: true });
  }

  const roleLabel = dev ? "Développeur" : session.role === "vendeur" ? "Vendeur" : "Administrateur";

  const lienStyle = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors ${
      isActive
        ? "bg-brand-red text-white shadow-sm"
        : "text-gray-300 hover:bg-white/[0.07] hover:text-white"
    }`;

  const contenuMenu = (
    <div className="flex h-full flex-col">
      {/* Marque */}
      <div className="border-b border-white/10 px-5 pb-5 pt-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOuvert(false)}>
          <img src={logos.invert} alt={SITE.logoAlt} className="h-9 w-auto object-contain" />
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <p className="text-[11px] font-medium tracking-wide text-gray-400">
            {SITE.nom} · console
          </p>
          {dev && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-300">
              technique
            </span>
          )}
        </div>
      </div>

      {/* Navigation groupée */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Menu admin">
        {groupes.map((groupe) => (
          <div key={groupe.titre}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold text-gray-500">{groupe.titre}</p>
            <div className="space-y-1">
              {groupe.entrees.map((entree) => (
                <NavLink
                  key={entree.to}
                  to={entree.to}
                  end={entree.end}
                  className={lienStyle}
                  onClick={() => setMenuOuvert(false)}
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    {entree.icon}
                  </span>
                  {entree.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Compte + sortie */}
      <div className="space-y-3 border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-red/20 text-[11px] font-bold text-brand-red"
            aria-hidden="true"
          >
            {initiales(session.nom)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">{session.nom}</p>
            <p className="text-[11px] text-gray-400">{roleLabel}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={deconnexion}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-300 transition-colors hover:bg-white/[0.07] hover:text-white"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
          Déconnexion
        </button>

        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-300 transition-colors hover:bg-white/[0.07] hover:text-white"
          onClick={() => setMenuOuvert(false)}
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">storefront</span>
          Voir le site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-light">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-brand-blue-dark md:flex">
        {contenuMenu}
      </aside>

      {menuOuvert && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOuvert(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-brand-blue-dark animate-fade-in">
            {contenuMenu}
          </aside>
        </div>
      )}

      <div className="md:pl-72">
        <header className="sticky top-0 z-[60] flex h-16 items-center justify-between bg-brand-blue-dark px-4 text-white md:hidden">
          <button
            type="button"
            onClick={() => setMenuOuvert(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10"
            aria-label="Ouvrir le menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="max-w-[60%] truncate text-sm font-bold">{SITE.nom}</span>
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10"
            aria-label="Voir le site"
          >
            <span className="material-symbols-outlined">storefront</span>
          </Link>
        </header>

        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] p-4 md:min-h-screen md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
