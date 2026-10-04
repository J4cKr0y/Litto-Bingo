import { describe, it, expect } from 'vitest';
import { archiverBingo } from './litto-bingo-archive';
import { genererGrille, cocherCase, enregistrerPagesLivre, type Consigne } from './litto-bingo';

function creerConsignes(prefixe: string, genre: string, count = 25): Consigne[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefixe}-${i}`,
    texte: `Consigne ${prefixe} ${i}`,
    genre,
  }));
}

describe('archiverBingo', () => {
  it('retourne un objet non nul pour une grille valide', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    const debut = new Date('2026-01-01T00:00:00Z');
    const fin = new Date('2026-01-03T00:00:00Z');

    const resultat = archiverBingo(grille, 'abandonne', debut, fin);

    expect(resultat).not.toBeNull();
  });

  it('génère des id distincts pour deux grilles archivées séparément', () => {
    const grille1 = genererGrille(creerConsignes('a', 'roman'))!;
    const grille2 = genererGrille(creerConsignes('b', 'policier'))!;
    const debut = new Date('2026-01-01T00:00:00Z');
    const fin = new Date('2026-01-03T00:00:00Z');

    const archive1 = archiverBingo(grille1, 'abandonne', debut, fin);
    const archive2 = archiverBingo(grille2, 'abandonne', debut, fin);

    expect(archive1.id).not.toBe(archive2.id);
  });

  it('reflète le statut fourni en paramètre', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    const debut = new Date('2026-01-01T00:00:00Z');
    const fin = new Date('2026-01-03T00:00:00Z');

    const archiveComplete = archiverBingo(grille, 'complete', debut, fin);
    const archiveAbandonnee = archiverBingo(grille, 'abandonne', debut, fin);

    expect(archiveComplete.statut).toBe('complete');
    expect(archiveAbandonnee.statut).toBe('abandonne');
  });

  it('reflète la taille de la grille (4x4)', () => {
    const grille = genererGrille(creerConsignes('c', 'roman', 16), { taille: 4 })!;
    const debut = new Date('2026-01-01T00:00:00Z');
    const fin = new Date('2026-01-03T00:00:00Z');

    const archive = archiverBingo(grille, 'abandonne', debut, fin);

    expect(archive.taille).toBe(4);
  });

  it('déduit les genres distincts représentés dans la grille, sans doublon', () => {
    const consignesRoman = creerConsignes('r', 'roman', 13);
    const consignesPolicier = creerConsignes('p', 'policier', 12);
    const grille = genererGrille([...consignesRoman, ...consignesPolicier])!;
    const debut = new Date('2026-01-01T00:00:00Z');
    const fin = new Date('2026-01-03T00:00:00Z');

    const archive = archiverBingo(grille, 'abandonne', debut, fin);

    expect(archive.genres.sort()).toEqual(['policier', 'roman']);
  });

  it('compte le nombre de cases cochées', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    for (let i = 0; i < 10; i++) {
      cocherCase(grille, i, `Livre ${i}`);
    }
    const debut = new Date('2026-01-01T00:00:00Z');
    const fin = new Date('2026-01-03T00:00:00Z');

    const archive = archiverBingo(grille, 'abandonne', debut, fin);

    expect(archive.casesCompletees).toBe(10);
  });

  it('déduplique les livres lus plusieurs fois sur des cases différentes', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    cocherCase(grille, 0, 'Dune');
    cocherCase(grille, 1, 'Dune');
    cocherCase(grille, 2, '1984');
    const debut = new Date('2026-01-01T00:00:00Z');
    const fin = new Date('2026-01-03T00:00:00Z');

    const archive = archiverBingo(grille, 'abandonne', debut, fin);

    expect(archive.livresLus.sort()).toEqual(['1984', 'Dune']);
  });

  it('somme les pages renseignées en ignorant celles non renseignées', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    cocherCase(grille, 0, 'Dune');
    enregistrerPagesLivre(grille, 0, 412);
    cocherCase(grille, 1, 'Livre sans pages');
    cocherCase(grille, 2, '1984');
    enregistrerPagesLivre(grille, 2, 328);
    const debut = new Date('2026-01-01T00:00:00Z');
    const fin = new Date('2026-01-03T00:00:00Z');

    const archive = archiverBingo(grille, 'abandonne', debut, fin);

    expect(archive.pagesTotales).toBe(740);
  });

  it('la durée est null quand le statut est abandonné', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    const debut = new Date('2026-01-01T00:00:00Z');
    const fin = new Date('2026-01-03T00:00:00Z');

    const archive = archiverBingo(grille, 'abandonne', debut, fin);

    expect(archive.dureeMs).toBeNull();
  });
  
  it('calcule la durée en millisecondes entre le début et la fin quand le statut est complété', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    const debut = new Date('2026-01-01T00:00:00Z');
    const fin = new Date('2026-01-03T00:00:00Z'); // 2 jours plus tard

    const archive = archiverBingo(grille, 'complete', debut, fin);

    expect(archive.dureeMs).toBe(2 * 24 * 60 * 60 * 1000);
  });
  
  it('reflète le compteur de cases renouvelées de la grille', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    grille.casesRenouveleesUtilisees = 2;
    const debut = new Date('2026-01-01T00:00:00Z');
    const fin = new Date('2026-01-03T00:00:00Z');

    const archive = archiverBingo(grille, 'abandonne', debut, fin);

    expect(archive.casesRenouveleesUtilisees).toBe(2);
  });
  
});