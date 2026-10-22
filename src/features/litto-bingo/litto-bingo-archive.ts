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
  dateArchivage: string; 
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
  dateFinArchivage: Date,
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
	dateArchivage: dateFinArchivage.toISOString(),
  };
}

export interface Statistiques {
  totalBingosCompletes: number;
  totalBingosAbandonnes: number;
  totalCasesCompletees: number;
  totalLivresDistincts: number;
  totalPagesLues: number;
  totalCasesRenouvelees: number;
  dureeMoyenneMs: number | null;
  genreLePlusRapide: string | null;
  genreLePlusLent: string | null;
}

function calculerMoyennesParGenre(archives: BingoArchive[]): Map<string, number> {
  const sommesParGenre = new Map<string, { total: number; count: number }>();

  for (const archive of archives) {
    if (archive.dureeMs === null) continue;

    for (const genre of archive.genres) {
      const actuel = sommesParGenre.get(genre) ?? { total: 0, count: 0 };
      sommesParGenre.set(genre, {
        total: actuel.total + archive.dureeMs,
        count: actuel.count + 1,
      });
    }
  }

  const moyennes = new Map<string, number>();
  for (const [genre, { total, count }] of sommesParGenre) {
    moyennes.set(genre, total / count);
  }
  return moyennes;
}

export function calculerStatistiques(archives: BingoArchive[]): Statistiques {
  const totalBingosCompletes = archives.filter((a) => a.statut === 'complete').length;
  const totalBingosAbandonnes = archives.filter((a) => a.statut === 'abandonne').length;

  const dureesCompletes = archives
    .filter((a) => a.dureeMs !== null)
    .map((a) => a.dureeMs as number);

  const dureeMoyenneMs =
    dureesCompletes.length > 0
      ? dureesCompletes.reduce((somme, d) => somme + d, 0) / dureesCompletes.length
      : null;

  const moyennesParGenre = calculerMoyennesParGenre(archives);
  let genreLePlusRapide: string | null = null;
  let genreLePlusLent: string | null = null;

  for (const [genre, moyenne] of moyennesParGenre) {
    if (genreLePlusRapide === null || moyenne < moyennesParGenre.get(genreLePlusRapide)!) {
      genreLePlusRapide = genre;
    }
    if (genreLePlusLent === null || moyenne > moyennesParGenre.get(genreLePlusLent)!) {
      genreLePlusLent = genre;
    }
  }

  const livresDistincts = new Set<string>();
  let totalCasesCompletees = 0;
  let totalPagesLues = 0;
  let totalCasesRenouvelees = 0;

  for (const archive of archives) {
    totalCasesCompletees += archive.casesCompletees;
    totalPagesLues += archive.pagesTotales;
    totalCasesRenouvelees += archive.casesRenouveleesUtilisees;
    for (const livre of archive.livresLus) {
      livresDistincts.add(livre);
    }
  }

  return {
    totalBingosCompletes,
    totalBingosAbandonnes,
    totalCasesCompletees,
    totalLivresDistincts: livresDistincts.size,
    totalPagesLues,
    totalCasesRenouvelees,
    dureeMoyenneMs,
    genreLePlusRapide,
    genreLePlusLent,
  };
}