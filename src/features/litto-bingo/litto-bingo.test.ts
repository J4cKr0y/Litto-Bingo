import { describe, it, expect } from 'vitest';
import { genererGrille } from './litto-bingo';

describe('genererGrille', () => {
  it('retourne null quand aucune consigne n\'est disponible', () => {
    const consignesDisponibles: unknown[] = [];

    const resultat = genererGrille(consignesDisponibles as never);

    expect(resultat).toBeNull();
  });

  it('retourne une grille non nulle quand 25 consignes distinctes sont fournies', () => {
    const consignesDisponibles = Array.from({ length: 25 }, (_, i) => ({
      id: `consigne-${i}`,
      texte: `Consigne ${i}`,
      genre: 'roman',
    }));

    const resultat = genererGrille(consignesDisponibles as never);

    expect(resultat).not.toBeNull();
  });

  it('retourne une grille contenant exactement 25 cases quand 25 consignes sont fournies', () => {
    const consignesDisponibles = Array.from({ length: 25 }, (_, i) => ({
      id: `consigne-${i}`,
      texte: `Consigne ${i}`,
      genre: 'roman',
    }));

    const resultat = genererGrille(consignesDisponibles as never);

    expect(resultat?.cases).toHaveLength(25);
  });

  it('la grille reflète les consignes réellement fournies en entrée (ensemble A)', () => {
    const consignesA = Array.from({ length: 25 }, (_, i) => ({
      id: `a-${i}`,
      texte: `Consigne A ${i}`,
      genre: 'roman',
    }));

    const resultat = genererGrille(consignesA as never);

    const idsRetournes = resultat?.cases.map((c: any) => c.consigne.id);
    expect(idsRetournes).toEqual(expect.arrayContaining(consignesA.map(c => c.id)));
  });

  it('la grille reflète les consignes réellement fournies en entrée (ensemble B, différent de A)', () => {
    const consignesB = Array.from({ length: 25 }, (_, i) => ({
      id: `b-${i}`,
      texte: `Consigne B ${i}`,
      genre: 'policier',
    }));

    const resultat = genererGrille(consignesB as never);

    const idsRetournes = resultat?.cases.map((c: any) => c.consigne.id);
    expect(idsRetournes).toEqual(expect.arrayContaining(consignesB.map(c => c.id)));
  });
});