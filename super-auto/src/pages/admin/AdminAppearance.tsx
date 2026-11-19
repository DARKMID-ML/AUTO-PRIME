import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applyTheme, colorThemes, getThemeSettings, layoutPresets, siteLayouts, THEME_STORAGE_KEY, typographyPresets, type SiteLayout, type ThemeSettings } from "@/config/theme";
import { pagesEntetes, resetPageHeader, setPageHeader, usePageHeader, type PageHeaderKey } from "@/config/headers";
import { enregistrerParametreSite } from "@/config/parametresSite";
import type { Vehicule } from "@/types/vehicule";
import React from "react";
import VehicleModal from "@/components/VehicleModal";

const colorLabels: Record<keyof typeof colorThemes, string> = { showroom: "Showroom", electric: "Électrique", luxury: "Luxe", sport: "Sport", ocean: "Océan" };
const typeLabels: Record<keyof typeof typographyPresets, string> = { modern: "Moderne", technical: "Technique", classic: "Classique" };
const layoutLabels: Record<keyof typeof layoutPresets, string> = { compact: "Compact", balanced: "Équilibré", spacious: "Aéré" };
const card = "rounded-2xl border border-border-light bg-white p-6 shadow-card";

/** Véhicule de démo pour l'aperçu de la modale dans l'admin. */
const VEHICULE_PREVIEW: Vehicule = { id: 0, marque: "Ford", model: "Explorer", annee: 2024, type: "SUV", prix: "42 900 €", image: "https://images.unsplash.com/photo-1582407942313-5c3f4a2b0b6b?w=900&q=80", description: "SUV luxueux spacieux pour les familles. Capacité de 7 places, climatisation double zone, système de divertissement premium.", statut: "Disponible", service: "Vente", km: "22 500 km", consomation: "8,2 L/100km", transmission: "Automatique", places: "7 places", climatisation: "Double zone", atouts: "Climatisation double zone, 7 places, Sièges chauffants, Caméra 360°, Vitres électriques, Régulateur adaptatif, Télévision centrale", peinture: "Rouge", interieur: "Cuir noir", category: "SUV", carburant: "Essence", localisation: "Bamako" };

/** Options de personnalisation de la navbar et du footer */
const suivreComposition = { key: "suivre", label: "Suivre la composition", description: "L'élément change en même temps que la composition du site (comportement par défaut)." };
const navbarOptions = [
  suivreComposition,
  { key: "signature", label: "Showroom nocturne (Signature)", description: "Pilule de verre flottante, soulignage animé, barre de progression au défilement." },
  { key: "atelier", label: "Barre d'atelier (Atelier)", description: "Barre en haut, matière béton, liens en casse normale et action carrée." },
  { key: "catalogue", label: "Barre utilitaire (Catalogue)", description: "Barre d'informations, moteur de recherche intégré, rubriques denses." },
];

const footerOptions = [
  suivreComposition,
  { key: "signature", label: "Showroom nocturne (Signature)", description: "Sombre et premium : liens sociaux, colonnes de liens, call-to-action." },
  { key: "atelier", label: "Plan d'atelier (Atelier)", description: "Graphite, filets d'acier, plan du site et coordonnées en blocs carrés." },
  { key: "catalogue", label: "Plan utilitaire (Catalogue)", description: "Plan utilitaire avec liens rapides vers les filtres de véhicules." },
];

/** Libellés de chaque style de modale (pour l'aperçu dans l'admin). */
const modalLabels: Record<string, string> = {
  signature: "Showroom arrondi (Signature)",
  atelier: "Fiche atelier (sobre)",
  catalogue: "Fiche inventaire (Catalogue)",
};
const field = "mt-2 w-full rounded-xl border border-border-standard bg-white px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/30";

/**
 * Édition des en-têtes de pages intérieures.
 *
 * Le texte est écrit dans le localStorage à chaque frappe (voir
 * `config/headers.ts`) : le site public se recompose immédiatement, sans
 * bouton « Enregistrer » à penser.
 */
function EntetesEditor() {
  const [page, setPage] = useState<PageHeaderKey>("vente");
  const entete = usePageHeader(page);

  return (
    <section className={card} aria-labelledby="entetes-heading">
      <h2 id="entetes-heading" className="text-lg font-bold text-text-primary">En-têtes des pages</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Surtitre, titre et chapeau de chaque page intérieure. Le texte est enregistré au fil de la frappe et suit la composition choisie.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Pages">
        {(Object.keys(pagesEntetes) as PageHeaderKey[]).map((cle) => (
          <button
            key={cle}
            type="button"
            role="tab"
            aria-selected={page === cle}
            onClick={() => setPage(cle)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              page === cle ? "border-brand-red bg-brand-light text-brand-red" : "border-border-light text-text-secondary hover:border-brand-red/50"
            }`}
          >
            {pagesEntetes[cle]}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-text-primary">
          Surtitre
          <input
            value={entete.surtitre}
            onChange={(event) => setPageHeader(page, { surtitre: event.target.value })}
            className={field}
            maxLength={40}
          />
        </label>
        <label className="block text-sm font-medium text-text-primary">
          Titre
          <input
            value={entete.titre}
            onChange={(event) => setPageHeader(page, { titre: event.target.value })}
            className={field}
            maxLength={90}
          />
        </label>
        <label className="block text-sm font-medium text-text-primary">
          Chapeau
          <textarea
            value={entete.chapeau}
            onChange={(event) => setPageHeader(page, { chapeau: event.target.value })}
            className={field}
            rows={3}
            maxLength={220}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => resetPageHeader(page)}
          className="rounded-xl border border-border-standard px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-brand-light"
        >
          Rétablir le texte d’origine
        </button>
        <span className="text-xs text-text-muted">Aperçu en direct sur le site public.</span>
      </div>
    </section>
  );
}

export default function AdminAppearance() {
  const [settings, setSettings] = useState<ThemeSettings>(getThemeSettings);
  const [statut, setStatut] = useState<"idle" | "dirty" | "saved" | "local">("idle");

  // Les réglages du site arrivent de l'API après le premier rendu : le
  // formulaire doit refléter la valeur serveur dès qu'elle est chargée.
  useEffect(() => {
    const maj = () => setSettings(getThemeSettings());
    window.addEventListener("autoprime:theme-updated", maj);
    return () => window.removeEventListener("autoprime:theme-updated", maj);
  }, []);

  const onCloseModalPreview = () => { /* aperçu hors connexion */ };

  /** Affiche la modale dans l'aperçu admin (hors connexion). */
  const previewModal = React.createElement(VehicleModal, { vehicule: VEHICULE_PREVIEW, onClose: onCloseModalPreview, integre: true });

  /**
   * Applique le choix immédiatement dans CE navigateur. On écrit aussi dans
   * le localStorage : c'est ce qui fait basculer la navbar, le footer et
   * l'accueil (qui lisent ce stockage), pas seulement les variables CSS.
   */
  function update<K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) {
    // On repart du stockage (et non du state) : les champs color/select
    // peuvent déclencher plusieurs changements avant le prochain rendu.
    const next = { ...getThemeSettings(), [key]: value };
    setSettings(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("autoprime:theme-updated"));
    } catch {
      // stockage indisponible : l'aperçu CSS reste appliqué
    }
    setStatut("dirty");
  }

  async function save() {
    try {
      const actuels = getThemeSettings();
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(actuels));
      window.dispatchEvent(new Event("autoprime:theme-updated"));
      const synchronise = await enregistrerParametreSite("theme", actuels);
      setStatut(synchronise ? "saved" : "local");
    } catch {
      setStatut("local");
    }
  }

  function reset() {
    localStorage.removeItem(THEME_STORAGE_KEY);
    void enregistrerParametreSite("theme", null);
    const defaults = getThemeSettings();
    setSettings(defaults);
    applyTheme(defaults);
    window.dispatchEvent(new Event("autoprime:theme-updated"));
    setStatut("idle");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-red">Personnalisation</p>
          <h1 className="mt-1 text-3xl font-bold text-text-primary">Apparence du site</h1>
          <p className="mt-2 max-w-2xl text-text-secondary">
            L'aperçu s'applique immédiatement dans votre navigateur. Enregistrez
            pour appliquer ces choix à tous les visiteurs du site.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border-standard bg-white px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-brand-light"
          >
            <span className="material-symbols-outlined text-[19px]" aria-hidden="true">open_in_new</span>
            Voir le site
          </Link>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-border-standard bg-white px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-brand-light"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={save}
            className="btn-premium rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            Enregistrer
          </button>
        </div>
      </header>

      {statut === "dirty" && (
        <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Modifications visibles dans votre navigateur. Cliquez sur « Enregistrer »
          pour les appliquer à tous les visiteurs.
        </p>
      )}
      {statut === "saved" && (
        <p role="status" className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          Apparence enregistrée pour tout le site.
        </p>
      )}
      {statut === "local" && (
        <p role="status" className="rounded-xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm font-medium text-brand-red">
          Le réglage est enregistré dans ce navigateur, mais l'API est injoignable :
          les visiteurs ne verront pas encore le changement.
        </p>
      )}

      <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3 text-sm text-text-secondary">
        Ces réglages modifient le <strong className="text-text-primary">site public</strong> : navbar, pied de page, accueil et fiches véhicules.
        La console d'administration garde sa propre structure. Enregistrez d'abord,
        puis ouvrez <strong className="text-text-primary">« Voir le site »</strong> : le site public
        recharge le thème enregistré côté serveur.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
        <div className="space-y-5">
          <section className={card} aria-labelledby="palette-heading">
            <h2 id="palette-heading" className="text-lg font-bold text-text-primary">Palette de couleurs</h2>
            <p className="mt-1 text-sm text-text-secondary">S’applique aux trois compositions : c’est la couleur de vos véhicules, pas leur mise en page.</p>
            <p className="mt-1 text-sm text-text-secondary">Choisissez une identité adaptée à votre concession.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(colorThemes).map(([key, palette]) => (
                <button key={key} type="button" onClick={() => update("color", key as ThemeSettings["color"])} aria-pressed={settings.color === key} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${settings.color === key ? "border-brand-red bg-brand-light" : "border-border-light hover:border-brand-red/50"}`}>
                  <span className="flex h-10 w-12 overflow-hidden rounded-lg" aria-hidden="true"><i className="flex-1" style={{ background: palette.primary }} /><i className="flex-1" style={{ background: palette.secondary }} /></span>
                  <span className="font-semibold text-text-primary">{colorLabels[key as keyof typeof colorThemes]}</span>
                  {settings.color === key && <span className="material-symbols-outlined ml-auto text-brand-red" aria-hidden="true">check_circle</span>}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm font-medium text-text-primary">Couleur principale personnalisée
              <input type="color" value={settings.customPrimary ?? colorThemes[settings.color].primary} onChange={(event) => update("customPrimary", event.target.value)} className="mt-2 block h-11 w-full cursor-pointer rounded-lg border border-border-light bg-white p-1" />
            </label>
          </section>

          <section className={card} aria-labelledby="type-heading">
            <h2 id="type-heading" className="text-lg font-bold text-text-primary">Typographie</h2>
            <p className="mt-1 text-sm text-text-secondary">Réglage du texte courant. La composition « Catalogue » impose sa propre police de titres.</p>
            <label className="mt-3 block text-sm font-medium text-text-primary">Style du texte
              <select value={settings.typography} onChange={(event) => update("typography", event.target.value as ThemeSettings["typography"])} className={field}>
                {Object.keys(typographyPresets).map((key) => <option key={key} value={key}>{typeLabels[key as keyof typeof typographyPresets]} — {typographyPresets[key as keyof typeof typographyPresets].heading} / {typographyPresets[key as keyof typeof typographyPresets].body}</option>)}
              </select>
            </label>
          </section>

          <section className={card} aria-labelledby="site-layout-heading">
            <h2 id="site-layout-heading" className="text-lg font-bold text-text-primary">Composition du site</h2>
            <p className="mt-1 text-sm text-text-secondary">Change la barre de navigation, le pied de page et la page d’accueil : trois identités visuelles complètes, pas trois variantes de couleur.</p>
            <div className="mt-4 space-y-3">
              {Object.entries(siteLayouts).map(([key, preset]) => <button key={key} type="button" onClick={() => update("siteLayout", key as SiteLayout)} aria-pressed={settings.siteLayout === key} className={`block w-full rounded-xl border p-4 text-left transition-colors ${settings.siteLayout === key ? "border-brand-red bg-brand-light" : "border-border-light hover:border-brand-red/50"}`}><span className="flex items-center justify-between font-semibold text-text-primary">{siteLayouts[key as SiteLayout].label}{settings.siteLayout === key && <span className="material-symbols-outlined text-brand-red" aria-hidden="true">check_circle</span>}</span><span className="mt-1 block text-sm text-text-secondary">{preset.description}</span></button>)}
            </div>
          </section>

          <EntetesEditor />

          <section className={card} aria-labelledby="navbar-heading">
            <h2 id="navbar-heading" className="text-lg font-bold text-text-primary">Barre de navigation</h2>
            <p className="mt-1 text-sm text-text-secondary">Choisissez le style de la barre de navigation (dépasse le choix de la composition du site).</p>
            <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Style de la navbar">
              {navbarOptions.map((option) => (
                <label key={option.key} className={`flex items-center gap-3 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${(settings.navbarStyle ?? "suivre") === option.key ? "border-brand-red bg-brand-light" : "border-border-light text-text-secondary hover:border-brand-red/50"}`}>
                  <input
                    type="radio"
                    name="navbar-style"
                    value={option.key}
                    checked={(settings.navbarStyle ?? "suivre") === option.key}
                    onChange={(event) => update("navbarStyle", event.target.value === "suivre" ? undefined : (event.target.value as ThemeSettings["navbarStyle"]))}
                    className="hidden"
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <span className="text-xs text-text-secondary">{option.description}</span>
                  </span>
                </label>
              ))}
              <div className="border-t pt-3 mt-3"></div>
            </div>
            <p className="mt-4 text-xs text-text-muted">L'option « Suivre la composition » laisse la navbar changer avec la composition du site ; les trois autres imposent un style fixe, interchangeable avec n'importe quelle composition.</p>
          </section>

          <section className={card} aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="text-lg font-bold text-text-primary">Pied de page</h2>
            <p className="mt-1 text-sm text-text-secondary">Choisissez le style du pied de page (dépasse le choix de la composition du site).</p>
            <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Style du pied de page">
              {footerOptions.map((option) => (
                <label key={option.key} className={`flex items-center gap-3 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${(settings.footerStyle ?? "suivre") === option.key ? "border-brand-red bg-brand-light" : "border-border-light text-text-secondary hover:border-brand-red/50"}`}>
                  <input
                    type="radio"
                    name="footer-style"
                    value={option.key}
                    checked={(settings.footerStyle ?? "suivre") === option.key}
                    onChange={(event) => update("footerStyle", event.target.value === "suivre" ? undefined : (event.target.value as ThemeSettings["footerStyle"]))}
                    className="hidden"
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <span className="text-xs text-text-secondary">{option.description}</span>
                  </span>
                </label>
              ))}
              <div className="border-t pt-3 mt-3"></div>
            </div>
            <p className="mt-4 text-xs text-text-muted">L'option « Suivre la composition » laisse le pied de page changer avec la composition du site ; les trois autres imposent un style fixe, interchangeable avec n'importe quelle composition.</p>
          </section>

          <section className={card} aria-labelledby="layout-heading">
            <h2 id="layout-heading" className="text-lg font-bold text-text-primary">Mise en page</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {Object.keys(layoutPresets).map((key) => <button type="button" key={key} onClick={() => update("layout", key as ThemeSettings["layout"])} aria-pressed={settings.layout === key} className={`rounded-xl border p-3 text-sm font-semibold ${settings.layout === key ? "border-brand-red bg-brand-light text-brand-red" : "border-border-light text-text-secondary hover:border-brand-red/50"}`}>{layoutLabels[key as keyof typeof layoutPresets]}</button>)}
            </div>
            <label className="mt-5 block text-sm font-medium text-text-primary">Forme des composants
              <select value={settings.radius} onChange={(event) => update("radius", event.target.value as ThemeSettings["radius"])} className={field}>
                <option value="rounded">Arrondie</option><option value="soft">Légèrement arrondie</option><option value="sharp">Angulaire</option>
              </select>
            </label>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section className={card} aria-live="polite">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-text-primary">Aperçu de la modale</h2><span className="text-xs text-text-muted">Temps réel</span></div>
            <div className="relative mt-3 h-[520px] overflow-hidden rounded-xl border border-border-light bg-white">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border-light bg-text-secondary/5 text-xs font-semibold text-text-secondary">
                <span>Aperçu — véhicule de démonstration</span>
                <span className="text-text-muted">
                  {settings.modalStyle === undefined
                    ? `Suit la composition « ${siteLayouts[settings.siteLayout].label} »`
                    : modalLabels[settings.modalStyle]}
                </span>
              </div>
              {previewModal}
            </div>
            <p className="mt-3 text-xs text-text-muted">Aperçu en direct de la modale de détail. Les volets ne peuvent pas être fermés dans cet aperçu.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
