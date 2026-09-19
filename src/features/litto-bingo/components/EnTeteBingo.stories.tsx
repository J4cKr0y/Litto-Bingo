/* Fichier : src/features/litto-bingo/components/EnTeteBingo.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { EnTeteBingo } from './EnTeteBingo';
import { genererGrille, type Grille } from '../litto-bingo';

const consignesDemo = Array.from({ length: 25 }, (_, i) => ({
  id: `demo-${i}`,
  texte: `Consigne de démo ${i + 1}`,
  genre: 'roman',
}));

const meta: Meta<typeof EnTeteBingo> = {
  title: 'LittoBingo/Organisms/EnTeteBingo',
  component: EnTeteBingo,
};
export default meta;

type Story = StoryObj<typeof EnTeteBingo>;

function grilleAvec(pourcentage: number, dateFin: Date | null): Grille {
  const g = genererGrille(consignesDemo)!;
  const nbACocher = Math.round((pourcentage / 100) * g.cases.length);
  for (let i = 0; i < nbACocher; i++) {
    g.cases[i].cochee = true;
    g.cases[i].livre = `Livre ${i}`;
  }
  g.dateFin = dateFin;
  return g;
}

export const SansDateDeFin: Story = {
  render: () => <EnTeteBingo grille={grilleAvec(30, null)} />,
};

export const AvecDateDeFinLointaine: Story = {
  render: () => (
    <EnTeteBingo grille={grilleAvec(50, new Date(Date.now() + 20 * 24 * 60 * 60 * 1000))} />
  ),
};

export const AvecDateDeFinUrgente: Story = {
  render: () => (
    <EnTeteBingo grille={grilleAvec(80, new Date(Date.now() + 10 * 60 * 60 * 1000))} />
  ),
};

export const DansUnConteneurEtroit: Story = {
  render: () => (
    <div style={{ width: '320px' }}>
      <EnTeteBingo grille={grilleAvec(40, new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))} />
    </div>
  ),
};