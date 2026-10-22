import { describe, it, expect } from 'vitest';
import type { BingoArchive } from './litto-bingo-archive';
import {
  appliquerBadgesDebloques,
  calculerBadgesDebloques,
  estBadgeExportable,
  marquerBadgeNotifie,
} from './litto-bingo-badges';

// helper
function creerArchive(surcharges: Partial<BingoArchive> = {}): BingoArchive {
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
    dateArchivage: '2026-02-01T00:00:00.000Z',
    ...surcharges,
  };
}

describe('calculerBadgesDebloques', () => {
  it('retourne une liste vide quand le catalogue de badges est vide', () => {
    const resultat = calculerBadgesDebloques({
      archives: [],
      catalogue: [],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });
  
    it("retourne une liste vide quand aucune archive n'existe, même avec un badge réel dans le catalogue", () => {
    const resultat = calculerBadgesDebloques({
      archives: [],
      catalogue: [
        {
          id: 'bibliophile',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 1,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });
  
    it('débloque le badge quand le seuil de bingos complétés est atteint', () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive()],
      catalogue: [
        {
          id: 'bibliophile',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 1,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'bibliophile', notifie: false }]);
  });
  
    it("ne compte pas un bingo abandonné dans la progression d'un badge", () => {
    const resultat = calculerBadgesDebloques({
      archives: [
        creerArchive(),
        creerArchive(),
        creerArchive({ statut: 'abandonne', dureeMs: null }),
      ],
      catalogue: [
        {
          id: 'marathonien',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 3,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });
  
    it("ne compte pas une archive créée avant la date d'activation des badges", () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ dateArchivage: '2025-12-31T23:59:59.000Z' })],
      catalogue: [
        {
          id: 'bibliophile',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 1,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });
  
    it("ne redébloque pas un badge déjà présent dans la progression actuelle", () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive()],
      catalogue: [
        {
          id: 'bibliophile',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 1,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: {
        badgesDebloques: [{ id: 'bibliophile', notifie: true }],
      },
    });

    expect(resultat).toEqual([]);
  });
  
    it("débloque un badge de livres distincts à partir de l'union des livres lus sur plusieurs archives", () => {
    const resultat = calculerBadgesDebloques({
      archives: [
        creerArchive({ livresLus: ['Livre A', 'Livre B'] }),
        creerArchive({ livresLus: ['Livre B', 'Livre C'] }),
      ],
      catalogue: [
        {
          id: 'lecteur-curieux',
          type: 'quantitatif',
          champ: 'livresDistincts',
          seuil: 3,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'lecteur-curieux', notifie: false }]);
  });
  
    it("débloque un badge de genres distincts à partir de l'union des genres sur plusieurs archives", () => {
    const resultat = calculerBadgesDebloques({
      archives: [
        creerArchive({ genres: ['roman', 'policier'] }),
        creerArchive({ genres: ['policier', 'manga'] }),
      ],
      catalogue: [
        {
          id: 'explorateur',
          type: 'quantitatif',
          champ: 'genresDistincts',
          seuil: 3,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'explorateur', notifie: false }]);
  });
  
    it("débloque un badge exploit quand une archive complétée est plus rapide que la durée maximale", () => {
    const CINQ_JOURS_MS = 5 * 24 * 60 * 60 * 1000;
    const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;

    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ dureeMs: CINQ_JOURS_MS })],
      catalogue: [
        {
          id: 'eclair',
          type: 'exploit',
          critere: 'dureeMaxMs',
          seuil: SEPT_JOURS_MS,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'eclair', notifie: false }]);
  });
  
    it("ne débloque pas un badge exploit quand l'archive est plus lente que la durée maximale", () => {
    const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;
    const HUIT_JOURS_MS = 8 * 24 * 60 * 60 * 1000;

    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ dureeMs: HUIT_JOURS_MS })],
      catalogue: [
        {
          id: 'eclair',
          type: 'exploit',
          critere: 'dureeMaxMs',
          seuil: SEPT_JOURS_MS,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });
  
    it("débloque un badge exploit quand une archive complétée n'a utilisé aucun renouvellement de consigne", () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ casesRenouveleesUtilisees: 0 })],
      catalogue: [
        {
          id: 'sans-filet',
          type: 'exploit',
          critere: 'casesRenouveleesMax',
          seuil: 0,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'sans-filet', notifie: false }]);
  });
    it("ne débloque pas le badge « sans filet » quand l'archive a utilisé des renouvellements", () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ casesRenouveleesUtilisees: 2 })],
      catalogue: [
        {
          id: 'sans-filet',
          type: 'exploit',
          critere: 'casesRenouveleesMax',
          seuil: 0,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });
    it('compte plusieurs bingos complétés pour atteindre un seuil supérieur à 1', () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive(), creerArchive(), creerArchive()],
      catalogue: [
        { id: 'trio', type: 'quantitatif', champ: 'bingosCompletes', seuil: 3 },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'trio', notifie: false }]);
  });

  it('débloque simultanément un badge quantitatif et un badge exploit', () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ casesRenouveleesUtilisees: 0 })],
      catalogue: [
        { id: 'bibliophile', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1 },
        { id: 'sans-filet', type: 'exploit', critere: 'casesRenouveleesMax', seuil: 0 },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([
      { id: 'bibliophile', notifie: false },
      { id: 'sans-filet', notifie: false },
    ]);
  });

  it("compte une archive archivée exactement à l'instant d'activation des badges", () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ dateArchivage: '2026-01-01T00:00:00.000Z' })],
      catalogue: [
        { id: 'bibliophile', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1 },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'bibliophile', notifie: false }]);
  });

  it("ignore une archive ancienne sans date d'archivage (créée avant l'activation des badges)", () => {
    const archiveAncienne = creerArchive({
      dateArchivage: undefined as unknown as string,
    });

    const resultat = calculerBadgesDebloques({
      archives: [archiveAncienne],
      catalogue: [
        { id: 'bibliophile', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1 },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });
  
    it("débloque un badge exploit quand la durée est exactement égale au maximum", () => {
    const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;

    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ dureeMs: SEPT_JOURS_MS })],
      catalogue: [
        { id: 'eclair', type: 'exploit', critere: 'dureeMaxMs', seuil: SEPT_JOURS_MS },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'eclair', notifie: false }]);
  });

  it("ne débloque pas un badge exploit de durée pour une archive complétée sans durée enregistrée", () => {
    const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;

    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ dureeMs: null })],
      catalogue: [
        { id: 'eclair', type: 'exploit', critere: 'dureeMaxMs', seuil: SEPT_JOURS_MS },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });

  it("débloque un badge exploit dès qu'une seule archive le satisfait, même si les autres non", () => {
    const TROIS_JOURS_MS = 3 * 24 * 60 * 60 * 1000;
    const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;
    const DIX_JOURS_MS = 10 * 24 * 60 * 60 * 1000;

    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ dureeMs: DIX_JOURS_MS }), creerArchive({ dureeMs: TROIS_JOURS_MS })],
      catalogue: [
        { id: 'eclair', type: 'exploit', critere: 'dureeMaxMs', seuil: SEPT_JOURS_MS },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'eclair', notifie: false }]);
  });
    it("débloque un badge de pages lues quand la somme des pages sur plusieurs archives atteint le seuil", () => {
    const resultat = calculerBadgesDebloques({
      archives: [
        creerArchive({ pagesTotales: 300 }),
        creerArchive({ pagesTotales: 200 }),
      ],
      catalogue: [
        {
          id: 'montagne-de-pages',
          type: 'quantitatif',
          champ: 'pagesTotales',
          seuil: 500,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'montagne-de-pages', notifie: false }]);
  });
    it("ne débloque pas un badge de pages lues quand la somme est juste sous le seuil", () => {
    const resultat = calculerBadgesDebloques({
      archives: [
        creerArchive({ pagesTotales: 300 }),
        creerArchive({ pagesTotales: 199 }),
      ],
      catalogue: [
        {
          id: 'montagne-de-pages',
          type: 'quantitatif',
          champ: 'pagesTotales',
          seuil: 500,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });
    it("débloque un badge de genre quand une archive contient au moins un des genres ciblés", () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ genres: ['policier', 'dark romance'] })],
      catalogue: [
        {
          id: 'reveil-litteraire',
          type: 'quantitatif',
          champ: 'bingosAvecGenre',
          genres: ['romance', 'dark romance'],
          seuil: 1,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'reveil-litteraire', notifie: false }]);
  });
    it("ne débloque pas un badge de genre quand aucune archive ne contient les genres ciblés", () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ genres: ['policier', 'fantasy'] })],
      catalogue: [
        {
          id: 'reveil-litteraire',
          type: 'quantitatif',
          champ: 'bingosAvecGenre',
          genres: ['romance', 'dark romance'],
          seuil: 1,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });
    it("ne compte pas, pour un badge de saison, une archive datée hors de la fenêtre", () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ dateArchivage: '2027-07-01T12:00:00.000Z' })],
      catalogue: [
        {
          id: 'bourgeon',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 1,
          fenetre: {
            type: 'saison',
            debut: { mois: 3, jour: 20 },
            fin: { mois: 6, jour: 20 },
          },
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });
    it("compte, pour un badge de saison, une archive datée à l'intérieur de la fenêtre", () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ dateArchivage: '2027-05-15T12:00:00.000Z' })],
      catalogue: [
        {
          id: 'bourgeon',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 1,
          fenetre: {
            type: 'saison',
            debut: { mois: 3, jour: 20 },
            fin: { mois: 6, jour: 20 },
          },
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([{ id: 'bourgeon', notifie: false }]);
  });
});

describe('marquerBadgeNotifie', () => {
  it('passe notifie à true pour le badge ciblé', () => {
    const progression = {
      badgesDebloques: [{ id: 'bibliophile', notifie: false }],
    };

    const resultat = marquerBadgeNotifie(progression, 'bibliophile');

    expect(resultat).toEqual({
      badgesDebloques: [{ id: 'bibliophile', notifie: true }],
    });
  });
    it("ne modifie rien quand l'id ciblé n'existe pas dans la progression", () => {
    const progression = {
      badgesDebloques: [{ id: 'bibliophile', notifie: false }],
    };

    expect(marquerBadgeNotifie(progression, 'inconnu')).toEqual(progression);
  });
    it('ne marque comme notifié que le badge ciblé, pas les autres', () => {
    const progression = {
      badgesDebloques: [
        { id: 'bibliophile', notifie: false },
        { id: 'eclair', notifie: false },
      ],
    };

    const resultat = marquerBadgeNotifie(progression, 'eclair');

    expect(resultat).toEqual({
      badgesDebloques: [
        { id: 'bibliophile', notifie: false },
        { id: 'eclair', notifie: true },
      ],
    });
  });
});

describe('estBadgeExportable', () => {
  it('retourne true pour un badge présent dans la progression', () => {
    const progression = {
      badgesDebloques: [{ id: 'eclair', notifie: true }],
    };

    expect(estBadgeExportable(progression, 'eclair')).toBe(true);
  });
    it("retourne false pour un badge absent de la progression (pas encore débloqué)", () => {
    const progression = {
      badgesDebloques: [{ id: 'eclair', notifie: true }],
    };

    expect(estBadgeExportable(progression, 'bibliophile')).toBe(false);
  });
    
    it("retourne true quand le badge figure parmi plusieurs badges débloqués", () => {
    const progression = {
      badgesDebloques: [
        { id: 'bibliophile', notifie: true },
        { id: 'eclair', notifie: false },
      ],
    };

    expect(estBadgeExportable(progression, 'eclair')).toBe(true);
  });
});

describe('fenêtre de saison : bornes du printemps (20 mars – 20 juin)', () => {
  function bourgeonDebloquePour(dateArchivage: string) {
    return calculerBadgesDebloques({
      archives: [creerArchive({ dateArchivage })],
      catalogue: [
        {
          id: 'bourgeon',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 1,
          fenetre: {
            type: 'saison',
            debut: { mois: 3, jour: 20 },
            fin: { mois: 6, jour: 20 },
          },
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });
  }

  it('compte une archive du premier jour de la saison, à 00h00 UTC (début inclus)', () => {
    expect(bourgeonDebloquePour('2027-03-20T00:00:00.000Z')).toEqual([
      { id: 'bourgeon', notifie: false },
    ]);
  });

  it("ne compte pas une archive de la veille du début, à 23h59 UTC", () => {
    expect(bourgeonDebloquePour('2027-03-19T23:59:59.000Z')).toEqual([]);
  });

  it('compte une archive du dernier jour de la saison, à 23h59 UTC (fin incluse)', () => {
    expect(bourgeonDebloquePour('2027-06-20T23:59:59.000Z')).toEqual([
      { id: 'bourgeon', notifie: false },
    ]);
  });

  it("ne compte pas une archive du lendemain de la fin, à 00h00 UTC", () => {
    expect(bourgeonDebloquePour('2027-06-21T00:00:00.000Z')).toEqual([]);
  });
});

describe('fenêtre de saison : hiver à cheval sur deux années (21 déc – 19 mars)', () => {
  function auCoinDuFeuDebloquePour(dateArchivage: string) {
    return calculerBadgesDebloques({
      archives: [creerArchive({ dateArchivage })],
      catalogue: [
        {
          id: 'au-coin-du-feu',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 1,
          fenetre: {
            type: 'saison',
            debut: { mois: 12, jour: 21 },
            fin: { mois: 3, jour: 19 },
          },
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });
  }

  it("compte une archive de fin décembre, dans la première partie de l'hiver", () => {
    expect(auCoinDuFeuDebloquePour('2027-12-25T12:00:00.000Z')).toEqual([
      { id: 'au-coin-du-feu', notifie: false },
    ]);
  });

    it("compte une archive de début janvier, dans la seconde partie de l'hiver", () => {
    expect(auCoinDuFeuDebloquePour('2028-01-05T12:00:00.000Z')).toEqual([
      { id: 'au-coin-du-feu', notifie: false },
    ]);
  });

  it("ne compte pas une archive du 20 décembre à 23h59 UTC, juste avant l'hiver", () => {
    expect(auCoinDuFeuDebloquePour('2027-12-20T23:59:59.000Z')).toEqual([]);
  });

  it("ne compte pas une archive du 20 mars à 00h00 UTC, juste après l'hiver", () => {
    expect(auCoinDuFeuDebloquePour('2028-03-20T00:00:00.000Z')).toEqual([]);
  });

  it("compte une archive du 21 décembre à 00h00 UTC (début inclus)", () => {
    expect(auCoinDuFeuDebloquePour('2027-12-21T00:00:00.000Z')).toEqual([
      { id: 'au-coin-du-feu', notifie: false },
    ]);
  });

  it("compte une archive du 19 mars à 23h59 UTC (fin incluse)", () => {
    expect(auCoinDuFeuDebloquePour('2028-03-19T23:59:59.000Z')).toEqual([
      { id: 'au-coin-du-feu', notifie: false },
    ]);
  });
});

describe('critères de comptage : cas négatif complémentaire', () => {
  it("ne débloque pas un badge de genres distincts quand le nombre de genres est sous le seuil", () => {
    const resultat = calculerBadgesDebloques({
      archives: [
        creerArchive({ genres: ['roman', 'policier'] }),
        creerArchive({ genres: ['policier'] }),
      ],
      catalogue: [
        {
          id: 'explorateur',
          type: 'quantitatif',
          champ: 'genresDistincts',
          seuil: 3,
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat).toEqual([]);
  });
});

describe("fenêtre de saison : fenêtre d'un seul jour (31 octobre)", () => {
  function jourUniqueDebloquePour(dateArchivage: string) {
    return calculerBadgesDebloques({
      archives: [creerArchive({ dateArchivage })],
      catalogue: [
        {
          id: 'jour-unique',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 1,
          fenetre: {
            type: 'saison',
            debut: { mois: 10, jour: 31 },
            fin: { mois: 10, jour: 31 },
          },
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });
  }

  it('compte une archive du jour exact', () => {
    expect(jourUniqueDebloquePour('2027-10-31T12:00:00.000Z')).toEqual([
      { id: 'jour-unique', notifie: false },
    ]);
  });

  it('ne compte pas une archive de la veille', () => {
    expect(jourUniqueDebloquePour('2027-10-30T23:59:59.000Z')).toEqual([]);
  });

  it("ne compte pas une archive d'un autre jour plus tard dans l'année", () => {
    expect(jourUniqueDebloquePour('2027-11-15T12:00:00.000Z')).toEqual([]);
  });
});

describe('occurrences de saison : Marathon estival (2 bingos pendant la même saison)', () => {
  function marathonDebloquePour(datesArchivage: string[]) {
    return calculerBadgesDebloques({
      archives: datesArchivage.map((dateArchivage) => creerArchive({ dateArchivage })),
      catalogue: [
        {
          id: 'marathon-estival',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 2,
          fenetre: {
            type: 'saison',
            debut: { mois: 6, jour: 21 },
            fin: { mois: 9, jour: 22 },
          },
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });
  }

  it('débloque le badge quand deux bingos sont complétés pendant le même été', () => {
    expect(
      marathonDebloquePour(['2027-07-10T12:00:00.000Z', '2027-08-20T12:00:00.000Z'])
    ).toEqual([{ id: 'marathon-estival', notifie: false }]);
  });

  it('ne cumule pas deux bingos complétés pendant deux étés différents', () => {
    expect(
      marathonDebloquePour(['2027-07-10T12:00:00.000Z', '2028-07-10T12:00:00.000Z'])
    ).toEqual([]);
  });
});

describe("occurrences de saison : l'hiver enjambe deux années civiles", () => {
  function marathonHivernalDebloquePour(datesArchivage: string[]) {
    return calculerBadgesDebloques({
      archives: datesArchivage.map((dateArchivage) => creerArchive({ dateArchivage })),
      catalogue: [
        {
          id: 'marathon-hivernal',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 2,
          fenetre: {
            type: 'saison',
            debut: { mois: 12, jour: 21 },
            fin: { mois: 3, jour: 19 },
          },
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });
  }

  it('cumule deux bingos du même hiver, répartis sur deux années civiles', () => {
    expect(
      marathonHivernalDebloquePour(['2027-12-25T12:00:00.000Z', '2028-01-10T12:00:00.000Z'])
    ).toEqual([{ id: 'marathon-hivernal', notifie: false }]);
  });

  it('ne cumule pas deux bingos de deux hivers différents, même dans la même année civile', () => {
    expect(
      marathonHivernalDebloquePour(['2028-01-10T12:00:00.000Z', '2028-12-25T12:00:00.000Z'])
    ).toEqual([]);
  });
});

describe('occurrences de saison : Explorateur brumeux (3 genres distincts dans la même saison)', () => {
  function explorateurDebloquePour(archives: { dateArchivage: string; genres: string[] }[]) {
    return calculerBadgesDebloques({
      archives: archives.map((a) => creerArchive(a)),
      catalogue: [
        {
          id: 'explorateur-brumeux',
          type: 'quantitatif',
          champ: 'genresDistincts',
          seuil: 3,
          fenetre: {
            type: 'saison',
            debut: { mois: 9, jour: 23 },
            fin: { mois: 12, jour: 20 },
          },
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });
  }

  it('débloque le badge quand 3 genres différents sont lus pendant le même automne', () => {
    expect(
      explorateurDebloquePour([
        { dateArchivage: '2027-10-05T12:00:00.000Z', genres: ['roman'] },
        { dateArchivage: '2027-11-10T12:00:00.000Z', genres: ['policier'] },
        { dateArchivage: '2027-12-01T12:00:00.000Z', genres: ['fantasy'] },
      ])
    ).toEqual([{ id: 'explorateur-brumeux', notifie: false }]);
  });

  it('ne débloque pas le badge quand les 3 genres sont répartis sur deux automnes différents', () => {
    expect(
      explorateurDebloquePour([
        { dateArchivage: '2027-10-05T12:00:00.000Z', genres: ['roman', 'policier'] },
        { dateArchivage: '2028-10-05T12:00:00.000Z', genres: ['fantasy'] },
      ])
    ).toEqual([]);
  });
});

describe("exploit dans une fenêtre : Flocon d'or (sans renouvellement pendant l'hiver)", () => {
  function floconDOrDebloquePour(dateArchivage: string, casesRenouveleesUtilisees: number) {
    return calculerBadgesDebloques({
      archives: [creerArchive({ dateArchivage, casesRenouveleesUtilisees })],
      catalogue: [
        {
          id: 'flocon-d-or',
          type: 'exploit',
          critere: 'casesRenouveleesMax',
          seuil: 0,
          fenetre: {
            type: 'saison',
            debut: { mois: 12, jour: 21 },
            fin: { mois: 3, jour: 19 },
          },
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });
  }

  it('débloque le badge quand le bingo est complété sans renouvellement pendant la saison', () => {
    expect(floconDOrDebloquePour('2028-01-10T12:00:00.000Z', 0)).toEqual([
      { id: 'flocon-d-or', notifie: false },
    ]);
  });

  it("ne débloque pas le badge quand le bingo, sans renouvellement, est complété hors de la saison", () => {
    expect(floconDOrDebloquePour('2028-07-10T12:00:00.000Z', 0)).toEqual([]);
  });
});

describe('fenêtre année civile : Pionnier 2027', () => {
  function pionnier2027DebloquePour(dateArchivage: string) {
    return calculerBadgesDebloques({
      archives: [creerArchive({ dateArchivage })],
      catalogue: [
        {
          id: 'pionnier-2027',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 1,
          fenetre: { type: 'anneeCivile', annee: 2027 },
        },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });
  }

  it("débloque le badge pour un bingo complété le 1er janvier à 00h00 UTC de l'année (début inclus)", () => {
    expect(pionnier2027DebloquePour('2027-01-01T00:00:00.000Z')).toEqual([
      { id: 'pionnier-2027', notifie: false },
    ]);
  });

  it("ne débloque pas le badge pour un bingo du 31 décembre de l'année précédente, à 23h59 UTC", () => {
    expect(pionnier2027DebloquePour('2026-12-31T23:59:59.000Z')).toEqual([]);
  });

  it("ne débloque pas le badge pour un bingo du 1er janvier de l'année suivante", () => {
    expect(pionnier2027DebloquePour('2028-01-01T00:00:00.000Z')).toEqual([]);
  });
});

describe('Pionnier annuel et déblocages simultanés', () => {
  const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;
  const TROIS_JOURS_MS = 3 * 24 * 60 * 60 * 1000;

  it("ne retourne que Pionnier 2028 quand Pionnier 2027 est déjà acquis et qu'un bingo est complété en 2028", () => {
    const resultat = calculerBadgesDebloques({
      archives: [
        creerArchive({ dateArchivage: '2027-06-10T12:00:00.000Z' }),
        creerArchive({ dateArchivage: '2028-02-10T12:00:00.000Z' }),
      ],
      catalogue: [
        { id: 'pionnier-2027', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1, fenetre: { type: 'anneeCivile', annee: 2027 } },
        { id: 'pionnier-2028', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1, fenetre: { type: 'anneeCivile', annee: 2028 } },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [{ id: 'pionnier-2027', notifie: true }] },
    });

    expect(resultat).toEqual([{ id: 'pionnier-2028', notifie: false }]);
  });

  it("débloque en une fois six badges de familles différentes, dans l'ordre du catalogue", () => {
    const resultat = calculerBadgesDebloques({
      archives: [
        creerArchive({
          dateArchivage: '2027-01-10T12:00:00.000Z',
          genres: ['romance'],
          dureeMs: TROIS_JOURS_MS,
          casesRenouveleesUtilisees: 0,
        }),
      ],
      catalogue: [
        { id: 'premier-pas', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1 },
        { id: 'bibliophile', type: 'quantitatif', champ: 'bingosCompletes', seuil: 10 },
        { id: 'au-coin-du-feu', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1, fenetre: { type: 'saison', debut: { mois: 12, jour: 21 }, fin: { mois: 3, jour: 19 } } },
        { id: 'pionnier-2027', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1, fenetre: { type: 'anneeCivile', annee: 2027 } },
        { id: 'eclair', type: 'exploit', critere: 'dureeMaxMs', seuil: SEPT_JOURS_MS },
        { id: 'sans-filet', type: 'exploit', critere: 'casesRenouveleesMax', seuil: 0 },
        { id: 'romantique', type: 'quantitatif', champ: 'bingosAvecGenre', genres: ['romance'], seuil: 1 },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [] },
    });

    expect(resultat.map((b) => b.id)).toEqual([
      'premier-pas',
      'au-coin-du-feu',
      'pionnier-2027',
      'eclair',
      'sans-filet',
      'romantique',
    ]);
  });

  it('ne retourne que les nouveaux badges quand certains sont déjà acquis', () => {
    const resultat = calculerBadgesDebloques({
      archives: [creerArchive({ dateArchivage: '2027-01-10T12:00:00.000Z' })],
      catalogue: [
        { id: 'premier-pas', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1 },
        { id: 'au-coin-du-feu', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1, fenetre: { type: 'saison', debut: { mois: 12, jour: 21 }, fin: { mois: 3, jour: 19 } } },
      ],
      dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
      progressionActuelle: { badgesDebloques: [{ id: 'premier-pas', notifie: true }] },
    });

    expect(resultat).toEqual([{ id: 'au-coin-du-feu', notifie: false }]);
  });
});

describe('appliquerBadgesDebloques', () => {
  it('ajoute tous les nouveaux badges à la progression et conserve ceux déjà acquis', () => {
    const progression = {
      badgesDebloques: [{ id: 'premier-pas', notifie: true }],
    };
    const nouveaux = [
      { id: 'eclair', notifie: false },
      { id: 'sans-filet', notifie: false },
    ];

    const resultat = appliquerBadgesDebloques(progression, nouveaux);

    expect(resultat).toEqual({
      badgesDebloques: [
        { id: 'premier-pas', notifie: true },
        { id: 'eclair', notifie: false },
        { id: 'sans-filet', notifie: false },
      ],
    });
  });
    it("ne crée aucun doublon quand le même lot de badges est appliqué deux fois", () => {
    const nouveaux = [
      { id: 'eclair', notifie: false },
      { id: 'sans-filet', notifie: false },
    ];

    const apresPremierAppel = appliquerBadgesDebloques({ badgesDebloques: [] }, nouveaux);
    const apresSecondAppel = appliquerBadgesDebloques(apresPremierAppel, nouveaux);

    expect(apresSecondAppel.badgesDebloques).toHaveLength(2);
    expect(apresSecondAppel).toEqual(apresPremierAppel);
  });
});