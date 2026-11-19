import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ImageHero from "@/assets/voiture.jpg";
import { useVehicules } from "@/hooks/useVehicules";
import { type Vehicule } from "@/types/vehicule";
import { useDomaines, useEngagements, useTemoignages } from "@/config/contenu";
import { useEntreprise } from "@/config/entreprise";
import { usePages } from "@/config/pages";
import VehicleModal from "@/components/VehicleModal";
import SectionChiffres from "@/components/SectionChiffres";

type Onglet = "Tous" | "Vente" | "Location";

const kicker = "text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red";
const filet = "border-[color:var(--at-line)]";

/**
 * Composition « Atelier » — concession technique.
 *
 * Navigation en haut (comme tout le monde), hero coupé, services en cartes,
 * parc en fiches horizontales et témoignages en cartes. L'identité Atelier
 * passe par la matière et la typographie, pas par un parcours exotique.
 */
export default function HomeAtelier() {
  const entreprise = useEntreprise();
  const pages = usePages();
  const domaines = useDomaines();
  const engagements = useEngagements();
  const temoignages = useTemoignages();
  const { vehicules } = useVehicules();

  const [onglet, setOnglet] = useState<Onglet>("Tous");
  const [vehiculeActif, setVehiculeActif] = useState<Vehicule | null>(null);

  const catalogueActif = pages.vente || pages.location;
  const onglets: Onglet[] = [
    "Tous",
    ...(pages.vente ? (["Vente"] as Onglet[]) : []),
    ...(pages.location ? (["Location"] as Onglet[]) : []),
  ];
  const ongletEffectif = onglets.includes(onglet) ? onglet : "Tous";

  const vedettes = useMemo(
    () =>
      vehicules
        .filter((v) => ongletEffectif === "Tous" || v.service === ongletEffectif)
        .slice(0, 6),
    [vehicules, ongletEffectif],
  );

  return (
    <>
      <main>
        {/* ── Hero coupé ─────────────────────────────────────────────── */}
        <section className="site-nav-offset border-b-2 border-[color:var(--at-ink)]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center border-b-2 border-[color:var(--at-ink)] px-5 py-14 md:px-10 lg:border-b-0 lg:border-r-2 lg:py-20">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand-red" aria-hidden="true" />
                <p className={kicker}>Concession & atelier — {entreprise.adresseVille}</p>
              </div>

              <h1 className="mt-5 max-w-2xl font-heading text-5xl font-extrabold leading-[0.92] tracking-[-0.035em] text-text-primary md:text-6xl xl:text-7xl">
                La mécanique
                <br />
                du choix.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-text-secondary">
                Des véhicules sélectionnés, un atelier qui les connaît, et un
                interlocuteur unique du premier essai à la livraison.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {catalogueActif && (
                  <Link
                    to={pages.vente ? "/vente" : "/location"}
                    className="inline-flex items-center justify-center gap-2 bg-brand-red px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
                  >
                    Voir le catalogue
                    <span className="material-symbols-outlined text-[17px]" aria-hidden="true">arrow_forward</span>
                  </Link>
                )}
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 border-2 border-[color:var(--at-ink)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-text-primary transition-colors hover:bg-[color:var(--at-ink)] hover:text-[color:var(--at-paper)]"
                >
                  Prendre rendez-vous
                </Link>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-4 border-t-2 border-[color:var(--at-line)] pt-5 text-[11px] uppercase tracking-[0.1em] text-text-secondary">
                <div>
                  <dt className="text-text-muted">Expérience</dt>
                  <dd className="mt-1 font-heading text-2xl font-extrabold text-text-primary">{entreprise.anciennete}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Véhicules</dt>
                  <dd className="mt-1 font-heading text-2xl font-extrabold text-text-primary">{vehicules.length}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Ville</dt>
                  <dd className="mt-1 font-heading text-2xl font-extrabold text-text-primary">{entreprise.adresseVille}</dd>
                </div>
              </dl>
            </div>

            <div className="relative min-h-[420px] overflow-hidden lg:min-h-full">
              <img src={ImageHero} alt="" className="h-full w-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(23,26,28,.9) 0%, rgba(23,26,28,.1) 55%, transparent 100%)" }}
                aria-hidden="true"
              />
              <div className="absolute inset-x-5 bottom-5 border border-white/25 p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">Fiche atelier</p>
                <p className="mt-1 font-heading text-xl font-extrabold md:text-2xl">
                  Vente · Location · Transit
                </p>
                <p className="mt-1 text-sm text-white/65">
                  Un seul interlocuteur, du choix à la livraison.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Établis / services en cartes ──────────────────────────── */}
        {pages.services && domaines.length > 0 && (
          <section className={`border-b-2 ${filet} px-5 py-16 md:px-10`}>
            <div className="mx-auto max-w-[86rem]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className={kicker}>Nos établis</p>
                  <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.025em] text-text-primary md:text-4xl">
                    Ce qu'on sait faire
                  </h2>
                </div>
                <Link to="/services" className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red hover:underline">
                  Tous les services
                </Link>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {domaines.map((domaine) => (
                  <Link
                    key={domaine.id}
                    to={domaine.lien}
                    className={`group flex h-full flex-col border ${filet} bg-white p-6 transition-colors hover:border-brand-red`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center border border-[color:var(--at-line)] bg-[color:var(--at-paper)] text-brand-red" aria-hidden="true">
                      <span className="material-symbols-outlined text-[23px]">{domaine.icone}</span>
                    </span>
                    <h3 className="mt-4 font-heading text-xl font-bold text-text-primary group-hover:text-brand-red">
                      {domaine.titre}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-text-secondary">{domaine.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-red">
                      En savoir plus
                      <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Parc en fiches horizontales ────────────────────────────────────── */}
        {catalogueActif && (
          <section className="border-b-2 border-[color:var(--at-line)] bg-[color:var(--at-paper)] px-5 py-16 md:px-10">
            <div className="mx-auto max-w-[86rem]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className={kicker}>Parc disponible</p>
                  <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.025em] text-text-primary md:text-4xl">
                    Sur le parc
                  </h2>
                </div>

                <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Type de véhicule">
                  {onglets.map((valeur) => (
                    <button
                      key={valeur}
                      type="button"
                      role="tab"
                      aria-selected={ongletEffectif === valeur}
                      onClick={() => setOnglet(valeur)}
                      className={`border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
                        ongletEffectif === valeur
                          ? "border-[color:var(--at-ink)] bg-[color:var(--at-ink)] text-[color:var(--at-paper)]"
                          : "border-[color:var(--at-line)] bg-white text-text-secondary hover:border-brand-red hover:text-brand-red"
                      }`}
                    >
                      {valeur}
                    </button>
                  ))}
                </div>
              </div>

              {vedettes.length === 0 ? (
                <p className={`mt-8 border border-dashed ${filet} bg-white p-8 text-center text-sm text-text-secondary`}>
                  Aucun véhicule dans cette catégorie pour le moment.
                </p>
              ) : (
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {vedettes.map((vehicule) => (
                    <article
                      key={vehicule.id}
                      className={`group grid grid-cols-[120px_1fr] border ${filet} bg-white sm:grid-cols-[180px_1fr]`}
                    >
                      <img
                        src={vehicule.image}
                        alt={`${vehicule.marque} ${vehicule.model}`}
                        className="h-full min-h-[160px] w-full object-cover"
                        loading="lazy"
                      />
                      <div className="flex flex-col p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">
                          {vehicule.service} · {vehicule.annee}
                        </p>
                        <h3 className="mt-1 font-heading text-xl font-bold leading-tight text-text-primary group-hover:text-brand-red">
                          {vehicule.marque} {vehicule.model}
                        </h3>
                        <p className="mt-1 text-xs text-text-secondary">
                          {vehicule.carburant} · {vehicule.transmission} · {vehicule.places}
                        </p>

                        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                          <p className="font-heading text-lg font-extrabold text-text-primary">{vehicule.prix}</p>
                          <button
                            type="button"
                            onClick={() => setVehiculeActif(vehicule)}
                            className="inline-flex items-center gap-1 bg-[color:var(--at-ink)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--at-paper)] transition-colors hover:bg-brand-red"
                          >
                            Voir la fiche
                            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">arrow_outward</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-2">
                {pages.vente && (
                  <Link to="/vente" className="bg-brand-red px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:opacity-90">
                    Tous les véhicules à vendre
                  </Link>
                )}
                {pages.location && (
                  <Link to="/location" className="border-2 border-[color:var(--at-ink)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-text-primary hover:bg-[color:var(--at-ink)] hover:text-[color:var(--at-paper)]">
                    La flotte de location
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Méthode en registre ────────────────────────────────────── */}
        <section className="border-b-2 border-[color:var(--at-line)] bg-white px-5 py-16 md:px-10">
          <div className="mx-auto grid max-w-[86rem] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className={kicker}>La méthode atelier</p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.025em] text-text-primary md:text-4xl">
                On regarde sous le capot.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
                Pas de mauvaise surprise : chaque véhicule est contrôlé, chaque
                dossier suivi, chaque promesse tenue.
              </p>
            </div>

            <div>
              {engagements.map((valeur) => (
                <div key={valeur.id} className={`grid grid-cols-[40px_1fr] gap-4 border-t ${filet} py-5`}>
                  <span className="material-symbols-outlined text-[24px] text-brand-red" aria-hidden="true">{valeur.icone}</span>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-text-primary">{valeur.titre}</h3>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">{valeur.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionChiffres />

        {/* ── Témoignages en cartes ──────────────────────────────────── */}
        <section className={`border-b-2 ${filet} px-5 py-16 md:px-10`}>
          <div className="mx-auto max-w-[86rem]">
            <div className="max-w-2xl">
              <p className={kicker}>Carnet de route</p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.025em] text-text-primary md:text-4xl">
                Ils sont repartis avec.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {temoignages.map((avis) => (
                <figure key={avis.id} className={`flex h-full flex-col border-l-4 border-brand-red border-y border-r ${filet} bg-white p-6`}>
                  <blockquote className="flex-1 text-sm leading-6 text-text-secondary">
                    « {avis.message} »
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-[color:var(--at-line)] pt-4">
                    <span className="flex h-10 w-10 items-center justify-center bg-[color:var(--at-ink)] text-[11px] font-bold text-[color:var(--at-paper)]" aria-hidden="true">
                      {avis.initiales}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{avis.nom}</p>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-text-muted">Client vérifié</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <section className="bg-[color:var(--at-ink)] px-5 py-14 text-[color:var(--at-paper)] md:px-10">
          <div className="mx-auto flex max-w-[86rem] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red">Prochaine étape</p>
              <h2 className="mt-2 max-w-2xl font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.025em] md:text-5xl">
                Venez voir. On vous attend à l'atelier.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                Un essai, une estimation, une question sur un import : appelez ou
                passez, on s'occupe du reste.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/contact" className="bg-brand-red px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:opacity-90">
                Nous contacter
              </Link>
              {pages.services && (
                <Link to="/services" className="border border-white/25 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 hover:border-white hover:text-white">
                  Nos services
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {vehiculeActif && (
        <VehicleModal vehicule={vehiculeActif} onClose={() => setVehiculeActif(null)} />
      )}
    </>
  );
}
