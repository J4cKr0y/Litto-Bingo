// src/features/litto-bingo/litto-bingo-livres.ts

import type { BingoArchive } from './litto-bingo-archive';

export interface LivreLu {
  /** Le titre tel que l'utilisateur l'a saisi. */
  titre: string;
  /** Dans combien de bingos archivés ce titre apparaît. */
  nombreBingos: number;
  /** Les autres titres qui ne diffèrent que par la casse, les espaces ou les accents. */
  similaires: string[];
}

/** Clé de comparaison d'un titre : sert à repérer les doublons probables, jamais à l'affichage. */
export function normaliserTitre(titre: string): string {
  return titre
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function listerLivresLus(archives: BingoArchive[], locale: string): LivreLu[] {
  const compteurs = new Map<string, number>();

  for (const archive of archives) {
    // Un titre répété dans un même bingo ne compte qu'une fois pour ce bingo.
    for (const titre of new Set(archive.livresLus)) {
      compteurs.set(titre, (compteurs.get(titre) ?? 0) + 1);
    }
  }

  const entrees = [...compteurs].map(([titre, nombreBingos]) => ({
    titre,
    nombreBingos,
    cle: normaliserTitre(titre),
  }));
  const comparateur = new Intl.Collator(locale, { sensitivity: 'base' });

  return entrees
    .map(({ titre, nombreBingos, cle }) => ({
      titre,
      nombreBingos,
      similaires: entrees
        .filter((autre) => autre.cle === cle && autre.titre !== titre)
        .map((autre) => autre.titre),
    }))
    .sort((a, b) => comparateur.compare(a.titre, b.titre));
}

export interface BingoAvecLivres {
  id: string;
  statut: BingoArchive['statut'];
  taille: number;
  /** Absente sur les archives créées avant l'ajout de ce champ. */
  dateArchivage: string | undefined;
  /** Les livres du bingo, dans l'ordre où l'archive les a enregistrés. */
  livres: string[];
}

/** Instant d'archivage ; une date absente (archive ancienne) vaut −∞ : elle se range avant toutes les autres. */
function instantArchivage(dateArchivage: string | undefined): number {
  return dateArchivage ? new Date(dateArchivage).getTime() : Number.NEGATIVE_INFINITY;
}

export function regrouperLivresParBingo(archives: BingoArchive[]): BingoAvecLivres[] {
  return archives
    .map((archive) => ({
      id: archive.id,
      statut: archive.statut,
      taille: archive.taille,
      dateArchivage: archive.dateArchivage,
      livres: [...archive.livresLus],
    }))
    .sort((a, b) => {
      const ecart = instantArchivage(a.dateArchivage) - instantArchivage(b.dateArchivage);
      return Number.isNaN(ecart) ? 0 : ecart;
    });
}