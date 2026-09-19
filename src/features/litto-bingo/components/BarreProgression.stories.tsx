/* Fichier : src/features/litto-bingo/components/BarreProgression.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { BarreProgression } from './BarreProgression';

const meta: Meta<typeof BarreProgression> = {
  title: 'LittoBingo/Molecules/BarreProgression',
  component: BarreProgression,
};
export default meta;

type Story = StoryObj<typeof BarreProgression>;

export const Debut: Story = {
  args: { casesCochees: 0, casesTotal: 25 },
};

export const MiParcours: Story = {
  args: { casesCochees: 12, casesTotal: 25 },
};

export const PresqueComplet: Story = {
  args: { casesCochees: 24, casesTotal: 25 },
};

export const Complet: Story = {
  args: { casesCochees: 25, casesTotal: 25 },
};

export const DansUnConteneurEtroit: Story = {
  render: () => (
    <div style={{ width: '160px' }}>
      <BarreProgression casesCochees={8} casesTotal={25} />
    </div>
  ),
};