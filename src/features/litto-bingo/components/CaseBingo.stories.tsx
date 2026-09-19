/* Fichier : src/features/litto-bingo/components/CaseBingo.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { CaseBingo } from './CaseBingo';

const meta: Meta<typeof CaseBingo> = {
  title: 'LittoBingo/Atoms/CaseBingo',
  component: CaseBingo,
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof CaseBingo>;

export const NonCochee: Story = {
  args: {
    consigneTexte: 'Un livre avec une sorcière',
    cochee: false,
    livre: null,
    onCliquer: () => {},
  },
};

export const Cochee: Story = {
  args: {
    consigneTexte: 'Un livre qui se passe en hiver',
    cochee: true,
    livre: 'La Servante Écarlate',
    onCliquer: () => {},
  },
};

export const Desactivee: Story = {
  args: {
    consigneTexte: 'Un livre avec du rouge dans le titre',
    cochee: false,
    livre: null,
    disabled: true,
    onCliquer: () => {},
  },
};

export const DansUneGrilleEtroite: Story = {
  render: () => (
    <div style={{ width: '55px' }}>
      <CaseBingo
        consigneTexte="Une héroïne badass"
        cochee={false}
        livre={null}
        onCliquer={() => {}}
      />
    </div>
  ),
};