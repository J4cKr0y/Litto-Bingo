import { describe, it, expect } from 'vitest';
import {
  genererGrille,
  cocherCase,
  decocherCase,
  verifierLigneComplete,
  verifierBingoComplet,
  definirDateDeFin,
  estExpire,
} from './litto-bingo';


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
  
  it('ne retient que les consignes du genre demandé quand un filtre est appliqué', () => {
    const consignesRoman = creerConsignes('r', 'roman', 15);
    const consignesPolicier = creerConsignes('p', 'policier', 40);
    const pool = [...consignesRoman, ...consignesPolicier];

    const resultat = genererGrille(pool, { genre: 'policier' });

    const genresRetournes = resultat!.cases.map((c) => c.consigne.genre);
    expect(genresRetournes.every((g) => g === 'policier')).toBe(true);
  });
  
  it('complète la grille avec les consignes disponibles et signale une limitation quand le genre filtré en a moins de 25', () => {
    const consignesManga = creerConsignes('m', 'manga', 15);
    const consignesAutres = creerConsignes('r', 'roman', 40);
    const pool = [...consignesManga, ...consignesAutres];

    const resultat = genererGrille(pool, { genre: 'manga' });

    expect(resultat!.cases).toHaveLength(15);
    expect(resultat!.generationLimitee).toBe(true);
  });
});
//-------------------------------------------------------------------------------//
describe('cocherCase', () => {
  it('rejette la validation quand aucun livre n\'est associé à la case', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;

    expect(() => cocherCase(grille, 0, null)).toThrowError(
      'Indique le livre associé à cette case avant de la valider'
    );
  });

  it('marque la case comme cochée et lui associe le livre quand un titre est fourni', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;

    cocherCase(grille, 0, 'Le Nom de la Rose');

    expect(grille.cases[0].cochee).toBe(true);
    expect(grille.cases[0].livre).toBe('Le Nom de la Rose');
  });

  it('rejette la validation quand le bingo est expiré', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    grille.dateFin = new Date('2020-01-01');

    expect(() => cocherCase(grille, 0, 'Un livre')).toThrowError('Bingo expiré');
  });
});
//--------------------------------------------------------------------------------//
describe('decocherCase', () => {
  it('marque la case comme non cochée et retire le livre associé', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    cocherCase(grille, 0, 'Le Nom de la Rose');

    decocherCase(grille, 0);

    expect(grille.cases[0].cochee).toBe(false);
    expect(grille.cases[0].livre).toBeNull();
  });
});
//--------------------------------------------------------------------------------//
describe('verifierLigneComplete', () => {
  it('retourne true quand toutes les cases d\'une ligne sont cochées', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    [0, 1, 2, 3, 4].forEach((pos) => cocherCase(grille, pos, `Livre ${pos}`));

    const resultat = verifierLigneComplete(grille, 0);

    expect(resultat).toBe(true);
  });

  it('retourne false quand au moins une case de la ligne n\'est pas cochée', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    [0, 1, 2, 3].forEach((pos) => cocherCase(grille, pos, `Livre ${pos}`));
    // position 4 volontairement non cochée

    const resultat = verifierLigneComplete(grille, 0);

    expect(resultat).toBe(false);
  });
});
//----------------------------------------------------------------------------//
describe('verifierBingoComplet', () => {
  it('retourne true quand les 25 cases du bingo sont cochées', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    grille.cases.forEach((_, pos) => cocherCase(grille, pos, `Livre ${pos}`));

    const resultat = verifierBingoComplet(grille);

    expect(resultat).toBe(true);
  });

  it('retourne false quand au moins une case du bingo n\'est pas cochée', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    grille.cases.slice(0, 24).forEach((_, pos) => cocherCase(grille, pos, `Livre ${pos}`));
    // dernière case (position 24) volontairement non cochée

    const resultat = verifierBingoComplet(grille);

    expect(resultat).toBe(false);
  });
});
//--------------------------------------------------------------------------//
describe('definirDateDeFin', () => {
  it('accepte une date de fin future', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    const demain = new Date(Date.now() + 24 * 60 * 60 * 1000);

    definirDateDeFin(grille, demain);

    expect(grille.dateFin).toEqual(demain);
  });

  it('rejette une date de fin dans le passé', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    const hier = new Date(Date.now() - 24 * 60 * 60 * 1000);

    expect(() => definirDateDeFin(grille, hier)).toThrowError(
      'La date de fin doit être dans le futur'
    );
  });

  it('rejette une date de fin correspondant exactement à l\'instant présent (frontière)', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    const maintenant = new Date(Date.now());

    expect(() => definirDateDeFin(grille, maintenant)).toThrowError(
      'La date de fin doit être dans le futur'
    );
  });
});
//-----------------------------------------------------------------------------//
describe('estExpire', () => {
  it('retourne true quand la date de fin est dépassée', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    grille.dateFin = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const resultat = estExpire(grille);

    expect(resultat).toBe(true);
  });

  it('retourne false quand la date de fin n\'est pas dépassée', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;
    grille.dateFin = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const resultat = estExpire(grille);

    expect(resultat).toBe(false);
  });

  it('retourne false quand aucune date de fin n\'est définie', () => {
    const grille = genererGrille(creerConsignes('c', 'roman'))!;

    const resultat = estExpire(grille);

    expect(resultat).toBe(false);
  });
});