/* Fichier : src/features/litto-bingo/components/ListeBadges.tsx */
import { useId } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { CarteBadge, type ProgressionAffichee } from './CarteBadge';
import type { EtatBadge, PictogrammeBadge, TeinteBadge } from './BadgeVisuel';
import '../styles/ListeBadges.css';

export type FamilleBadge = 'permanent' | 'saisonnier' | 'pionnier';

export interface BadgeAffiche {
  id: string;
  famille: FamilleBadge;
  nom: string;
  description: string;
  teinte: TeinteBadge;
  pictogramme: PictogrammeBadge;
  etat: EtatBadge;
  progression?: ProgressionAffichee;
}

export interface ListeBadgesProps {
  badges: BadgeAffiche[];
  onExporterBadge?: (id: string) => void;
  /** Identifiant du badge dont le dernier export a échoué, s'il y en a un. */
  idExportEchoue?: string | null;
}

const ORDRE_FAMILLES: FamilleBadge[] = ['permanent', 'saisonnier', 'pionnier'];

function titreFamille(famille: FamilleBadge): string {
  switch (famille) {
    case 'permanent':
      return t`Badges permanents`;
    case 'saisonnier':
      return t`Badges de saison`;
    case 'pionnier':
      return t`Pionnier de l’année`;
  }
}

export function ListeBadges({ badges, onExporterBadge, idExportEchoue = null }: ListeBadgesProps) {
  useLingui(); // abonne le composant aux changements de langue
  const idBase = useId();
  const total = badges.length;
  const debloques = badges.filter((b) => b.etat === 'debloque').length;

  return (
    <div className="liste-badges">
      <p className="liste-badges__resume">{t`Badges débloqués : ${debloques} sur ${total}`}</p>

      {debloques === 0 && (
        <p className="liste-badges__vide">
          <Trans>Aucun badge pour l’instant : complète un bingo pour débloquer le premier !</Trans>
        </p>
      )}

      {ORDRE_FAMILLES.map((famille) => {
        const badgesFamille = badges.filter((b) => b.famille === famille);
        if (badgesFamille.length === 0) return null;
        const idTitre = `${idBase}-${famille}`;

        return (
          <section key={famille} className="liste-badges__section" aria-labelledby={idTitre}>
            <h2 id={idTitre} className="liste-badges__titre">
              {titreFamille(famille)}
            </h2>
            <ul className="liste-badges__grille" role="list">
              {badgesFamille.map((badge) => (
                <li key={badge.id}>
                  <CarteBadge
                    nom={badge.nom}
                    description={badge.description}
                    teinte={badge.teinte}
                    pictogramme={badge.pictogramme}
                    etat={badge.etat}
                    progression={badge.progression}
                    onExporter={onExporterBadge ? () => onExporterBadge(badge.id) : undefined}
                    exportEchoue={idExportEchoue === badge.id}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}