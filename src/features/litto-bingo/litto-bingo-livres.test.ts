import { describe, it, expect } from 'vitest';
import { listerLivresLus, normaliserTitre, regrouperLivresParBingo } from './litto-bingo-livres';
import { creerArchive } from './litto-bingo-test-utils';
import { calculerStatistiques } from './litto-bingo-archive';

describe('normaliserTitre', () => {
  it('retourne une chaîne vide pour un titre vide', () => {
    expect(normaliserTitre('')).toBe('');
  });
  it('ramène un titre en minuscules', () => {
    expect(normaliserTitre('DUNE')).toBe('dune');
  });
  it('retire les espaces en début et en fin de titre', () => {
    expect(normaliserTitre('  Dune \t')).toBe('dune');
  });
  it('réduit les espaces multiples à l’intérieur du titre à un seul', () => {
    expect(normaliserTitre('Le  Petit \t  Prince')).toBe('le petit prince');
  });
  it('ignore les accents, y compris ceux saisis en deux caractères', () => {
    const accentPrecompose = 'Éclair'; // É en un seul caractère
    const accentDecompose = 'E\u0301clair'; // E suivi de l'accent aigu combinant
    expect(normaliserTitre(accentPrecompose)).toBe('eclair');
    expect(normaliserTitre(accentDecompose)).toBe('eclair');
    expect(normaliserTitre('Cœur à vif')).toBe('cœur a vif');
  });
  it('ramène les apostrophes typographiques à l’apostrophe droite', () => {
    expect(normaliserTitre('L’Étranger')).toBe("l'etranger");
    expect(normaliserTitre('L\u02BCÉtranger')).toBe("l'etranger");
  });
  it('traite les espaces insécables comme des espaces ordinaires', () => {
    expect(normaliserTitre('\u00A0Le\u00A0Petit\u202FPrince\u00A0')).toBe('le petit prince');
  });
});

describe('listerLivresLus', () => {
  it("retourne une liste vide quand il n'y a aucune archive", () => {
    expect(listerLivresLus([], 'fr')).toEqual([]);
  });
  it('liste un livre présent dans une seule archive, sans titre proche', () => {
    expect(listerLivresLus([creerArchive({ livresLus: ['Dune'] })], 'fr')).toEqual([
      { titre: 'Dune', nombreBingos: 1, similaires: [] },
    ]);
  });
  it('regroupe un même titre présent dans plusieurs bingos et compte ces bingos', () => {
    const resultat = listerLivresLus(
      [
        creerArchive({ livresLus: ['Dune', 'Alice'] }),
        creerArchive({ livresLus: ['Dune'] }),
        creerArchive({ livresLus: ['Dune', 'Zorro'] }),
      ],
      'fr'
    );
    expect(resultat).toHaveLength(3);
    expect(resultat.find((livre) => livre.titre === 'Dune')?.nombreBingos).toBe(3);
    expect(resultat.find((livre) => livre.titre === 'Alice')?.nombreBingos).toBe(1);
  });
  it('trie les titres par ordre alphabétique de la langue, sans tenir compte de la casse ni des accents', () => {
    const resultat = listerLivresLus(
      [creerArchive({ livresLus: ['Zorro', 'élan', 'Alice', 'Éclair', 'bambi'] })],
      'fr'
    );
    expect(resultat.map((livre) => livre.titre)).toEqual([
      'Alice',
      'bambi',
      'Éclair',
      'élan',
      'Zorro',
    ]);
  });
  it('signale comme proches, sans les fusionner, les titres qui ne diffèrent que par la casse, les espaces ou les accents', () => {
    const resultat = listerLivresLus(
      [
        creerArchive({ livresLus: ['Dune', 'Alice'] }),
        creerArchive({ livresLus: ['dune ', 'Éclair'] }),
        creerArchive({ livresLus: ['Eclair'] }),
      ],
      'fr'
    );
    const similairesDe = (titre: string) => resultat.find((livre) => livre.titre === titre)?.similaires;

    expect(resultat).toHaveLength(5);
    expect(similairesDe('Dune')).toEqual(['dune ']);
    expect(similairesDe('dune ')).toEqual(['Dune']);
    expect(similairesDe('Éclair')).toEqual(['Eclair']);
    expect(similairesDe('Eclair')).toEqual(['Éclair']);
    expect(similairesDe('Alice')).toEqual([]);
  });
  it("compte un titre répété dans un même bingo comme un seul bingo", () => {
    const resultat = listerLivresLus([creerArchive({ livresLus: ['Dune', 'Dune'] })], 'fr');

    expect(resultat).toEqual([{ titre: 'Dune', nombreBingos: 1, similaires: [] }]);
  });

  it('inclut les livres des bingos abandonnés, comme la statistique', () => {
    const resultat = listerLivresLus(
      [
        creerArchive({ livresLus: ['Alice'] }),
        creerArchive({ statut: 'abandonne', dureeMs: null, livresLus: ['Zorro'] }),
      ],
      'fr'
    );

    expect(resultat.map((livre) => livre.titre)).toEqual(['Alice', 'Zorro']);
  });

  it("garde l'ordre d'apparition pour deux titres que la langue juge égaux (casse ou accent)", () => {
    const premierAccentue = listerLivresLus(
      [creerArchive({ livresLus: ['Éclair'] }), creerArchive({ livresLus: ['Eclair'] })],
      'fr'
    );
    const premierSimple = listerLivresLus(
      [creerArchive({ livresLus: ['Eclair'] }), creerArchive({ livresLus: ['Éclair'] })],
      'fr'
    );

    expect(premierAccentue.map((livre) => livre.titre)).toEqual(['Éclair', 'Eclair']);
    expect(premierSimple.map((livre) => livre.titre)).toEqual(['Eclair', 'Éclair']);
  });

  it("garde un titre qui n'a aucun proche avec une liste de proches vide, même quand d'autres en ont", () => {
    const resultat = listerLivresLus(
      [creerArchive({ livresLus: ['Dune', 'dune', 'Alice'] })],
      'fr'
    );

    expect(resultat.find((livre) => livre.titre === 'Alice')?.similaires).toEqual([]);
  });

  it('contient exactement autant de titres que la statistique « Livres distincts lus »', () => {
    const archives = [
      creerArchive({ livresLus: ['Dune', 'Alice', 'Éclair'] }),
      creerArchive({ statut: 'abandonne', dureeMs: null, livresLus: ['Dune', 'Zorro', 'dune ', 'Eclair'] }),
      creerArchive({ livresLus: [] }),
    ];

    expect(listerLivresLus(archives, 'fr')).toHaveLength(
      calculerStatistiques(archives).totalLivresDistincts
    );
  });
});

describe('regrouperLivresParBingo', () => {
  it("retourne une liste vide quand il n'y a aucune archive", () => {
    expect(regrouperLivresParBingo([])).toEqual([]);
  });
  it('décrit un bingo avec son statut, sa taille, sa date et ses livres', () => {
    const archive = creerArchive({
      id: 'bingo-1',
      statut: 'abandonne',
      dureeMs: null,
      taille: 3,
      dateArchivage: '2027-03-10T12:00:00.000Z',
      livresLus: ['Dune', 'Alice'],
    });
    expect(regrouperLivresParBingo([archive])).toEqual([
      {
        id: 'bingo-1',
        statut: 'abandonne',
        taille: 3,
        dateArchivage: '2027-03-10T12:00:00.000Z',
        livres: ['Dune', 'Alice'],
      },
    ]);
  });
  it("range les bingos par date d'archivage, du plus ancien au plus récent, quel que soit l'ordre fourni", () => {
    const resultat = regrouperLivresParBingo([
      creerArchive({ id: 'recent', dateArchivage: '2027-03-10T12:00:00.000Z' }),
      creerArchive({ id: 'ancien', dateArchivage: '2027-01-05T08:00:00.000Z' }),
      creerArchive({ id: 'milieu', dateArchivage: '2027-02-20T18:00:00.000Z' }),
    ]);
    expect(resultat.map((bingo) => bingo.id)).toEqual(['ancien', 'milieu', 'recent']);
  });
  it("place en premier une archive sans date d'archivage, créée avant l'ajout de ce champ", () => {
    const resultat = regrouperLivresParBingo([
      creerArchive({ id: 'datee', dateArchivage: '2027-01-05T08:00:00.000Z' }),
      creerArchive({ id: 'sans-date', dateArchivage: undefined as unknown as string }),
    ]);
    expect(resultat.map((bingo) => bingo.id)).toEqual(['sans-date', 'datee']);
    expect(resultat[0].dateArchivage).toBeUndefined();
  });
  it("garde l'ordre fourni pour deux archives sans date, sans rendre le tri indéterminé", () => {
    const sansDate = (id: string) =>
      creerArchive({ id, dateArchivage: undefined as unknown as string });

    expect(
      regrouperLivresParBingo([sansDate('a'), sansDate('b'), sansDate('c')]).map((bingo) => bingo.id)
    ).toEqual(['a', 'b', 'c']);
    expect(
      regrouperLivresParBingo([sansDate('c'), sansDate('a'), sansDate('b')]).map((bingo) => bingo.id)
    ).toEqual(['c', 'a', 'b']);
  });

  it("garde l'ordre fourni pour deux archives de même date", () => {
    const resultat = regrouperLivresParBingo([
      creerArchive({ id: 'premier', dateArchivage: '2027-01-05T08:00:00.000Z' }),
      creerArchive({ id: 'second', dateArchivage: '2027-01-05T08:00:00.000Z' }),
    ]);

    expect(resultat.map((bingo) => bingo.id)).toEqual(['premier', 'second']);
  });

  it("range une archive sans date avant celles qui en ont, même quand elle arrive en dernier ou au milieu", () => {
    const resultat = regrouperLivresParBingo([
      creerArchive({ id: 'a', dateArchivage: '2027-02-01T00:00:00.000Z' }),
      creerArchive({ id: 'sans', dateArchivage: undefined as unknown as string }),
      creerArchive({ id: 'b', dateArchivage: '2027-01-01T00:00:00.000Z' }),
    ]);

    expect(resultat.map((bingo) => bingo.id)).toEqual(['sans', 'b', 'a']);
  });

  it("ne modifie pas la liste d'archives reçue ni les listes de livres de ses archives", () => {
    const archives = [
      creerArchive({ id: 'b', dateArchivage: '2027-02-01T00:00:00.000Z', livresLus: ['Dune'] }),
      creerArchive({ id: 'a', dateArchivage: '2027-01-01T00:00:00.000Z', livresLus: ['Alice'] }),
    ];

    const resultat = regrouperLivresParBingo(archives);
    resultat[0].livres.push('Intrus');

    expect(archives.map((archive) => archive.id)).toEqual(['b', 'a']);
    expect(archives[1].livresLus).toEqual(['Alice']);
  });

  it("décrit chaque bingo avec ses propres livres, sans mélanger ceux de deux archives", () => {
    const resultat = regrouperLivresParBingo([
      creerArchive({ id: 'a', dateArchivage: '2027-01-01T00:00:00.000Z', livresLus: ['Dune', 'Alice'] }),
      creerArchive({ id: 'b', dateArchivage: '2027-02-01T00:00:00.000Z', livresLus: ['Zorro'] }),
    ]);
    expect(resultat.map((bingo) => bingo.livres)).toEqual([['Dune', 'Alice'], ['Zorro']]);
  });
});