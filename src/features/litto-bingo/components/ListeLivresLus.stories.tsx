/* Fichier : src/features/litto-bingo/components/ListeLivresLus.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { ListeLivresLus } from './ListeLivresLus';

const meta: Meta<typeof ListeLivresLus> = {
  title: 'LittoBingo/Organisms/ListeLivresLus',
  component: ListeLivresLus,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '32rem' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ListeLivresLus>;

const livres = [
  { titre: 'Alice', nombreBingos: 1, similaires: [] },
  { titre: 'Dune', nombreBingos: 2, similaires: ['dune '] },
  { titre: 'dune ', nombreBingos: 1, similaires: ['Dune'] },
  { titre: 'Zorro', nombreBingos: 1, similaires: [] },
];

const bingos = [
  { id: 'b1', statut: 'complete' as const, taille: 3, dateArchivage: '2027-01-05T08:00:00.000Z', livres: ['Dune', 'Alice'] },
  { id: 'b2', statut: 'abandonne' as const, taille: 3, dateArchivage: '2027-02-10T10:00:00.000Z', livres: ['dune ', 'Zorro'] },
  { id: 'b3', statut: 'complete' as const, taille: 3, dateArchivage: undefined, livres: [] },
];

export const Standard: Story = { args: { livres, bingos } };
export const Vide: Story = { args: { livres: [], bingos: [] } };
export const SansProches: Story = {
  args: { livres: livres.filter((l) => l.similaires.length === 0), bingos },
};