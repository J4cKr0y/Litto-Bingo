import { describe, it, expect } from 'vitest';
import type { DefinitionBadge } from './litto-bingo-badges';
import { construireCatalogue } from './litto-bingo-badges-catalogue';

describe('construireCatalogue', () => {
  it("contient un badge Pionnier par année, de 2027 jusqu'à l'année courante incluse", () => {
    const catalogue = construireCatalogue(2029, ['roman']);

    const idsPionniers = catalogue
      .map((badge) => badge.id)
      .filter((id) => id.startsWith('pionnier-'));

    expect(idsPionniers).toEqual(['pionnier-2027', 'pionnier-2028', 'pionnier-2029']);
  });
    it("ne contient aucun badge Pionnier quand l'année courante précède 2027", () => {
    const catalogue = construireCatalogue(2026, ['roman']);

    expect(catalogue.filter((badge) => badge.id.startsWith('pionnier-'))).toEqual([]);
  });

  it("contient le badge « Tour du monde », dont le seuil est le nombre de genres disponibles", () => {
    const catalogue = construireCatalogue(2027, ['roman', 'policier', 'manga']);

    expect(catalogue.find((badge) => badge.id === 'tour-du-monde')).toEqual({
      id: 'tour-du-monde',
      type: 'quantitatif',
      champ: 'genresDistincts',
      seuil: 3,
    });
  });
});

const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;

describe('construireCatalogue : badges saisonniers', () => {
  const PRINTEMPS = { type: 'saison', debut: { mois: 3, jour: 20 }, fin: { mois: 6, jour: 20 } } as const;
  const ETE = { type: 'saison', debut: { mois: 6, jour: 21 }, fin: { mois: 9, jour: 22 } } as const;
  const AUTOMNE = { type: 'saison', debut: { mois: 9, jour: 23 }, fin: { mois: 12, jour: 20 } } as const;
  const HIVER = { type: 'saison', debut: { mois: 12, jour: 21 }, fin: { mois: 3, jour: 19 } } as const;

  const attendus: DefinitionBadge[] = [
    { id: 'bourgeon', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1, fenetre: PRINTEMPS },
    {
      id: 'reveil-litteraire',
      type: 'quantitatif',
      champ: 'bingosAvecGenre',
      genres: ['romance', 'dark-romance'],
      seuil: 1,
      fenetre: PRINTEMPS,
    },
    { id: 'lecteur-de-plage', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1, fenetre: ETE },
    { id: 'marathon-estival', type: 'quantitatif', champ: 'bingosCompletes', seuil: 2, fenetre: ETE },
    { id: 'feuilles-et-chapitres', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1, fenetre: AUTOMNE },
    { id: 'explorateur-brumeux', type: 'quantitatif', champ: 'genresDistincts', seuil: 3, fenetre: AUTOMNE },
    { id: 'au-coin-du-feu', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1, fenetre: HIVER },
    { id: 'flocon-d-or', type: 'exploit', critere: 'casesRenouveleesMax', seuil: 0, fenetre: HIVER },
  ];

  it.each(attendus)('contient le badge saisonnier $id', (attendu) => {
    const catalogue = construireCatalogue(2027, ['roman', 'policier']);

    expect(catalogue.find((badge) => badge.id === attendu.id)).toEqual(attendu);
  });
});

describe('construireCatalogue : badges permanents', () => {
  const genres = ['roman', 'policier', 'manga', 'bd', 'romance', 'dark-romance', 'romantasy'];

  const attendus: DefinitionBadge[] = [
    { id: 'premier-pas', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1 },
    { id: 'assidu', type: 'quantitatif', champ: 'bingosCompletes', seuil: 5 },
    { id: 'bibliophile', type: 'quantitatif', champ: 'bingosCompletes', seuil: 10 },
    { id: 'legende', type: 'quantitatif', champ: 'bingosCompletes', seuil: 25 },
    { id: 'lecteur-curieux', type: 'quantitatif', champ: 'livresDistincts', seuil: 10 },
    { id: 'grand-lecteur', type: 'quantitatif', champ: 'livresDistincts', seuil: 50 },
    { id: 'encyclopedie', type: 'quantitatif', champ: 'livresDistincts', seuil: 100 },
    { id: 'explorateur', type: 'quantitatif', champ: 'genresDistincts', seuil: 5 },
    { id: 'montagne-de-pages', type: 'quantitatif', champ: 'pagesTotales', seuil: 5000 },
    { id: 'eclair', type: 'exploit', critere: 'dureeMaxMs', seuil: SEPT_JOURS_MS },
    { id: 'sans-filet', type: 'exploit', critere: 'casesRenouveleesMax', seuil: 0 },
  ];

  it.each(attendus)('contient le badge permanent $id', (attendu) => {
    const catalogue = construireCatalogue(2027, genres);

    expect(catalogue.find((badge) => badge.id === attendu.id)).toEqual(attendu);
  });
});

describe('construireCatalogue : structure', () => {
  const genres = ['roman', 'policier'];

  it('ne contient que des identifiants uniques, Pionnier compris', () => {
    const ids = construireCatalogue(2030, genres).map((badge) => badge.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("range les badges dans l'ordre : permanents, saisonniers, puis Pionnier", () => {
    const ids = construireCatalogue(2028, genres).map((badge) => badge.id);

    expect(ids.indexOf('sans-filet')).toBeLessThan(ids.indexOf('bourgeon'));
    expect(ids.indexOf('flocon-d-or')).toBeLessThan(ids.indexOf('pionnier-2027'));
  });
});