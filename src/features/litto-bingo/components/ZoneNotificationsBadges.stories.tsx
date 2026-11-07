/* Fichier : src/features/litto-bingo/components/ZoneNotificationsBadges.stories.tsx */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ZoneNotificationsBadges, type NotificationAffichee } from './ZoneNotificationsBadges';

const meta: Meta<typeof ZoneNotificationsBadges> = {
  title: 'LittoBingo/Organisms/ZoneNotificationsBadges',
  component: ZoneNotificationsBadges,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ZoneNotificationsBadges>;

const toutes: NotificationAffichee[] = [
  { id: 'premier-pas', nom: 'Premier pas', description: 'Complète ton premier bingo.', teinte: 'ambre', pictogramme: 'etoile' },
  { id: 'eclair', nom: 'Éclair', description: 'Complète un bingo en 7 jours maximum.', teinte: 'brique', pictogramme: 'eclair' },
  { id: 'sans-filet', nom: 'Sans filet', description: 'Complète un bingo sans renouveler aucune consigne.', teinte: 'brique', pictogramme: 'cible' },
  { id: 'feuilles-et-chapitres', nom: 'Feuilles et chapitres', description: 'Complète un bingo en automne.', teinte: 'automne', pictogramme: 'feuille' },
  { id: 'pionnier-2027', nom: 'Pionnier 2027', description: 'Complète un bingo en 2027.', teinte: 'violet', pictogramme: 'drapeau' },
  { id: 'reveil-litteraire', nom: 'Réveil littéraire', description: 'Complète au printemps un bingo contenant de la romance.', teinte: 'printemps', pictogramme: 'coeur' },
];

export const UneSeule: Story = {
  args: { notifications: [toutes[0]], onFermer: () => {}, onVoirBadges: () => {} },
};

export const Plusieurs: Story = {
  args: { notifications: toutes, onFermer: () => {}, onToutFermer: () => {}, onVoirBadges: () => {} },
};

function Interactive() {
  const [notifications, setNotifications] = useState(toutes);
  return (
    <ZoneNotificationsBadges
      notifications={notifications}
      onFermer={(id) => setNotifications((liste) => liste.filter((n) => n.id !== id))}
      onToutFermer={() => setNotifications([])}
      onVoirBadges={() => console.log('voir les badges')}
    />
  );
}

export const Interactive_: Story = { render: () => <Interactive /> };