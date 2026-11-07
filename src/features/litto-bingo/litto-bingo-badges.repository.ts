// litto-bingo-badges.repository.ts

import type { BadgeDebloque, ProgressionBadges } from './litto-bingo-badges';

const CLE_STOCKAGE = 'litto-bingo:badges';

export interface ProgressionBadgesRepository {
  charger(): ProgressionBadges;
  sauvegarder(progression: ProgressionBadges): void;
}

export interface ProgressionBadgesPersistee {
  version: 1;
  badgesDebloques: { id: string; notifie: boolean }[];
}

function estBadgeDebloqueValide(valeur: unknown): valeur is BadgeDebloque {
  if (typeof valeur !== 'object' || valeur === null) return false;
  const { id, notifie } = valeur as Record<string, unknown>;
  return typeof id === 'string' && typeof notifie === 'boolean';
}

function versProgressionDomaine(brut: unknown): ProgressionBadges {
  if (typeof brut !== 'object' || brut === null) return { badgesDebloques: [] };

  const { badgesDebloques } = brut as Record<string, unknown>;
  if (!Array.isArray(badgesDebloques)) return { badgesDebloques: [] };

  return {
    badgesDebloques: badgesDebloques
      .filter(estBadgeDebloqueValide)
      .map(({ id, notifie }) => ({ id, notifie })),
  };
}

function versProgressionPersistee(progression: ProgressionBadges): ProgressionBadgesPersistee {
  return {
    version: 1,
    badgesDebloques: progression.badgesDebloques.map(({ id, notifie }) => ({ id, notifie })),
  };
}

export class LocalStorageProgressionBadgesRepository implements ProgressionBadgesRepository {
  charger(): ProgressionBadges {
    try {
      const contenu = localStorage.getItem(CLE_STOCKAGE);
      if (contenu === null) return { badgesDebloques: [] };
      return versProgressionDomaine(JSON.parse(contenu));
    } catch {
      return { badgesDebloques: [] };
    }
  }

  sauvegarder(progression: ProgressionBadges): void {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(versProgressionPersistee(progression)));
  }
}