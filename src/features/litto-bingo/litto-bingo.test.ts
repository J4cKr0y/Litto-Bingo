import { describe, it, expect } from 'vitest';
import { genererGrille } from './litto-bingo';

function creerConsignes(prefixe: string, genre: string, count = 25) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefixe}-${i}`,
    texte: `Consigne ${prefixe} ${i}`,
    genre,
  }));
}

describe('genererGrille', () => {
  it('retourne null quand aucune consigne n\'est disponible', () => {
    const resultat = genererGrille([]);

    expect(resultat).toBeNull();
  });

  it('retourne une grille non nulle quand 25 consignes distinctes sont fournies', () => {
    const consignesDisponibles = creerConsignes('c', 'roman');

    const resultat = genererGrille(consignesDisponibles);

    expect(resultat).not.toBeNull();
  });

  it('retourne une grille contenant exactement 25 cases quand 25 consignes sont fournies', () => {
    const consignesDisponibles = creerConsignes('c', 'roman');

    const resultat = genererGrille(consignesDisponibles);

    expect(resultat?.cases).toHaveLength(25);
  });

  it('la grille reflète les consignes réellement fournies en entrée (ensemble A)', () => {
    const consignesA = creerConsignes('a', 'roman');

    const resultat = genererGrille(consignesA);

    const idsRetournes = resultat?.cases.map((c) => c.consigne.id);
    expect(idsRetournes).toEqual(expect.arrayContaining(consignesA.map((c) => c.id)));
  });

  it('la grille reflète les consignes réellement fournies en entrée (ensemble B, différent de A)', () => {
    const consignesB = creerConsignes('b', 'policier');

    const resultat = genererGrille(consignesB);

    const idsRetournes = resultat?.cases.map((c) => c.consigne.id);
    expect(idsRetournes).toEqual(expect.arrayContaining(consignesB.map((c) => c.id)));
  });

  it('sélectionne 25 consignes distinctes (sans doublon) parmi un pool de 100', () => {
    const pool = creerConsignes('p', 'roman', 100);

    const resultat = genererGrille(pool);

    const idsRetournes = resultat!.cases.map((c) => c.consigne.id);
    const idsUniques = new Set(idsRetournes);

    expect(resultat!.cases).toHaveLength(25);
    expect(idsUniques.size).toBe(25);
  });
  
  it('produit des sélections différentes à deux appels successifs sur un même pool', () => {
    const pool = creerConsignes('p', 'roman', 100);

    const resultat1 = genererGrille(pool);
    const resultat2 = genererGrille(pool);

    const ids1 = resultat1!.cases.map((c) => c.consigne.id);
    const ids2 = resultat2!.cases.map((c) => c.consigne.id);

    expect(ids1).not.toEqual(ids2);
  });
});