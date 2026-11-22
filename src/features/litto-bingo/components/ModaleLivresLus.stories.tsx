/* Fichier : src/features/litto-bingo/components/ModaleLivresLus.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { ModaleLivresLus } from './ModaleLivresLus';

const meta: Meta<typeof ModaleLivresLus> = {
  title: 'LittoBingo/Organisms/ModaleLivresLus',
  component: ModaleLivresLus,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ModaleLivresLus>;

const livres = [
  { titre: 'Alice', nombreBingos: 1, similaires: [] },
  { titre: 'Dune', nombreBingos: 2, similaires: ['dune '] },
  { titre: 'dune ', nombreBingos: 1, similaires: ['Dune'] },
];

const bingos = [
  { id: 'b1', statut: 'complete' as const, taille: 3, dateArchivage: '2027-01-05T08:00:00.000Z', livres: ['Dune', 'Alice'] },
  { id: 'b2', statut: 'abandonne' as const, taille: 3, dateArchivage: '2027-02-10T10:00:00.000Z', livres: ['dune '] },
];

export const Ouverte: Story = {
  args: { ouverte: true, livres, bingos, onFermer: () => console.log('fermer') },
};

export const Vide: Story = {
  args: { ouverte: true, livres: [], bingos: [], onFermer: () => {} },
};