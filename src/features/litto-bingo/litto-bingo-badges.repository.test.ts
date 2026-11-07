// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { LocalStorageProgressionBadgesRepository } from './litto-bingo-badges.repository';

describe('LocalStorageProgressionBadgesRepository', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('retourne une progression vide quand rien n\'est stocké', () => {
    const repository = new LocalStorageProgressionBadgesRepository();

    expect(repository.charger()).toEqual({ badgesDebloques: [] });
  });

  it('retrouve la progression sauvegardée, même avec une nouvelle instance', () => {
    const progression = {
      badgesDebloques: [
        { id: 'premier-pas', notifie: true },
        { id: 'bourgeon', notifie: false },
      ],
    };

    new LocalStorageProgressionBadgesRepository().sauvegarder(progression);

    expect(new LocalStorageProgressionBadgesRepository().charger()).toEqual(progression);
  });

  it('écrit le format versionné sous la clé litto-bingo:badges', () => {
    new LocalStorageProgressionBadgesRepository().sauvegarder({
      badgesDebloques: [{ id: 'eclair', notifie: false }],
    });

    expect(JSON.parse(localStorage.getItem('litto-bingo:badges') ?? 'null')).toEqual({
      version: 1,
      badgesDebloques: [{ id: 'eclair', notifie: false }],
    });
  });

  it.each(['pas du json{', '{"x":1}', '[]', 'null'])(
    'retourne une progression vide quand le contenu stocké est inexploitable (%s)',
    (contenu) => {
      localStorage.setItem('litto-bingo:badges', contenu);

      expect(new LocalStorageProgressionBadgesRepository().charger()).toEqual({
        badgesDebloques: [],
      });
    }
  );

  it('ignore les entrées invalides et conserve les valides', () => {
    localStorage.setItem(
      'litto-bingo:badges',
      JSON.stringify({
        version: 1,
        badgesDebloques: [
          { id: 'assidu', notifie: true },
          { notifie: true },
          { id: 42, notifie: false },
          { id: 'legende', notifie: 'oui' },
          null,
          { id: 'bourgeon', notifie: false },
        ],
      })
    );

    expect(new LocalStorageProgressionBadgesRepository().charger()).toEqual({
      badgesDebloques: [
        { id: 'assidu', notifie: true },
        { id: 'bourgeon', notifie: false },
      ],
    });
  });
});