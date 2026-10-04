import type { Grille, TailleGrille } from './litto-bingo';

export type StatutArchive = 'complete' | 'abandonne';

export interface BingoArchive {
  id: string;
  statut: StatutArchive;
  taille: TailleGrille;
  genres: string[];
  casesCompletees: number;
  livresLus: string[];
  pagesTotales: number;
  dureeMs: number | null;
  casesRenouveleesUtilisees: number;
}

function calculerDuree(
  statut: StatutArchive,
  dateDebut: Date,
  dateFinArchivage: Date
): number | null {
  if (statut === 'abandonne') {
    return null;
  }
  return dateFinArchivage.getTime() - dateDebut.getTime();
}

export function archiverBingo(
  grille: Grille,
  statut: StatutArchive,
  dateDebut: Date,
  dateFinArchivage: Date
): BingoArchive {
  const genres = Array.from(new Set(grille.cases.map((c) => c.consigne.genre)));
  const casesCompletees = grille.cases.filter((c) => c.cochee).length;

  const livresLus = new Set<string>();
  let pagesTotales = 0;

  for (const c of grille.cases) {
    for (const entree of c.historique) {
      livresLus.add(entree.livre);
      if (entree.pages !== null) {
        pagesTotales += entree.pages;
      }
    }
  }

  return {
    id: crypto.randomUUID(),
    statut,
    taille: grille.taille,
    genres,
    casesCompletees,
    livresLus: Array.from(livresLus),
    pagesTotales,
    dureeMs: calculerDuree(statut, dateDebut, dateFinArchivage),
    casesRenouveleesUtilisees: grille.casesRenouveleesUtilisees,
  };
}