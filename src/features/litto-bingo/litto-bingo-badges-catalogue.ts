import type { DefinitionBadge, FenetreSaison } from './litto-bingo-badges';

const PREMIERE_ANNEE_PIONNIER = 2027;
const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;

const PRINTEMPS: FenetreSaison = { type: 'saison', debut: { mois: 3, jour: 20 }, fin: { mois: 6, jour: 20 } };
const ETE: FenetreSaison = { type: 'saison', debut: { mois: 6, jour: 21 }, fin: { mois: 9, jour: 22 } };
const AUTOMNE: FenetreSaison = { type: 'saison', debut: { mois: 9, jour: 23 }, fin: { mois: 12, jour: 20 } };
const HIVER: FenetreSaison = { type: 'saison', debut: { mois: 12, jour: 21 }, fin: { mois: 3, jour: 19 } };

function construireBadgesPermanents(genresDisponibles: string[]): DefinitionBadge[] {
  return [
    { id: 'premier-pas', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1 },
    { id: 'assidu', type: 'quantitatif', champ: 'bingosCompletes', seuil: 5 },
    { id: 'bibliophile', type: 'quantitatif', champ: 'bingosCompletes', seuil: 10 },
    { id: 'legende', type: 'quantitatif', champ: 'bingosCompletes', seuil: 25 },
    { id: 'lecteur-curieux', type: 'quantitatif', champ: 'livresDistincts', seuil: 10 },
    { id: 'grand-lecteur', type: 'quantitatif', champ: 'livresDistincts', seuil: 50 },
    { id: 'encyclopedie', type: 'quantitatif', champ: 'livresDistincts', seuil: 100 },
    { id: 'explorateur', type: 'quantitatif', champ: 'genresDistincts', seuil: 5 },
    {
      id: 'tour-du-monde',
      type: 'quantitatif',
      champ: 'genresDistincts',
      seuil: genresDisponibles.length,
    },
    { id: 'montagne-de-pages', type: 'quantitatif', champ: 'pagesTotales', seuil: 5000 },
    { id: 'eclair', type: 'exploit', critere: 'dureeMaxMs', seuil: SEPT_JOURS_MS },
    { id: 'sans-filet', type: 'exploit', critere: 'casesRenouveleesMax', seuil: 0 },
  ];
}

function construireBadgesSaisonniers(): DefinitionBadge[] {
  return [
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
}

function construireBadgesPionnier(anneeCourante: number): DefinitionBadge[] {
  const badges: DefinitionBadge[] = [];

  for (let annee = PREMIERE_ANNEE_PIONNIER; annee <= anneeCourante; annee++) {
    badges.push({
      id: `pionnier-${annee}`,
      type: 'quantitatif',
      champ: 'bingosCompletes',
      seuil: 1,
      fenetre: { type: 'anneeCivile', annee },
    });
  }

  return badges;
}

export function construireCatalogue(
  anneeCourante: number,
  genresDisponibles: string[]
): DefinitionBadge[] {
  return [
    ...construireBadgesPermanents(genresDisponibles),
    ...construireBadgesSaisonniers(),
    ...construireBadgesPionnier(anneeCourante),
  ];
}