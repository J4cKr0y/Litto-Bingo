// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageArchiveRepository } from './litto-bingo-archive.repository';
import { archiverBingo } from './litto-bingo-archive';
import { genererGrille } from './litto-bingo';

function creerConsignes(prefixe: string, genre: string, count = 25) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefixe}-${i}`,
    texte: `Consigne ${prefixe} ${i}`,
    genre,
  }));
}

describe('LocalStorageArchiveRepository', () => {
  const repository = new LocalStorageArchiveRepository();

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('retourne une liste vide quand aucune archive n\'existe', async () => {
    const resultat = await repository.listerArchives();

    expect(resultat).toEqual([]);
  });

  it('ajoute une archive et la retrouve dans la liste', async () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    const archive = archiverBingo(
      grille,
      'abandonne',
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-01-02T00:00:00Z')
    );

    await repository.ajouterArchive(archive);
    const resultat = await repository.listerArchives();

    expect(resultat).toHaveLength(1);
    expect(resultat[0].id).toBe(archive.id);
  });

  it('accumule plusieurs archives dans l\'ordre d\'ajout', async () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    const archive1 = archiverBingo(grille, 'abandonne', new Date(), new Date());
    const archive2 = archiverBingo(grille, 'complete', new Date(), new Date());

    await repository.ajouterArchive(archive1);
    await repository.ajouterArchive(archive2);
    const resultat = await repository.listerArchives();

    expect(resultat.map((a) => a.id)).toEqual([archive1.id, archive2.id]);
  });

  it('retourne une liste vide si le contenu stocké est corrompu, sans planter', async () => {
    localStorage.setItem('litto-bingo:archives', '{ceci n\'est pas du JSON valide');

    const resultat = await repository.listerArchives();

    expect(resultat).toEqual([]);
  });
});