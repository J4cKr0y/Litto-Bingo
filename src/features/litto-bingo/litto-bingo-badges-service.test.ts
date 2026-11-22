import { describe, it, expect, vi } from 'vitest';
import type { BingoArchive } from './litto-bingo-archive';
import type { DefinitionBadge, ProgressionBadges } from './litto-bingo-badges';
import { debloquerBadges, type DependancesDeblocage } from './litto-bingo-badges-service';
import { creerArchive } from './litto-bingo-test-utils';

const DATE_ACTIVATION = new Date('2026-01-01T00:00:00Z');

const PREMIER_PAS: DefinitionBadge = {
  id: 'premier-pas',
  type: 'quantitatif',
  champ: 'bingosCompletes',
  seuil: 1,
};

function creerDepots(
  archives: BingoArchive[] = [],
  progressionInitiale: ProgressionBadges = { badgesDebloques: [] }
) {
  let stockee = progressionInitiale;
  return {
    archives: { listerArchives: vi.fn(async () => archives) },
    progression: {
      charger: vi.fn(async () => stockee),
      sauvegarder: vi.fn(async (progression: ProgressionBadges) => {
        stockee = progression;
      }),
    },
  } satisfies DependancesDeblocage;
}

describe('debloquerBadges', () => {
  it("ne retourne rien et n'écrit rien quand aucun badge n'est atteint", async () => {
    const depots = creerDepots([]);

    const resultat = await debloquerBadges(
      { catalogue: [PREMIER_PAS], dateActivationBadges: DATE_ACTIVATION },
      depots
    );

    expect(resultat).toEqual([]);
    expect(depots.progression.sauvegarder).not.toHaveBeenCalled();
  });
  it("enregistre un badge atteint, déjà marqué notifié, et le retourne", async () => {
    const depots = creerDepots([creerArchive()]);

    const resultat = await debloquerBadges(
      { catalogue: [PREMIER_PAS], dateActivationBadges: DATE_ACTIVATION },
      depots
    );

    expect(resultat).toEqual(['premier-pas']);
    expect(depots.progression.sauvegarder).toHaveBeenCalledTimes(1);
    expect(depots.progression.sauvegarder).toHaveBeenCalledWith({
      badgesDebloques: [{ id: 'premier-pas', notifie: true }],
    });
  });
  it("enregistre en une seule écriture plusieurs badges atteints, dans l'ordre du catalogue", async () => {
    const SANS_FILET: DefinitionBadge = {
      id: 'sans-filet',
      type: 'exploit',
      critere: 'casesRenouveleesMax',
      seuil: 0,
    };
    const BIBLIOPHILE: DefinitionBadge = {
      id: 'bibliophile',
      type: 'quantitatif',
      champ: 'bingosCompletes',
      seuil: 10,
    };
    const depots = creerDepots([creerArchive()]);

    const resultat = await debloquerBadges(
      { catalogue: [PREMIER_PAS, BIBLIOPHILE, SANS_FILET], dateActivationBadges: DATE_ACTIVATION },
      depots
    );

    expect(resultat).toEqual(['premier-pas', 'sans-filet']);
    expect(depots.progression.sauvegarder).toHaveBeenCalledTimes(1);
    expect(depots.progression.sauvegarder).toHaveBeenCalledWith({
      badgesDebloques: [
        { id: 'premier-pas', notifie: true },
        { id: 'sans-filet', notifie: true },
      ],
    });
  });

  it("conserve les badges déjà enregistrés tels quels et ne marque que les nouveaux", async () => {
    const depots = creerDepots([creerArchive()], {
      badgesDebloques: [
        { id: 'assidu', notifie: true },
        { id: 'ancien-non-notifie', notifie: false },
      ],
    });

    const resultat = await debloquerBadges(
      { catalogue: [PREMIER_PAS], dateActivationBadges: DATE_ACTIVATION },
      depots
    );

    expect(resultat).toEqual(['premier-pas']);
    expect(depots.progression.sauvegarder).toHaveBeenCalledWith({
      badgesDebloques: [
        { id: 'assidu', notifie: true },
        { id: 'ancien-non-notifie', notifie: false },
        { id: 'premier-pas', notifie: true },
      ],
    });
  });

  it("est idempotente : un second appel identique ne retourne rien et n'écrit rien de plus", async () => {
    const depots = creerDepots([creerArchive()]);
    const params = { catalogue: [PREMIER_PAS], dateActivationBadges: DATE_ACTIVATION };

    const premier = await debloquerBadges(params, depots);
    const second = await debloquerBadges(params, depots);

    expect(premier).toEqual(['premier-pas']);
    expect(second).toEqual([]);
    expect(depots.progression.sauvegarder).toHaveBeenCalledTimes(1);
  });

  it("ne compte pas une archive antérieure à la date d'activation des badges", async () => {
    const depots = creerDepots([creerArchive({ dateArchivage: '2025-12-31T23:59:59.000Z' })]);

    const resultat = await debloquerBadges(
      { catalogue: [PREMIER_PAS], dateActivationBadges: DATE_ACTIVATION },
      depots
    );

    expect(resultat).toEqual([]);
    expect(depots.progression.sauvegarder).not.toHaveBeenCalled();
  });

  it("laisse remonter l'erreur quand la sauvegarde échoue", async () => {
    const depots = creerDepots([creerArchive()]);
    depots.progression.sauvegarder.mockRejectedValue(new Error('stockage plein'));

    await expect(
      debloquerBadges({ catalogue: [PREMIER_PAS], dateActivationBadges: DATE_ACTIVATION }, depots)
    ).rejects.toThrow('stockage plein');
  });
});