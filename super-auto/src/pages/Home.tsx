import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useVehicules } from "@/hooks/useVehicules"
import { type Vehicule } from "@/types/vehicule"
import { useDomaines, useEngagements, useTemoignages } from "@/config/contenu"
import { useEntreprise } from "@/config/entreprise"
import ImageHero from "@/assets/voiture.jpg"
import VehicleCard from "@/components/VehicleCard"
import SectionTitle from "@/components/SectionTitle"
import Reveal from "@/components/Reveal"
import SectionChiffres from "@/components/SectionChiffres"
import VehicleModal from "@/components/VehicleModal"

const ongletsVedettes = ["Tous", "Vente", "Location"] as const
const marquesAffichees = ["Toyota", "Mercedes-Benz", "BMW", "Ford", "Hyundai", "Kia", "Nissan", "Volkswagen", "Audi", "Land Rover"]

export default function Home() {
  const entreprise = useEntreprise()
  const domaineListe = useDomaines()
  const engagements = useEngagements()
  const temoignages = useTemoignages()
  const [ongletActif, setOngletActif] = useState<(typeof ongletsVedettes)[number]>("Tous")
  const [vehiculeActif, setVehiculeActif] = useState<Vehicule | null>(null)

  const { vehicules } = useVehicules()

  const vedettes = useMemo(
    () => vehicules.filter((v) => (ongletActif === "Tous" ? true : v.service === ongletActif)),
    [vehicules, ongletActif]
  )

  return (
    <>
      <main>
        {/* ----------HERO PLEIN ÉCRAN (Composition Signature)----------- */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-surface">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${ImageHero})` }} aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-blue-dark/85 via-brand-blue/60 to-brand-blue-dark/90" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(196,30,58,0.35),transparent_55%)]" aria-hidden="true" />

          <div className="absolute top-1/4 left-8 w-24 h-24 rounded-full bg-brand-red/30 blur-2xl animate-float" aria-hidden="true" />
          <div className="absolute top-1/3 right-10 w-36 h-36 rounded-full bg-brand-blue/40 blur-3xl animate-float-slow" aria-hidden="true" />
          <div className="absolute bottom-44 left-1/4 w-16 h-16 rounded-full bg-white/10 blur-xl animate-float" style={{ animationDelay: "1.5s" }} aria-hidden="true" />

          <div className="container mx-auto px-4 relative z-20 text-center pt-24 pb-32">
            <span className="inline-flex items-center gap-2 glass-dark text-white text-xs md:text-sm font-semibold uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-6 animate-fade-up">
              <span className="relative flex w-2 h-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-brand-red" />
              </span>
              {entreprise.adresseVille}, {entreprise.adressePays} — depuis {entreprise.anciennete}
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
              Votre partenaire{" "}<span className="text-gradient-animated">automobile de confiance</span>
            </h1>

            <p className="text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "240ms" }}>
              Achat, vente, location et importation de véhicules — une expertise complète au service de votre projet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "360ms" }}>
              <a href="/services" className="btn-premium animate-pulse-glow text-white font-bold py-4 px-8 rounded-full">
                Découvrir nos services
              </a>
              <Link to="/vente" className="btn-ghost text-white font-bold py-4 px-8 rounded-full">
                Explorer nos véhicules
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 z-20 px-4 pb-8">
            <div className="max-w-5xl mx-auto glass-dark rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              {entreprise.statistiques.map((stat) => (
                <div key={stat.id} className="px-4 py-5 text-center">
                  <p className="text-2xl md:text-3xl font-extrabold text-white">{stat.chiffre}</p>
                  <p className="text-gray-300 text-xs md:text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
            <div className="relative animate-bounce-slow">
              <span className="absolute -inset-3.5 rounded-full border border-dashed border-white/50 animate-spin-slow" aria-hidden="true" />
              <a href="#services" aria-label="Défiler vers le contenu" className="relative flex w-11 h-11 rounded-full glass-dark items-center justify-center text-white hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-2xl">keyboard_arrow_down</span>
              </a>
            </div>
          </div>
        </section>

        {/* ---------BANDEAU DES MARQUES----------- */}
        <div className="bg-brand-blue-dark border-y border-white/10 py-5 overflow-hidden" aria-hidden="true">
          <div className="flex w-max items-center gap-12 whitespace-nowrap animate-marquee">
            {[...marquesAffichees, ...marquesAffichees].map((marque, index) => (
              <span key={`${marque}-${index}`} className="flex items-center gap-12 text-white/45 font-bold uppercase tracking-[0.3em] text-sm md:text-base">
                {marque}
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
              </span>
            ))}
          </div>
        </div>

        {/* ---------DOMAINES D'EXPERTISE----------- */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-brand-light" id="services">
          <Reveal>
            <SectionTitle kicker="Notre expertise" titre="Nos Domaines d'Expertise" sousTitre="Découvrez notre expertise dans différents domaines de l'industrie automobile." />
          </Reveal>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {domaineListe.map((domaine, index) => (
              <Reveal key={domaine.id} delay={index * 120}>
                <div className="group bg-white p-8 rounded-2xl shadow-card hover:shadow-premium hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center h-full border border-border-light">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-blue to-brand-blue-dark group-hover:from-brand-red group-hover:to-brand-red-dark rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-all duration-300 rotate-3 group-hover:rotate-0">
                    <span className="material-symbols-outlined text-white animate-bob" style={{ fontSize: "44px", animationDelay: `${index * 0.4}s` }}>{domaine.icone}</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">{domaine.titre}</h3>
                  <p className="text-text-secondary leading-relaxed flex-grow">{domaine.description}</p>
                  <Link to={domaine.lien} className="group/link text-brand-red hover:text-brand-red-dark font-semibold inline-flex items-center gap-2 mt-6 transition-colors">
                    En savoir plus
                    <span className="material-symbols-outlined text-lg transition-transform group-hover/link:translate-x-1">arrow_forward</span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------VÉHICULES EN VEDETTE----------- */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
          <Reveal>
            <SectionTitle kicker="Catalogue" titre="Véhicules en Vedette" sousTitre="Une sélection de nos véhicules disponibles à la vente et à la location." />
          </Reveal>

          <Reveal>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {ongletsVedettes.map((onglet) => (
                <button
                  key={onglet}
                  onClick={() => setOngletActif(onglet)}
                  aria-pressed={ongletActif === onglet}
                  className={`text-sm font-bold py-2.5 px-6 rounded-full transition-all duration-300 ${ongletActif === onglet ? "btn-premium text-white" : "bg-brand-surface text-text-secondary border border-border-standard hover:border-brand-red hover:text-brand-red"}`}
                >
                  {onglet}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vedettes.map((vehicule, index) => (
              <Reveal key={vehicule.id} delay={(index % 3) * 100}>
                <VehicleCard vehicule={vehicule} onVoirDetails={setVehiculeActif} />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/vente" className="btn-premium text-white font-bold py-3 px-8 rounded-full">
                Voir tous les véhicules à vendre
              </Link>
              <Link to="/location" className="border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-bold py-3 px-8 rounded-full transition-colors">
                Voir les véhicules en location
              </Link>
            </div>
          </Reveal>
        </section>

        {/* ---------POURQUOI NOUS CHOISIR----------- */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-brand-blue-dark to-[#0a1020] relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-red/15 rounded-full blur-3xl animate-float-slow" aria-hidden="true" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-blue/25 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} aria-hidden="true" />
          <div className="hidden lg:block absolute top-16 right-8 w-64 h-64 rounded-full border-2 border-dashed border-white/10 animate-spin-slow" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto">
            <Reveal>
              <SectionTitle sombre kicker="Nos engagements" titre="Pourquoi Nous Choisir" sousTitre={`Quatre raisons qui font la confiance de nos clients ${entreprise.anciennete}.`} />
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {engagements.map((valeur, index) => (
                <Reveal key={valeur.id} delay={index * 100}>
                  <div className="glass-dark rounded-2xl p-6 text-center h-full hover:bg-white/10 transition-colors duration-300">
                    <div className="w-14 h-14 mx-auto bg-brand-red/20 border border-brand-red/40 rounded-xl flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-brand-red animate-bob" style={{ fontSize: "30px", animationDelay: `${index * 0.45}s` }}>{valeur.icone}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{valeur.titre}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{valeur.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------CHIFFRES CLÉS----------- */}
        <SectionChiffres />

        {/* ---------TÉMOIGNAGES CLIENTS----------- */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-brand-light">
          <Reveal>
            <SectionTitle kicker="Ils nous font confiance" titre="Témoignages Clients" sousTitre="L'avis de nos clients est notre meilleure réputation." />
          </Reveal>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {temoignages.map((avis, index) => (
              <Reveal key={avis.id} delay={index * 120}>
                <figure className="bg-white rounded-2xl shadow-card hover:shadow-premium transition-all duration-300 p-7 h-full flex flex-col border border-border-light">
                  <div className="flex items-center gap-1 text-brand-red mb-4" aria-label="5 étoiles">
                    {[0, 1, 2, 3, 4].map((etoile) => (
                      <span key={etoile} className="material-symbols-outlined text-xl animate-twinkle" style={{ animationDelay: `${etoile * 0.25}s` }}>{"star"}</span>
                    ))}
                  </div>
                  <blockquote className="text-text-secondary leading-relaxed italic flex-grow">« {avis.message} »</blockquote>
                  <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-border-light">
                    <span className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-blue to-brand-red text-white font-bold flex items-center justify-center text-sm">{avis.initiales}</span>
                    <div>
                      <p className="font-bold text-text-primary text-sm">{avis.nom}</p>
                      <p className="text-text-muted text-xs">Client vérifié</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------BANNIÈRE CTA----------- */}
        <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-r from-brand-red via-brand-red-dark to-brand-red bg-[length:200%_200%] animate-gradient-xy">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.15),transparent_50%)]" aria-hidden="true" />
          <Reveal>
            <div className="max-w-3xl mx-auto text-center relative">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Prêt à trouver votre prochain véhicule ?</h2>
              <p className="text-white/90 text-lg mb-8">Notre équipe est à votre écoute pour concrétiser votre projet — achat, location ou importation.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="bg-white text-brand-red hover:bg-gray-100 font-bold py-4 px-8 rounded-full transition-colors">
                  Contacter un expert
                </Link>
                <Link to="/vente" className="btn-ghost text-white font-bold py-4 px-8 rounded-full">
                  Voir le catalogue
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {vehiculeActif && <VehicleModal vehicule={vehiculeActif} onClose={() => setVehiculeActif(null)} />}
    </>
  )
}