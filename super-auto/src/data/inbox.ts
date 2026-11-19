import type { DemandeDevis, MessageContact } from "@/types/admin";

// Données de démonstration pour l'espace admin.
// Elles seront remplacées par GET /api/contact et GET /api/transit/quote
// dès que l'API sera branchée (voir super-auto-api/GUIDE.md §6).

export const messagesInitiaux: MessageContact[] = [
  {
    id: 1,
    nom: "Amadou Diallo",
    email: "amadou.diallo@email.com",
    telephone: "+223 70 12 34 56",
    sujet: "Achat de véhicule",
    message:
      "Bonjour, je suis intéressé par la Toyota Land Cruiser 2023. Est-elle toujours disponible ? Je peux passer au showroom samedi.",
    statut: "new",
    createdAt: "2026-10-01T09:24:00",
  },
  {
    id: 2,
    nom: "Fatima Traoré",
    email: "fatima.traore@email.com",
    telephone: "+223 76 55 41 02",
    sujet: "Location de véhicule",
    message:
      "Je souhaite louer un SUV pour deux semaines en décembre. Quel est le tarif journalier et la caution demandée ?",
    statut: "new",
    createdAt: "2026-10-02T14:05:00",
  },
  {
    id: 3,
    nom: "Ibrahim Koné",
    email: "ibrahim.kone@email.com",
    sujet: "Service Transit",
    message:
      "Merci pour l'importation de mon BMW X5, tout est arrivé en parfait état. Je vous recommande sans hésiter !",
    statut: "read",
    createdAt: "2026-09-28T11:47:00",
  },
  {
    id: 4,
    nom: "Aïssata Coulibaly",
    email: "aissata.coulibaly@email.com",
    telephone: "+223 65 30 18 99",
    sujet: "Service après-vente",
    message:
      "J'ai fait réviser ma Hyundai Tucson chez vous la semaine dernière, tout fonctionne parfaitement. Merci au mécanicien.",
    statut: "archived",
    createdAt: "2026-09-20T16:32:00",
  },
  {
    id: 5,
    nom: "Moussa Diarra",
    email: "moussa.diarra@email.com",
    telephone: "+223 74 88 20 10",
    sujet: "Autre",
    message:
      "Avez-vous des pièces de rechange pour une Ford Ranger 2022 (kit de distribution) ? Disponible à Bamako ?",
    statut: "read",
    createdAt: "2026-09-30T08:15:00",
  },
];

export const devisInitiaux: DemandeDevis[] = [
  {
    id: 1,
    nom: "Sékou Camara",
    telephone: "+223 70 44 12 90",
    email: "sekou.camara@email.com",
    vehicule: "Toyota Land Cruiser 2023",
    pays: "france",
    message: "Livraison souhaitée avant fin novembre si possible.",
    statut: "new",
    createdAt: "2026-10-01T10:02:00",
  },
  {
    id: 2,
    nom: "Boubacar Sangaré",
    telephone: "+223 78 21 55 43",
    vehicule: "Mercedes GLE 450",
    pays: "usa",
    message: "",
    statut: "contacted",
    createdAt: "2026-09-27T15:40:00",
  },
  {
    id: 3,
    nom: "Djénéba Keïta",
    telephone: "+223 66 09 77 31",
    email: "djeneba.keita@email.com",
    vehicule: "Hyundai Tucson 2024",
    pays: "dubai",
    message: "Je peux fournir les références du véhicule sur demande.",
    statut: "new",
    createdAt: "2026-10-02T18:20:00",
  },
  {
    id: 4,
    nom: "Ousmane Berthé",
    telephone: "+223 72 33 60 18",
    vehicule: "Ford Ranger Wildtrak 2024",
    pays: "allemagne",
    statut: "archived",
    createdAt: "2026-09-15T12:11:00",
  },
];
