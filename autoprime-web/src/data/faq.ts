/**
 * Questions fréquentes de l'importation — affichées sur la page Transit.
 * Textes de démonstration : l'administrateur peut les personnaliser
 * (mises à jour prévues via Admin → Contenu).
 */
export interface QuestionReponse {
  id: number
  question: string
  reponse: string
}

export const faqImportation: QuestionReponse[] = [
  {
    id: 1,
    question: "Quels sont les délais d'une importation ?",
    reponse:
      "Comptez 4 à 8 semaines selon le pays d'origine et les bartiments maritimes. Les départs sont hebdomadaires depuis l'Europe et bimensuels depuis Dubaï et les USA. Nous vous précisons le planning avec le devis.",
  },
  {
    id: 2,
    question: "Quels documents dois-je fournir ?",
    reponse:
      "Aucun document compliqué de votre côté : une pièce d'identité et le choix du véhicule suffisent. Nous nous chargeons de la facture d'achat, du passeport du véhicule, du certificat de cession et des formalités douanières.",
  },
  {
    id: 3,
    question: "Comment se passent les paiements ?",
    reponse:
      "Un acompte de 30 % à 50 % sécurise la commande ; le solde est réglé à l'arrivée du véhicule, après contrôle. Virement bancaire, mobile money ou dépôt en agence : vous choisissez.",
  },
  {
    id: 4,
    question: "Puis-je suivre mon véhicule pendant le transport ?",
    reponse:
      "Oui. Vous recevez un numéro de suivi à la prise en charge, des photos à chaque étape (achat, port d'embarquement, transit) et une confirmation dès l'arrivée au port de Bamako.",
  },
  {
    id: 5,
    question: "Que comprend le prix du devis ?",
    reponse:
      "Tout : le véhicule, le fret maritime, les taxes et dédouanement, la logistique jusqu'à notre agence et les papiers. Le montant que vous signez est le montant que vous payez — pas de frais cachés.",
  },
  {
    id: 6,
    question: "Les véhicules sont-ils inspectés avant l'achat ?",
    reponse:
      "Chaque véhicule passe une inspection complète (moteur, carrosserie, kilométrage vérifié, historique) par notre agent sur place. Si un défaut nous échappe, il est corrigé avant la livraison.",
  },
]
