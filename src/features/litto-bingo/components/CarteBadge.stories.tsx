/* Fichier : src/features/litto-bingo/components/CarteBadge.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { CarteBadge } from './CarteBadge';

const meta: Meta<typeof CarteBadge> = {
  title: 'LittoBingo/Molecules/CarteBadge',
  component: CarteBadge,
  decorators: [
    (Story) => (
      <div style={{ width: '24rem' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof CarteBadge>;

const base = {
  nom: 'Bibliophile',
  description: 'Complète 10 bingos.',
  teinte: 'ambre',
  pictogramme: 'coeur',
} as const;

export const Debloque: Story = {
  args: { ...base, etat: 'debloque', onExporter: () => console.log('export') },
};

export const VerrouilleAvecProgression: Story = {
  args: { ...base, etat: 'verrouille', progression: { valeur: 7, seuil: 10 } },
};

export const VerrouilleSansProgression: Story = {
  args: {
    nom: 'Éclair',
    description: 'Complète un bingo en 7 jours maximum.',
    teinte: 'brique',
    pictogramme: 'eclair',
    etat: 'verrouille',
  },
};

export const ExportEchoue: Story = {
  args: { ...base, etat: 'debloque', onExporter: () => {}, exportEchoue: true },
};

export const ConteneurEtroit: Story = {
  args: { ...base, etat: 'verrouille', progression: { valeur: 3, seuil: 10 } },
  decorators: [
    (Story) => (
      <div style={{ width: '12rem' }}>
        <Story />
      </div>
    ),
  ],
};