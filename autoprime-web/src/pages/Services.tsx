import { Link } from "react-router-dom"
import PageHeader from "@/components/PageHeader"
import { useEntreprise } from "@/config/entreprise"
import { useAdminServices } from "@/config/contenu"

export default function Services() {
    const services = useAdminServices()
    const entreprise = useEntreprise()

    return (
        <>
            {/* ----------En-tête (commun aux compositions)----------- */}
            <PageHeader page="services" />

            {/* ----------Grille des 6 Services----------- */}
            <section className="py-16 px-4 md:px-8 lg:px-16">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white rounded-2xl shadow-card hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col border border-border-light"
                        >
                            {/* En-tête coloré avec icône (balayage lumineux + icône flottante) */}
                            <div className={`${service.couleur} h-40 flex items-center justify-center card-shine`}>
                                <span
                                    className="material-symbols-outlined text-white animate-bob"
                                    style={{ fontSize: "64px" }}
                                >
                                    {service.icone}
                                </span>
                            </div>
                            {/* Contenu */}
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-800 mb-3">
                                    {service.titre}
                                </h3>
                                <p className="text-text-secondary leading-relaxed flex-grow">
                                    {service.description}
                                </p>
                                {service.hasLink && (
                                    <Link
                                        to={service.lien}
                                        className="text-brand-red hover:text-brand-red-dark font-semibold inline-flex items-center gap-2 mt-6 transition-colors"
                                    >
                                        En savoir plus
                                        <span className="material-symbols-outlined text-lg">
                                            arrow_forward
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ----------Statistiques----------- */}
            <section className="bg-brand-blue-dark py-16 px-4 relative overflow-hidden">
                {/* Formes flottantes + anneau rotatif (animations permanentes) */}
                <div className="absolute -top-16 -left-16 w-64 h-64 bg-brand-red/20 rounded-full blur-3xl animate-float" aria-hidden="true"></div>
                <div className="absolute -bottom-20 right-0 w-72 h-72 bg-brand-blue/30 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} aria-hidden="true"></div>
                <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-[6%] w-44 h-44 rounded-full border-2 border-dashed border-white/10 animate-spin-slow" aria-hidden="true"></div>
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative">
                    {entreprise.statistiques.map((stat) => (
                        <div key={stat.id}>
                            <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                                {stat.chiffre}
                            </p>
                            <p className="text-gray-300 text-sm md:text-base">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ----------Bannière CTA (dégradé animé en continu)----------- */}
            <section className="bg-gradient-to-r from-brand-blue via-brand-red-dark to-brand-blue-dark bg-[length:220%_220%] animate-gradient-xy py-16 px-4 text-center relative overflow-hidden">
                <div className="absolute -top-24 left-1/4 w-72 h-72 bg-brand-red/20 rounded-full blur-3xl animate-float" aria-hidden="true" />
                <div className="max-w-3xl mx-auto relative">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Besoin d'un service sur mesure ?
                    </h2>
                    <p className="text-gray-200 text-lg mb-8">
                        Notre équipe est à votre écoute pour répondre à tous vos besoins automobiles.
                    </p>
                    <Link
                        to="/contact"
                        className="btn-premium animate-pulse-glow text-white font-bold py-3.5 px-8 rounded-full inline-block"
                    >
                        Contacter un expert
                    </Link>
                </div>
            </section>
        </>
    )
}
