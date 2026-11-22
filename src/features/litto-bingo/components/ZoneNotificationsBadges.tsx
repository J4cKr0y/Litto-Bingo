/* Fichier : src/features/litto-bingo/components/ZoneNotificationsBadges.tsx */
import { useEffect, useRef } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { NotificationBadge } from './NotificationBadge';
import type { PictogrammeBadge, TeinteBadge } from './BadgeVisuel';
import '../styles/utilitaires.css';
import '../styles/ZoneNotificationsBadges.css';

export interface NotificationAffichee {
  id: string;
  nom: string;
  description: string;
  teinte: TeinteBadge;
  pictogramme: PictogrammeBadge;
}

export interface ZoneNotificationsBadgesProps {
  notifications: NotificationAffichee[];
  onFermer: (id: string) => void;
  onToutFermer?: () => void;
  onVoirBadges?: () => void;
}

export function ZoneNotificationsBadges({
  notifications,
  onFermer,
  onToutFermer,
  onVoirBadges,
}: ZoneNotificationsBadgesProps) {
  useLingui(); // abonne le composant aux changements de langue
  const liste = useRef<HTMLUListElement>(null);
  const indexARestaurer = useRef<number | null>(null);

  // Après une fermeture, redonne le focus à la notification voisine (sinon il retombe sur la page).
  useEffect(() => {
    if (indexARestaurer.current === null) return;
    const index = indexARestaurer.current;
    indexARestaurer.current = null;

    const elements = liste.current?.querySelectorAll('li');
    if (!elements || elements.length === 0) return;

    const cible = elements[Math.min(index, elements.length - 1)];
    const boutons = cible.querySelectorAll('button');
    boutons[boutons.length - 1]?.focus();
  }, [notifications]);

  // Raccourci : Échap ferme la notification qui a le focus, sinon celle du haut de la pile.
  useEffect(() => {
    if (notifications.length === 0) return;

    function surTouche(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
      // Une boîte de dialogue ouverte gère Échap elle-même : on ne ferme rien en plus.
      if (document.querySelector('dialog[open]')) return;

      const elements = Array.from(liste.current?.querySelectorAll('li') ?? []);
      const indexFocus = elements.findIndex((li) => li.contains(document.activeElement));
      const focusDansLaPile = indexFocus !== -1;
      const index = focusDansLaPile ? indexFocus : 0;
      const notification = notifications[index];
      if (!notification) return;

      event.preventDefault();
      // On ne déplace le focus que s'il était déjà dans la pile.
      indexARestaurer.current = focusDansLaPile ? index : null;
      onFermer(notification.id);
    }

    document.addEventListener('keydown', surTouche);
    return () => document.removeEventListener('keydown', surTouche);
  }, [notifications, onFermer]);

  function fermer(id: string, index: number) {
    indexARestaurer.current = index;
    onFermer(id);
  }

  return (
    <>
      {/* Région vocale toujours présente : l'ajout de contenu y est annoncé aux lecteurs d'écran. */}
      <div role="status" className="visuellement-cache">
        {notifications.map((notification) => (
          <p key={notification.id}>{t`Badge débloqué : ${notification.nom}`}</p>
        ))}
      </div>

      {notifications.length > 0 && (
        <section className="zone-notifications-badges" aria-label={t`Nouveaux badges`}>
          {notifications.length > 1 && onToutFermer && (
            <button
              type="button"
              className="zone-notifications-badges__tout-fermer"
              onClick={onToutFermer}
            >
              <Trans>Tout fermer</Trans>
            </button>
          )}

          <ul ref={liste} className="zone-notifications-badges__liste" role="list">
            {notifications.map((notification, index) => (
              <li key={notification.id}>
                <NotificationBadge
                  nom={notification.nom}
                  description={notification.description}
                  teinte={notification.teinte}
                  pictogramme={notification.pictogramme}
                  onFermer={() => fermer(notification.id, index)}
                  onVoirBadges={onVoirBadges}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}