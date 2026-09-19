/* Fichier : src/features/litto-bingo/components/FormulaireLivre.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormulaireLivre } from './FormulaireLivre';

const meta: Meta<typeof FormulaireLivre> = {
  title: 'LittoBingo/Molecules/FormulaireLivre',
  component: FormulaireLivre,
};
export default meta;

type Story = StoryObj<typeof FormulaireLivre>;

export const Ouvert: Story = {
  render: () => {
    const [ouvert, setOuvert] = useState(true);
    return (
      <FormulaireLivre
        ouvert={ouvert}
        consigneTexte="Un livre avec une sorcière"
        onValider={(livre) => {
          console.log('Validé :', livre);
          setOuvert(false);
        }}
        onAnnuler={() => setOuvert(false)}
      />
    );
  },
};

export const AvecErreurDeValidation: Story = {
  render: () => (
    <FormulaireLivre
      ouvert={true}
      consigneTexte="Un livre qui se passe en hiver"
      onValider={() => {}}
      onAnnuler={() => {}}
    />
  ),
  play: async ({ canvasElement }) => {
    const bouton = canvasElement.querySelector<HTMLButtonElement>(
      '.formulaire-livre__bouton-valider'
    );
    bouton?.click(); // soumission vide pour déclencher l'erreur
  },
};

export const DeclencheParUnBouton: Story = {
  render: () => {
    const [ouvert, setOuvert] = useState(false);
    return (
      <>
        <button onClick={() => setOuvert(true)}>Ouvrir le formulaire</button>
        <FormulaireLivre
          ouvert={ouvert}
          consigneTexte="Une héroïne badass"
          onValider={() => setOuvert(false)}
          onAnnuler={() => setOuvert(false)}
        />
      </>
    );
  },
};