/* Fichier : src/features/litto-bingo/components/PageBadges.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { PageBadges } from './PageBadges';
import type { BadgeAffiche } from './ListeBadges';

const meta: Meta<typeof PageBadges> = {
  title: 'LittoBingo/Templates/PageBadges',
  component: PageBadges,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof PageBadges>;

const badges: BadgeAffiche[] = [
  { id: 'premier-pas', famille: 'permanent', nom: 'Premier pas', description: 'Complète ton premier bingo.', teinte: 'ambre', pictogramme: 'etoile', etat: 'debloque' },
  { id: 'bibliophile', famille: 'permanent', nom: 'Bibliophile', description: 'Complète 10 bingos.', teinte: 'ambre', pictogramme: 'coeur', etat: 'verrouille', progression: { valeur: 4, seuil: 10 } },
  { id: 'feuilles-et-chapitres', famille: 'saisonnier', nom: 'Feuilles et chapitres', description: 'Complète un bingo en automne.', teinte: 'automne', pictogramme: 'feuille', etat: 'debloque' },
  { id: 'pionnier-2027', famille: 'pionnier', nom: 'Pionnier 2027', description: 'Complète un bingo en 2027.', teinte: 'violet', pictogramme: 'drapeau', etat: 'verrouille', progression: { valeur: 0, seuil: 1 } },
];

export const Standard: Story = {
  args: { badges, onRetour: () => console.log('retour'), onExporterBadge: (id) => console.log('export', id) },
};

export const AucunBadge: Story = {
  args: { badges: badges.map((b) => ({ ...b, etat: 'verrouille' as const })), onRetour: () => {} },
};