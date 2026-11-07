import { t } from '@lingui/core/macro';
import type { PictogrammeBadge, TeinteBadge } from './components/BadgeVisuel';

export interface PresentationBadge {
  nom: string;
  description: string;
  pictogramme: PictogrammeBadge;
  teinte: TeinteBadge;
}

const PREFIXE_PIONNIER = 'pionnier-';

/** À appeler au moment du rendu : les textes suivent la langue active. */
export function obtenirPresentationBadge(id: string): PresentationBadge {
  if (id.startsWith(PREFIXE_PIONNIER)) {
    const annee = id.slice(PREFIXE_PIONNIER.length);
    return {
      nom: t`Pionnier ${annee}`,
      description: t`Complète un bingo en ${annee}.`,
      pictogramme: 'drapeau',
      teinte: 'violet',
    };
  }

  switch (id) {
    case 'premier-pas':
      return { nom: t`Premier pas`, description: t`Complète ton premier bingo.`, pictogramme: 'etoile', teinte: 'ambre' };
    case 'assidu':
      return { nom: t`Assidu`, description: t`Complète 5 bingos.`, pictogramme: 'flamme', teinte: 'ambre' };
    case 'bibliophile':
      return { nom: t`Bibliophile`, description: t`Complète 10 bingos.`, pictogramme: 'coeur', teinte: 'ambre' };
    case 'legende':
      return { nom: t`Légende`, description: t`Complète 25 bingos.`, pictogramme: 'couronne', teinte: 'ambre' };
    case 'lecteur-curieux':
      return { nom: t`Lecteur curieux`, description: t`Lis 10 livres différents.`, pictogramme: 'livre', teinte: 'ambre' };
    case 'grand-lecteur':
      return { nom: t`Grand lecteur`, description: t`Lis 50 livres différents.`, pictogramme: 'pile', teinte: 'ambre' };
    case 'encyclopedie':
      return { nom: t`Encyclopédie`, description: t`Lis 100 livres différents.`, pictogramme: 'pile', teinte: 'ambre' };
    case 'explorateur':
      return { nom: t`Explorateur`, description: t`Lis 5 genres différents.`, pictogramme: 'boussole', teinte: 'ambre' };
    case 'tour-du-monde':
      return { nom: t`Tour du monde`, description: t`Lis tous les genres du catalogue.`, pictogramme: 'globe', teinte: 'ambre' };
    case 'montagne-de-pages':
      return { nom: t`Montagne de pages`, description: t`Lis 5 000 pages au total.`, pictogramme: 'montagne', teinte: 'ambre' };
    case 'eclair':
      return { nom: t`Éclair`, description: t`Complète un bingo en 7 jours maximum.`, pictogramme: 'eclair', teinte: 'brique' };
    case 'sans-filet':
      return { nom: t`Sans filet`, description: t`Complète un bingo sans renouveler aucune consigne.`, pictogramme: 'cible', teinte: 'brique' };
    case 'bourgeon':
      return { nom: t`Bourgeon`, description: t`Complète un bingo au printemps (20 mars – 20 juin).`, pictogramme: 'bourgeon', teinte: 'printemps' };
    case 'reveil-litteraire':
      return { nom: t`Réveil littéraire`, description: t`Complète au printemps un bingo contenant de la romance ou de la dark romance.`, pictogramme: 'coeur', teinte: 'printemps' };
    case 'lecteur-de-plage':
      return { nom: t`Lecteur de plage`, description: t`Complète un bingo en été (21 juin – 22 septembre).`, pictogramme: 'soleil', teinte: 'ete' };
    case 'marathon-estival':
      return { nom: t`Marathon estival`, description: t`Complète 2 bingos pendant le même été.`, pictogramme: 'etoile', teinte: 'ete' };
    case 'feuilles-et-chapitres':
      return { nom: t`Feuilles et chapitres`, description: t`Complète un bingo en automne (23 septembre – 20 décembre).`, pictogramme: 'feuille', teinte: 'automne' };
    case 'explorateur-brumeux':
      return { nom: t`Explorateur brumeux`, description: t`Lis au moins 3 genres différents pendant le même automne.`, pictogramme: 'boussole', teinte: 'automne' };
    case 'au-coin-du-feu':
      return { nom: t`Au coin du feu`, description: t`Complète un bingo en hiver (21 décembre – 19 mars).`, pictogramme: 'flamme', teinte: 'hiver' };
    case 'flocon-d-or':
      return { nom: t`Flocon d’or`, description: t`Complète en hiver un bingo sans renouveler aucune consigne.`, pictogramme: 'flocon', teinte: 'hiver' };
    default:
      return { nom: id, description: '', pictogramme: 'etoile', teinte: 'ambre' };
  }
}