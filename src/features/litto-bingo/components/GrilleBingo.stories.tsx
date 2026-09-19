/* Fichier : src/features/litto-bingo/components/GrilleBingo.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { GrilleBingo } from './GrilleBingo';
import { genererGrille, type Grille } from '../litto-bingo';

const consignesDemo = Array.from({ length: 25 }, (_, i) => ({
  id: `demo-${i}`,
  texte: `Consigne de démo ${i + 1}`,
  genre: 'roman',
}));

const meta: Meta<typeof GrilleBingo> = {
  title: 'LittoBingo/Organisms/GrilleBingo',
  component: GrilleBingo,
};
export default meta;

type Story = StoryObj<typeof GrilleBingo>;

export const Interactive: Story = {
  render: () => {
    const [grille, setGrille] = useState<Grille>(() => genererGrille(consignesDemo)!);
    return <GrilleBingo grille={grille} onGrilleChangee={setGrille} />;
  },
};

export const PartiellementCompletee: Story = {
  render: () => {
    const [grille, setGrille] = useState<Grille>(() => {
      const g = genererGrille(consignesDemo)!;
      g.cases[0].cochee = true;
      g.cases[0].livre = 'Le Nom de la Rose';
      g.cases[6].cochee = true;
      g.cases[6].livre = 'Frankenstein';
      return g;
    });
    return <GrilleBingo grille={grille} onGrilleChangee={setGrille} />;
  },
};

export const Expiree: Story = {
  render: () => {
    const [grille, setGrille] = useState<Grille>(() => {
      const g = genererGrille(consignesDemo)!;
      g.dateFin = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return g;
    });
    return <GrilleBingo grille={grille} onGrilleChangee={setGrille} />;
  },
};