/* Fichier : src/features/litto-bingo/components/NotificationBadge.tsx */
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { BadgeVisuel, type PictogrammeBadge, type TeinteBadge } from './BadgeVisuel';
import '../styles/NotificationBadge.css';
import '../styles/utilitaires.css';

export interface NotificationBadgeProps {
  nom: string;
  description: string;
  teinte: TeinteBadge;
  pictogramme: PictogrammeBadge;
  onFermer: () => void;
  /** Le bouton « Voir mes badges » n'apparaît que si ce rappel est fourni. */
  onVoirBadges?: () => void;
}

export function NotificationBadge({
  nom,
  description,
  teinte,
  pictogramme,
  onFermer,
  onVoirBadges,
}: NotificationBadgeProps) {
  useLingui(); // abonne le composant aux changements de langue

  return (
    <article className="notification-badge">
      <div className="notification-badge__sceau">
        <BadgeVisuel teinte={teinte} pictogramme={pictogramme} />
      </div>

      <div className="notification-badge__contenu">
        <p className="notification-badge__titre">
          <Trans>Badge débloqué !</Trans>
        </p>
        <p className="notification-badge__nom">{nom}</p>
        <p className="notification-badge__description">{description}</p>

        <div className="notification-badge__actions">
          {onVoirBadges && (
            <button
              type="button"
              className="notification-badge__bouton notification-badge__bouton--principal"
              onClick={onVoirBadges}
            >
              <Trans>Voir mes badges</Trans>
            </button>
          )}
          <button type="button" className="notification-badge__bouton" onClick={onFermer}>
            <Trans>Fermer</Trans>
            <span className="visuellement-cache"> — {nom}</span>
          </button>
        </div>
      </div>
    </article>
  );
}