import type { BingoArchive } from './litto-bingo-archive';

/** Fabrique une archive de bingo complété, avec des valeurs par défaut valides pour les tests. */
export function creerArchive(surcharges: Partial<BingoArchive> = {}): BingoArchive {
  return {
    id: crypto.randomUUID(),
    statut: 'complete',
    taille: 5,
    genres: ['roman'],
    casesCompletees: 25,
    livresLus: ['Livre A'],
    pagesTotales: 300,
    dureeMs: 3 * 24 * 60 * 60 * 1000,
    casesRenouveleesUtilisees: 0,
    dateArchivage: '2027-02-01T00:00:00.000Z',
    ...surcharges,
  };
}