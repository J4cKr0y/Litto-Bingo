// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageBingoRepository } from './litto-bingo.repository';
import { genererGrille, definirDateDeFin } from './litto-bingo';

function creerConsignes(count = 25) {
  return Array.from({ length: count }, (_, i) => ({
    id: `c-${i}`,
    texte: `Consigne ${i}`,
    genre: 'roman',
  }));
}

describe('LocalStorageBingoRepository', () => {
  const repository = new LocalStorageBingoRepository();

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('retourne null quand aucun bingo actif n\'a jamais été sauvegardé', async () => {
    const resultat = await repository.chargerBingoActif();

    expect(resultat).toBeNull();
  });

  it('sauvegarde puis recharge un bingo actif avec les mêmes données', async () => {
    const grille = genererGrille(creerConsignes())!;

    await repository.sauvegarderBingoActif(grille);
    const rechargee = await repository.chargerBingoActif();

    expect(rechargee).not.toBeNull();
    expect(rechargee!.cases).toHaveLength(25);
    expect(rechargee!.cases[0].consigne.id).toBe(grille.cases[0].consigne.id);
  });

  it('préserve la dateFin (type Date) à travers un cycle sauvegarde/rechargement', async () => {
    const grille = genererGrille(creerConsignes())!;
    const demain = new Date(Date.now() + 24 * 60 * 60 * 1000);
    definirDateDeFin(grille, demain);

    await repository.sauvegarderBingoActif(grille);
    const rechargee = await repository.chargerBingoActif();

    expect(rechargee!.dateFin).toBeInstanceOf(Date);
    expect(rechargee!.dateFin!.getTime()).toBe(demain.getTime());
  });

  it('supprime le bingo actif, le rechargement retourne ensuite null', async () => {
    const grille = genererGrille(creerConsignes())!;
    await repository.sauvegarderBingoActif(grille);

    await repository.supprimerBingoActif();
    const resultat = await repository.chargerBingoActif();

    expect(resultat).toBeNull();
  });
});