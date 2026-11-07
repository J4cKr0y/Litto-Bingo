/* Fichier : src/features/litto-bingo/components/NotificationBadge.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { NotificationBadge } from './NotificationBadge';

const meta: Meta<typeof NotificationBadge> = {
  title: 'LittoBingo/Molecules/NotificationBadge',
  component: NotificationBadge,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '28rem' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof NotificationBadge>;

const base = {
  nom: 'Éclair',
  description: 'Complète un bingo en 7 jours maximum.',
  teinte: 'brique',
  pictogramme: 'eclair',
  onFermer: () => console.log('fermer'),
} as const;

export const Standard: Story = {
  args: { ...base, onVoirBadges: () => console.log('voir les badges') },
};

export const SansBoutonVoir: Story = {
  args: { ...base },
};

export const NomEtDescriptionLongs: Story = {
  args: {
    ...base,
    nom: 'Explorateur brumeux extraordinairement bavard',
    description:
      'Lis au moins 3 genres différents pendant le même automne, y compris ceux que tu ne connaissais pas.',
    teinte: 'automne',
    pictogramme: 'boussole',
    onVoirBadges: () => {},
  },
};