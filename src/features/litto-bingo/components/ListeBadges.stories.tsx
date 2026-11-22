/* Fichier : src/features/litto-bingo/components/ListeBadges.stories.tsx */
import type { Meta, StoryObj } from '@storybook/react';
import { ListeBadges, type BadgeAffiche } from './ListeBadges';

const meta: Meta<typeof ListeBadges> = {
  title: 'LittoBingo/Organisms/ListeBadges',
  component: ListeBadges,
};
export default meta;

type Story = StoryObj<typeof ListeBadges>;

const badges: BadgeAffiche[] = [
  { id: 'premier-pas', famille: 'permanent', nom: 'Premier pas', description: 'Complète ton premier bingo.', teinte: 'ambre', pictogramme: 'etoile', etat: 'debloque' },
  { id: 'bibliophile', famille: 'permanent', nom: 'Bibliophile', description: 'Complète 10 bingos.', teinte: 'ambre', pictogramme: 'coeur', etat: 'verrouille', progression: { valeur: 4, seuil: 10 } },
  { id: 'eclair', famille: 'permanent', nom: 'Éclair', description: 'Complète un bingo en 7 jours maximum.', teinte: 'brique', pictogramme: 'eclair', etat: 'verrouille' },
  { id: 'feuilles-et-chapitres', famille: 'saisonnier', nom: 'Feuilles et chapitres', description: 'Complète un bingo en automne.', teinte: 'automne', pictogramme: 'feuille', etat: 'debloque' },
  { id: 'au-coin-du-feu', famille: 'saisonnier', nom: 'Au coin du feu', description: 'Complète un bingo en hiver.', teinte: 'hiver', pictogramme: 'flamme', etat: 'verrouille', progression: { valeur: 0, seuil: 1 } },
  { id: 'pionnier-2027', famille: 'pionnier', nom: 'Pionnier 2027', description: 'Complète un bingo en 2027.', teinte: 'violet', pictogramme: 'drapeau', etat: 'verrouille', progression: { valeur: 0, seuil: 1 } },
];

export const Standard: Story = {
  args: { badges, onExporterBadge: (id) => console.log('export', id) },
};

export const AucunBadgeDebloque: Story = {
  args: { badges: badges.map((b) => ({ ...b, etat: 'verrouille' as const })) },
};

export const ExportEchoue: Story = {
  args: { badges, onExporterBadge: () => {}, idExportEchoue: 'premier-pas' },
};
