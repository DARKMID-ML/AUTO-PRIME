import { useState } from 'react';
import { mailtoHref, telHref } from '@/config/site';
import { adresseComplete, useEntreprise } from '@/config/entreprise';
import { apiSend } from '@/config/api';
import PageHeader from '@/components/PageHeader';

export default function Contact() {
    const entreprise = useEntreprise();
    // Envoi du message : formulaire maison branché sur POST /api/contact
    // (repli Formspree conservé dans SITE.formspreeContact pour le futur).
    const [envoi, setEnvoi] = useState<'repos' | 'enCours' | 'ok' | 'echec'>('repos');

    async function envoyer(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const request = {
            nom: String(data.get('nom') || '').trim(),
            email: String(data.get('email') || '').trim(),
            telephone: String(data.get('telephone') || '').trim(),
            sujet: String(data.get('sujet') || '').trim(),
            message: String(data.get('message') || '').trim(),
        };
        setEnvoi('enCours');
        const reponse = await apiSend('/api/contact', 'POST', request);
        if (reponse) {
            setEnvoi('ok');
            form.reset();
        } else {
            setEnvoi('echec');
        }
    }

    if (envoi === 'ok') {
        return (
            <>
                <PageHeader page="contact" />
                <section className="py-16 bg-brand-light">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="bg-green-50 border border-green-400 text-green-700 p-8 rounded-lg text-center max-w-lg mx-auto">
                            <span className="material-symbols-outlined text-4xl mb-2 animate-pulse">check_circle</span>
                            <p className="text-lg font-medium">
                                Message envoyé ! Merci de nous avoir contactés.
                                Nous vous répondrons dans les plus brefs délais.
                            </p>
                            <button
                                type="button"
                                onClick={() => setEnvoi('repos')}
                                className="mt-4 underline underline-offset-2 hover:text-green-900"
                            >
                                Envoyer un autre message
                            </button>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            {/* ============================== */}
            {/* BLOC A : EN-TÊTE                */}
            {/* ============================== */}
            <PageHeader page="contact" />

            {/* ============================== */}
            {/* BLOC B : CONTENU 2 COLONNES     */}
            {/* ============================== */}
            <section className="py-16 bg-brand-light relative overflow-hidden">
                {/* Formes flottantes (animations permanentes) */}
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-red/15 rounded-full blur-3xl animate-float" aria-hidden="true"></div>
                <div className="absolute -bottom-20 -left-16 w-72 h-72 bg-brand-blue/15 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} aria-hidden="true"></div>
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 relative">

                    {/* ============================== */}
                    {/* COLONNE GAUCHE : COORDONNÉES    */}
                    {/* ============================== */}
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary mb-6">
                            Nos Coordonnées
                        </h2>

                        {/* Adresse */}
                        <div className="flex items-start mb-6">
                            <span className="material-symbols-outlined text-brand-red mr-3 text-xl">
                                location_on
                            </span>
                            <div>
                                <h3 className="font-bold text-text-primary">Adresse</h3>
                                <p className="text-text-secondary">{adresseComplete(entreprise)}</p>
                            </div>
                        </div>

                        {/* Téléphone */}
                        <div className="flex items-start mb-6">
                            <span className="material-symbols-outlined text-brand-red mr-3 text-xl">
                                phone
                            </span>
                            <div>
                                <h3 className="font-bold text-text-primary">Téléphone</h3>
                                <p className="text-text-secondary">
                                    <a href={telHref(entreprise.telephoneFixe)} className="hover:text-brand-red transition-colors">
                                        {entreprise.telephoneFixe}
                                    </a>
                                </p>
                                <p className="text-text-secondary">
                                    <a href={telHref(entreprise.telephoneMobile)} className="hover:text-brand-red transition-colors">
                                        {entreprise.telephoneMobile}
                                    </a>
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start mb-6">
                            <span className="material-symbols-outlined text-brand-red mr-3 text-xl">
                                email
                            </span>
                            <div>
                                <h3 className="font-bold text-text-primary">Email</h3>
                                <a href={mailtoHref(entreprise.email)}
                                   className="text-brand-red hover:text-brand-red-dark transition-colors">
                                    {entreprise.email}
                                </a>
                            </div>
                        </div>

                        {/* Horaires */}
                        <div className="flex items-start mb-6">
                            <span className="material-symbols-outlined text-brand-red mr-3 text-xl">
                                schedule
                            </span>
                            <div>
                                <h3 className="font-bold text-text-primary">Horaires</h3>
                                {entreprise.horaires.map((horaire) => (
                                    <p key={horaire.jour} className="text-text-secondary">
                                        {horaire.jour} : {horaire.heures}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Carte : localisation avec icône qui rebondit doucement */}
                        <div className="bg-brand-surface border border-border-standard rounded-lg p-8 text-center mt-8 relative overflow-hidden card-shine">
                            <span className="material-symbols-outlined text-brand-red text-4xl mb-2 inline-block animate-bounce-slow">
                                map
                            </span>
                            <p className="text-text-secondary font-medium">
                                {entreprise.adresseVille}, {entreprise.adressePays}
                            </p>
                        </div>
                    </div>

                    {/* ============================== */}
                    {/* COLONNE DROITE : FORMULAIRE     */}
                    {/* ============================== */}
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary mb-6">
                            Envoyez-nous un message
                        </h2>

                        <form onSubmit={envoyer}>
                            {/* Champ Nom */}
                            <div className="mb-5">
                                <label htmlFor="nom" className="block text-sm font-medium text-text-primary mb-2">
                                    Nom complet *
                                </label>
                                <input
                                    id="nom"
                                    type="text"
                                    name="nom"
                                    required
                                    placeholder="Entrez votre nom complet"
                                    className="w-full border border-border-standard rounded p-3 
                                               focus:ring-2 focus:ring-brand-red focus:outline-none
                                               text-text-primary"
                                />
                                {/* Les champs requis valident côté navigateur; l'API confirme côté serveur. */}
                            </div>

                            {/* Champ Email */}
                            <div className="mb-5">
                                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                                    Email *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="exemple@email.com"
                                    className="w-full border border-border-standard rounded p-3 
                                               focus:ring-2 focus:ring-brand-red focus:outline-none
                                               text-text-primary"
                                />
{}
                            </div>

                            {/* Champ Téléphone */}
                            <div className="mb-5">
                                <label htmlFor="telephone" className="block text-sm font-medium text-text-primary mb-2">
                                    Téléphone
                                </label>
                                <input
                                    id="telephone"
                                    type="tel"
                                    name="telephone"
                                    placeholder="+223 XX XX XX XX"
                                    className="w-full border border-border-standard rounded p-3 
                                               focus:ring-2 focus:ring-brand-red focus:outline-none
                                               text-text-primary"
                                />
                            </div>

                            {/* Champ Sujet (select) */}
                            <div className="mb-5">
                                <label htmlFor="sujet" className="block text-sm font-medium text-text-primary mb-2">
                                    Sujet
                                </label>
                                <select
                                    id="sujet"
                                    name="sujet"
                                    className="w-full border border-border-standard rounded p-3 
                                               focus:ring-2 focus:ring-brand-red focus:outline-none
                                               text-text-primary bg-white"
                                >
                                    <option value="">Choisir un sujet</option>
                                    <option value="achat">Achat de véhicule</option>
                                    <option value="location">Location de véhicule</option>
                                    <option value="transit">Service Transit</option>
                                    <option value="apres-vente">Service après-vente</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>

                            {/* Champ Message (textarea) */}
                            <div className="mb-6">
                                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    required
                                    placeholder="Décrivez votre demande..."
                                    className="w-full border border-border-standard rounded p-3 
                                               focus:ring-2 focus:ring-brand-red focus:outline-none
                                               text-text-primary resize-vertical"
                                />
{}
                            </div>

                            {/* Bouton Envoyer */}
                            {envoi === 'echec' && (
                                <p className="mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded p-3">
                                    Impossible d'envoyer le message : serveur momentanément indisponible.
                                    Réessayez ou contactez-nous au {entreprise.telephoneFixe}.
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={envoi === 'enCours'}
                                className="btn-premium text-white font-bold py-3 px-8 rounded-full
                                           flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined">send</span>
                                {envoi === 'enCours' ? 'ENVOI EN COURS...' : 'ENVOYER'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    )
}