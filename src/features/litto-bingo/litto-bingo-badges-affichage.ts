import type { BingoArchive } from './litto-bingo-archive';
import {
  calculerAvancementBadge,
  familleBadge,
  type AvancementBadge,
  type DefinitionBadge,
  type FamilleBadge,
  type ProgressionBadges,
} from './litto-bingo-badges';
import type { PresentationBadge } from './litto-bingo-badges-presentation';
import type { EtatBadge, PictogrammeBadge, TeinteBadge } from './components/BadgeVisuel';

/** Un badge tel que l'interface l'affiche : tout est déjà calculé et traduit. */
export interface BadgeAffiche {
  id: string;
  famille: FamilleBadge;
  nom: string;
  description: string;
  teinte: TeinteBadge;
  pictogramme: PictogrammeBadge;
  etat: EtatBadge;
  progression?: AvancementBadge;
}

export interface ParamsBadgesAffiches {
  catalogue: DefinitionBadge[];
  progression: ProgressionBadges;
  archives: BingoArchive[];
  dateActivationBadges: Date;
  maintenant: Date;
  /** Fournit nom, condition et visuel d'un badge : injecté pour ne pas dépendre de Lingui ici. */
  obtenirPresentation: (id: string) => PresentationBadge;
}

/** Un badge d'année civile dont l'année est révolue ne pourra plus jamais être obtenu. */
function estDefinitivementManque(badge: DefinitionBadge, maintenant: Date): boolean {
  return (
    badge.fenetre?.type === 'anneeCivile' && badge.fenetre.annee < maintenant.getUTCFullYear()
  );
}

export function construireBadgesAffiches({
  catalogue,
  progression,
  archives,
  dateActivationBadges,
  maintenant,
  obtenirPresentation,
}: ParamsBadgesAffiches): BadgeAffiche[] {
  const idsDebloques = new Set(progression.badgesDebloques.map((b) => b.id));

  return catalogue
    .filter((badge) => idsDebloques.has(badge.id) || !estDefinitivementManque(badge, maintenant))
    .map((badge): BadgeAffiche => {
      const base = {
        id: badge.id,
        famille: familleBadge(badge),
        ...obtenirPresentation(badge.id),
      };

      if (idsDebloques.has(badge.id)) {
        return { ...base, etat: 'debloque' };
      }

      const avancement = calculerAvancementBadge({ badge, archives, dateActivationBadges, maintenant });
      return avancement
        ? { ...base, etat: 'verrouille', progression: avancement }
        : { ...base, etat: 'verrouille' };
    });
}