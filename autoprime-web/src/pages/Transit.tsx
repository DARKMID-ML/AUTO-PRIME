import { useState } from "react"
import { Link } from "react-router-dom"
import ImageHero from "../assets/voiture.jpg"
import { useEntreprise } from "@/config/entreprise"
import { apiSend } from "@/config/api"
import PageHeader from "@/components/PageHeader"
import Faq from "@/components/Faq"

// Les 5 étapes du processus d'importation
const etapes = [
    {
        id: 1,
        titre: "Demande de devis",
        icone: "description",
        description: "Vous nous indiquez le véhicule recherché et votre budget.",
    },
    {
        id: 2,
        titre: "Sélection du véhicule",
        icone: "search",
        description: "Nous trouvons le meilleur véhicule en Europe, USA ou Dubaï.",
    },
    {
        id: 3,
        titre: "Achat et formalités",
        icone: "payments",
        description: "Nous achetons le véhicule et gérons toutes les formalités.",
    },
    {
        id: 4,
        titre: "Transport maritime",
        icone: "sailing",
        description: "Votre véhicule est expédié par voie maritime jusqu'au Mali.",
    },
    {
        id: 5,
        titre: "Livraison à Bamako",
        icone: "done_all",
        description: "Dédouanement effectué et livraison de votre véhicule à Bamako.",
    },
]

// Les 3 avantages du service transit
const avantages = [
    {
        id: 1,
        titre: "Transparence",
        icone: "visibility",
        description: "Un devis clair, sans frais cachés, communiqué dès le départ.",
    },
    {
        id: 2,
        titre: "Sécurité",
        icone: "verified_user",
        description: "Votre véhicule est assuré et suivi pendant tout le transport.",
    },
    {
        id: 3,
        titre: "Délai rapide",
        icone: "schedule",
        description: "Une livraison en moyenne en 6 à 8 semaines après l'achat.",
    },
]

export default function Transit() {
    const entreprise = useEntreprise()
    // Envoi de la demande de devis : POST /api/devis-transit
    // 'repos' → formulaire ; 'enCours' → attente ; 'ok' → confirmation ; 'echec' → erreur
    const [envoi, setEnvoi] = useState<'repos' | 'enCours' | 'ok' | 'echec'>('repos')

    async function envoyerDemande(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = event.currentTarget
        const data = new FormData(form)
        const request = {
            nom: String(data.get('nom') || '').trim(),
            telephone: String(data.get('telephone') || '').trim(),
            email: String(data.get('email') || '').trim(),
            vehicule: String(data.get('vehicule') || '').trim(),
            pays: String(data.get('pays') || 'autre').trim(),
            message: String(data.get('message') || '').trim(),
        }
        setEnvoi('enCours')
        const reponse = await apiSend('/api/devis-transit', 'POST', request)
        if (reponse) {
            setEnvoi('ok')
            form.reset()
        } else {
            setEnvoi('echec')
        }
    }

    return (
        <>
            {/* ============================== */}
            {/* EN-TÊTE (commun aux compositions) */}
            {/* ============================== */}
            <PageHeader
                page="transit"
                image={ImageHero}
                action={{ label: "Commencer l'importation", href: "#devis" }}
            />

            {/* ============================== */}
            {/* PROCESSUS D'IMPORTATION (5 étapes) */}
            {/* ============================== */}
            <section className="py-16 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Comment ça marche ?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            5 étapes simples pour importer votre véhicule depuis l'étranger jusqu'au Mali.
                        </p>
                    </div>

                    <div className="relative grid grid-cols-1 md:grid-cols-5 gap-8">
                        {/* Ligne de connexion entre les étapes (desktop, pointillés qui défilent) */}
                        <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 z-0 ligne-fluide" aria-hidden="true"></div>

                        {etapes.map((etape, index) => (
                            <div
                                key={etape.id}
                                className="group relative z-10 flex flex-col items-center text-center"
                            >
                                {/* Grand cercle avec icône (balancement permanent décalé) + cercle numéroté */}
                                <div className="relative mb-4 animate-bob" style={{ animationDelay: `${index * 0.6}s` }}>
                                    <div className="w-20 h-20 rounded-full bg-brand-blue-dark flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <span
                                            className="material-symbols-outlined text-white transition-transform group-hover:scale-110"
                                            style={{ fontSize: "36px" }}
                                        >
                                            {etape.icone}
                                        </span>
                                    </div>
                                    <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand-red text-white text-sm font-bold flex items-center justify-center border-2 border-white animate-pulse-glow">
                                        {etape.id}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-text-primary mb-2">
                                    {etape.titre}
                                </h3>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {etape.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================== */}
            {/* FAQ — QUESTIONS FRÉQUENTES       */}
            {/* ============================== */}
            <Faq />

            {/* ============================== */}
            {/* FORMULAIRE DE DEMANDE DE DEVIS  */}
            {/* ============================== */}
            <section className="py-16 px-4 md:px-8 bg-brand-light" id="devis">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* ----------COLONNE GAUCHE : INFORMATIONS----------- */}
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary mb-4">
                            Demander un Devis Personnalisé
                        </h2>
                        <p className="text-text-secondary leading-relaxed mb-6">
                            Expliquez-nous le véhicule que vous souhaitez importer : notre équipe
                            établit un devis détaillé sous 24 heures, sans engagement.
                        </p>

                        <img
                            src={ImageHero}
                            alt={`Équipe ${entreprise.nom} à votre service`}
                            className="w-full h-56 object-cover rounded-lg shadow-card mb-6"
                        />

                        {/* Avantages */}
                        <div className="space-y-4">
                            {avantages.map((avantage, index) => (
                                <div key={avantage.id} className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-white animate-bob" style={{ animationDelay: `${index * 0.5}s` }}>
                                            {avantage.icone}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-primary">{avantage.titre}</h3>
                                        <p className="text-sm text-text-secondary">{avantage.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ----------COLONNE DROITE : FORMULAIRE----------- */}
                    <div className="bg-white rounded-lg shadow-card p-6 md:p-8">
                        {envoi === 'ok' ? (
                            <div className="bg-green-50 border border-green-400 text-green-700 p-8 rounded-lg text-center">
                                <span className="material-symbols-outlined text-5xl mb-2 animate-pulse">check_circle</span>
                                <p className="text-lg font-medium">
                                    Demande envoyée ! Notre équipe vous contactera sous 24 heures.
                                </p>
                                <button
                                    onClick={() => setEnvoi('repos')}
                                    className="mt-4 text-brand-red hover:text-brand-red-dark font-semibold underline"
                                >
                                    Envoyer une autre demande
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={envoyerDemande}
                            >
                                {/* Nom Complet */}
                                <div className="mb-5">
                                    <label htmlFor="devis-nom" className="block text-sm font-medium text-text-primary mb-2">
                                        Nom Complet *
                                    </label>
                                    <input
                                        id="devis-nom"
                                        type="text"
                                        name="nom"
                                        required
                                        placeholder="Entrez votre nom complet"
                                        className="w-full border border-border-standard rounded p-3 focus:ring-2 focus:ring-brand-red focus:outline-none text-text-primary"
                                    />
                                </div>

                                {/* Téléphone */}
                                <div className="mb-5">
                                    <label htmlFor="devis-telephone" className="block text-sm font-medium text-text-primary mb-2">
                                        Téléphone *
                                    </label>
                                    <input
                                        id="devis-telephone"
                                        type="tel"
                                        name="telephone"
                                        required
                                        placeholder="+223 XX XX XX XX"
                                        className="w-full border border-border-standard rounded p-3 focus:ring-2 focus:ring-brand-red focus:outline-none text-text-primary"
                                    />
                                </div>

                                {/* Email */}
                                <div className="mb-5">
                                    <label htmlFor="devis-email" className="block text-sm font-medium text-text-primary mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="devis-email"
                                        type="email"
                                        name="email"
                                        placeholder="exemple@email.com"
                                        className="w-full border border-border-standard rounded p-3 focus:ring-2 focus:ring-brand-red focus:outline-none text-text-primary"
                                    />
                                </div>

                                {/* Type de véhicule */}
                                <div className="mb-5">
                                    <label htmlFor="devis-vehicule" className="block text-sm font-medium text-text-primary mb-2">
                                        Type de Véhicule *
                                    </label>
                                    <input
                                        id="devis-vehicule"
                                        type="text"
                                        name="vehicule"
                                        required
                                        placeholder='ex: "Toyota Land Cruiser 2023"'
                                        className="w-full border border-border-standard rounded p-3 focus:ring-2 focus:ring-brand-red focus:outline-none text-text-primary"
                                    />
                                </div>

                                {/* Pays d'origine */}
                                <div className="mb-5">
                                    <label htmlFor="devis-pays" className="block text-sm font-medium text-text-primary mb-2">
                                        Pays d'Origine
                                    </label>
                                    <select
                                        id="devis-pays"
                                        name="pays"
                                        className="w-full border border-border-standard rounded p-3 focus:ring-2 focus:ring-brand-red focus:outline-none text-text-primary bg-white"
                                    >
                                        <option value="france">France</option>
                                        <option value="usa">USA</option>
                                        <option value="dubai">Dubaï</option>
                                        <option value="allemagne">Allemagne</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>

                                {/* Message */}
                                <div className="mb-6">
                                    <label htmlFor="devis-message" className="block text-sm font-medium text-text-primary mb-2">
                                        Message / Commentaires
                                    </label>
                                    <textarea
                                        id="devis-message"
                                        name="message"
                                        rows={4}
                                        placeholder="Précisez votre budget, vos critères..."
                                        className="w-full border border-border-standard rounded p-3 focus:ring-2 focus:ring-brand-red focus:outline-none text-text-primary resize-vertical"
                                    />
                                </div>

                                {/* Bouton d'envoi */}
                                {envoi === 'echec' && (
                                    <p className="mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded p-3">
                                        Impossible d'envoyer la demande : serveur momentanément indisponible.
                                        Réessayez ou appelez-nous au {entreprise.telephoneFixe}.
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={envoi === 'enCours'}
                                    className="btn-premium text-white font-bold py-3 px-8 rounded-full inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined">send</span>
                                    {envoi === 'enCours' ? 'ENVOI EN COURS...' : 'DEMANDER UN DEVIS'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* ============================== */}
            {/* BANNIÈRE CTA (dégradé animé en continu) */}
            {/* ============================== */}
            <section className="bg-gradient-to-r from-brand-blue via-brand-red-dark to-brand-blue-dark bg-[length:220%_220%] animate-gradient-xy py-16 px-4 text-center relative overflow-hidden">
                <div className="absolute -top-24 left-1/4 w-72 h-72 bg-brand-red/20 rounded-full blur-3xl animate-float" aria-hidden="true" />
                <div className="max-w-3xl mx-auto relative">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                        Une question sur l'importation ?
                    </h2>
                    <p className="text-gray-200 text-lg mb-8">
                        Nos experts transit vous accompagnent à chaque étape, de la recherche à la livraison.
                    </p>
                    <Link
                        to="/contact"
                        className="btn-premium text-white font-bold py-3.5 px-8 rounded-full inline-block"
                    >
                        Contacter un expert
                    </Link>
                </div>
            </section>
        </>
    )
}





