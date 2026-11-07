/* Fichier : src/features/litto-bingo/components/BadgeVisuel.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import {
  BadgeVisuel,
  PICTOGRAMMES,
  TEINTES,
  type PictogrammeBadge,
  type TeinteBadge,
} from './BadgeVisuel';

const meta: Meta<typeof BadgeVisuel> = {
  title: 'LittoBingo/Atoms/BadgeVisuel',
  component: BadgeVisuel,
};
export default meta;

type Story = StoryObj<typeof BadgeVisuel>;

export const Debloque: Story = {
  args: { teinte: 'ambre', pictogramme: 'livre', titre: 'Premier pas' },
};

export const Verrouille: Story = {
  args: { teinte: 'ambre', pictogramme: 'livre', etat: 'verrouille', titre: 'Premier pas (verrouillé)' },
};

export const Decoratif: Story = {
  args: { teinte: 'brique', pictogramme: 'eclair' },
};

export const ToutesLesTeintes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {(Object.keys(TEINTES) as TeinteBadge[]).map((t) => (
        <BadgeVisuel key={t} teinte={t} pictogramme="etoile" titre={t} />
      ))}
    </div>
  ),
};

export const TousLesPictogrammes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {(Object.keys(PICTOGRAMMES) as PictogrammeBadge[]).map((p) => (
        <BadgeVisuel key={p} teinte="ambre" pictogramme={p} titre={p} />
      ))}
    </div>
  ),
};