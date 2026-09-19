/* Fichier : src/features/litto-bingo/components/CompteARebours.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { CompteARebours } from './CompteARebours';

const meta: Meta<typeof CompteARebours> = {
  title: 'LittoBingo/Atoms/CompteARebours',
  component: CompteARebours,
};
export default meta;

type Story = StoryObj<typeof CompteARebours>;

export const LoinDansLeFutur: Story = {
  args: { dateFin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
};

export const Urgent: Story = {
  args: { dateFin: new Date(Date.now() + 18 * 60 * 60 * 1000) },
};

export const Expire: Story = {
  args: { dateFin: new Date(Date.now() - 24 * 60 * 60 * 1000) },
};

export const SansDateDeFin: Story = {
  args: { dateFin: null },
};