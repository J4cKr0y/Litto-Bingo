/* Fichier : src/features/litto-bingo/components/FormulaireNouveauBingo.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { FormulaireNouveauBingo } from './FormulaireNouveauBingo';

const meta: Meta<typeof FormulaireNouveauBingo> = {
  title: 'LittoBingo/Molecules/FormulaireNouveauBingo',
  component: FormulaireNouveauBingo,
};
export default meta;

type Story = StoryObj<typeof FormulaireNouveauBingo>;

export const Standard: Story = {
  args: {
    genresDisponibles: ['roman', 'policier', 'manga', 'sfff'],
    onValider: (options) => console.log('Validé :', options),
  },
};