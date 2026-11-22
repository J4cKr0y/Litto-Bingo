import type { BingoArchive } from './litto-bingo-archive';
import {
  appliquerBadgesDebloques,
  calculerBadgesDebloques,
  marquerBadgeNotifie,
  type DefinitionBadge,
  type ProgressionBadges,
} from './litto-bingo-badges';

export interface DependancesDeblocage {
  archives: {
    listerArchives(): Promise<BingoArchive[]>;
  };
  progression: {
    charger(): Promise<ProgressionBadges>;
    sauvegarder(progression: ProgressionBadges): Promise<void>;
  };
}

export interface ParamsDeblocage {
  catalogue: DefinitionBadge[];
  dateActivationBadges: Date;
}

/** Calcule les badges débloqués par les archives, les enregistre, et rend leurs identifiants. */
export async function debloquerBadges(
  { catalogue, dateActivationBadges }: ParamsDeblocage,
  depots: DependancesDeblocage
): Promise<string[]> {
  const archives = await depots.archives.listerArchives();
  const progressionActuelle = await depots.progression.charger();

  const nouveaux = calculerBadgesDebloques({
    archives,
    catalogue,
    dateActivationBadges,
    progressionActuelle,
  });
  if (nouveaux.length === 0) return [];

  // Le badge est annoncé tout de suite : on le marque notifié dans la même écriture.
  const misAJour = nouveaux.reduce(
    (progression, badge) => marquerBadgeNotifie(progression, badge.id),
    appliquerBadgesDebloques(progressionActuelle, nouveaux)
  );
  await depots.progression.sauvegarder(misAJour);

  return nouveaux.map((badge) => badge.id);
}