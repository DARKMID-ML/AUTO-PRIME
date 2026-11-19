#!/usr/bin/env node
/**
 * Recherche web via Exa — SDK officiel `exa-js`.
 *
 * Module + CLI pour l'agent et l'équipe : à partir d'une requête en langage
 * naturel, Exa renvoie les pages web les plus pertinentes avec des extraits
 * (`highlights`) directement exploitables.
 *
 * La clé se lit dans l'environnement (`EXA_API_KEY`), sinon dans `autoprime-web/.env`
 * (l'environnement reste prioritaire). Elle n'est jamais préfixée `VITE_` :
 * elle ne part donc jamais dans le bundle du navigateur.
 *
 * Usage :
 *   pnpm exa:search "prix d'une Toyota Corolla d'occasion à Bamako"
 *   pnpm exa:search -n 3 "import de véhicules d'occasion au Mali"
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Exa from 'exa-js';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const FICHIER_ENV = join(RACINE, '.env');
const NOMBRE_RESULTATS_DEFAUT = 5;

/** @typedef {{ titre: string, url: string, publieLe: string | null, highlights: string[] }} ResultatWeb */

/**
 * Charge `autoprime-web/.env` s'il existe, sans écraser les variables déjà
 * définies dans l'environnement.
 */
function chargerEnvLocal() {
  if (!existsSync(FICHIER_ENV)) return;

  let contenu;
  try {
    contenu = readFileSync(FICHIER_ENV, 'utf8');
  } catch {
    // `.env` illisible (droits restreints) : on garde l'environnement tel quel.
    return;
  }

  for (const ligne of contenu.split('\n')) {
    const trouve = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(ligne);
    if (!trouve || process.env[trouve[1]] !== undefined) continue;
    process.env[trouve[1]] = trouve[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

/**
 * Instancie le client Exa avec la clé `EXA_API_KEY`.
 *
 * @returns {Promise<Exa>}
 */
export async function clientExa() {
  chargerEnvLocal();

  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error(
      'EXA_API_KEY manquante : déclarez-la dans autoprime-web/.env (voir .env.example).',
    );
  }

  return new Exa(apiKey);
}

/**
 * Cherche des pages web pertinentes et renvoie leurs extraits.
 *
 * @param {string} requete Requête en langage naturel.
 * @param {{ nombreResultats?: number }} [options]
 * @returns {Promise<ResultatWeb[]>}
 */
export async function rechercheWeb(requete, { nombreResultats = NOMBRE_RESULTATS_DEFAUT } = {}) {
  const exa = await clientExa();

  // `type: "auto"` : Exa choisit la meilleure stratégie de recherche,
  // `highlights` : extraits ciblés de chaque page (pas la page entière).
  const reponse = await exa.search(requete, {
    type: 'auto',
    numResults: nombreResultats,
    contents: { highlights: true },
  });

  return (reponse.results ?? []).map((resultat) => ({
    titre: resultat.title ?? resultat.url,
    url: resultat.url,
    publieLe: resultat.publishedDate ?? null,
    highlights: resultat.highlights ?? [],
  }));
}

/**
 * Découpe les arguments de la CLI.
 *
 * @param {string[]} argv
 * @returns {{ requete: string, nombreResultats: number }}
 */
function lireArguments(argv) {
  let nombreResultats = NOMBRE_RESULTATS_DEFAUT;
  const mots = [];

  for (let i = 0; i < argv.length; i += 1) {
    const argument = argv[i];
    if (argument === '-n' || argument === '--results') {
      const valeur = Number.parseInt(argv[i + 1] ?? '', 10);
      if (Number.isFinite(valeur) && valeur > 0) nombreResultats = valeur;
      i += 1;
    } else {
      mots.push(argument);
    }
  }

  return { requete: mots.join(' ').trim(), nombreResultats };
}

/** Affiche les résultats dans le terminal (format lisible). */
function afficher(requete, resultats) {
  if (resultats.length === 0) {
    console.log(`Aucun résultat pour « ${requete} ».`);
    return;
  }

  console.log(`Exa — ${resultats.length} résultat(s) pour « ${requete} »\n`);
  for (const resultat of resultats) {
    console.log(`• ${resultat.titre}`);
    console.log(`  ${resultat.url}`);
    if (resultat.publieLe) console.log(`  publié le ${resultat.publieLe}`);
    for (const extrait of resultat.highlights) {
      console.log(`  « ${extrait.replace(/\s+/g, ' ').trim()} »`);
    }
    console.log('');
  }
}

async function main(argv) {
  const { requete, nombreResultats } = lireArguments(argv);
  if (!requete) {
    console.error('Usage : pnpm exa:search [-n N] "votre recherche"');
    process.exitCode = 1;
    return;
  }

  afficher(requete, await rechercheWeb(requete, { nombreResultats }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2)).catch((erreur) => {
    console.error(`Erreur Exa : ${erreur.message}`);
    process.exitCode = 1;
  });
}
