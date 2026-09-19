/* Fichier : src/features/litto-bingo/components/PageBingo.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { PageBingo } from './PageBingo';

const consignesDemo = Array.from({ length: 30 }, (_, i) => ({
  id: `demo-${i}`,
  texte: `Consigne de démo ${i + 1}`,
  genre: 'roman',
}));

const consignesLimitees = Array.from({ length: 12 }, (_, i) => ({
  id: `manga-${i}`,
  texte: `Consigne manga ${i + 1}`,
  genre: 'manga',
}));

const meta: Meta<typeof PageBingo> = {
  title: 'LittoBingo/Templates/PageBingo',
  component: PageBingo,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof PageBingo>;

export const Standard: Story = {
  args: { consignesDisponibles: consignesDemo },
};

export const AvecDateDeFin: Story = {
  args: {
    consignesDisponibles: consignesDemo,
    dateFin: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  },
};

export const GenerationLimitee: Story = {
  args: {
    consignesDisponibles: [...consignesDemo, ...consignesLimitees],
    genre: 'manga',
  },
};

export const AucuneConsigneDisponible: Story = {
  args: { consignesDisponibles: [], genre: 'inexistant' },
};