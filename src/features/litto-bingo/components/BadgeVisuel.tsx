/* Fichier : src/features/litto-bingo/components/BadgeVisuel.tsx */
import { useId } from 'react';
import '../styles/BadgeVisuel.css';

/** Pictogrammes en tracé (boîte 24x24), plusieurs chemins possibles par pictogramme. */
export const PICTOGRAMMES = {
  livre: ['M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5V18c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5z', 'M12 6v12.5'],
  pile: ['M5 6h14v3H5z', 'M4 11h16v3H4z', 'M6 16h12v3H6z'],
  etoile: ['M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z'],
  eclair: ['M13 2 3 14h9l-1 8 10-12h-9z'],
  globe: [
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    'M2 12h20',
    'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  ],
  soleil: [
    'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
    'M12 1v2', 'M12 21v2', 'M4.22 4.22l1.42 1.42', 'M18.36 18.36l1.42 1.42',
    'M1 12h2', 'M21 12h2', 'M4.22 19.78l1.42-1.42', 'M18.36 5.64l1.42-1.42',
  ],
  flocon: ['M12 2v20', 'M3.34 7l17.32 10', 'M3.34 17l17.32-10', 'M9.5 4.2 12 6.5l2.5-2.3', 'M9.5 19.8 12 17.5l2.5 2.3'],
  feuille: ['M5 19C5 10 10 5 20 4c0 10-5 15-14 15z', 'M5 19 15 9'],
  bourgeon: ['M12 21v-9', 'M12 12C12 8 9 6 5 6c0 4 3 6 7 6z', 'M12 14c0-3 2.5-5 6-5 0 3-2.5 5-6 5z'],
  montagne: ['M2 20 9 7l4.5 8 2.5-4L22 20z'],
  couronne: ['M3 18 4.5 7 9 12l3-6 3 6 4.5-5L21 18z', 'M3 21h18'],
  flamme: ['M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-4-8-1 4-4 6-4 11 0 4 3 8 7 8z'],
  boussole: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M16 8l-2 6-6 2 2-6z'],
  cible: [
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
    'M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
  ],
  coeur: ['M12 21C5 15 3 11 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-2 7-9 13z'],
  drapeau: ['M5 21V4', 'M5 4h12l-2 4 2 4H5'],
} as const;

/** Couleurs de fond des sceaux (le glyphe est blanc dessus). */
export const TEINTES = {
  ambre: '#9a5b13', // badges quantitatifs permanents
  brique: '#9b2c2c', // exploits permanents
  violet: '#5b3f8c', // Pionnier
  printemps: '#2f6b3a',
  ete: '#1f5f8b',
  automne: '#b4501a',
  hiver: '#3d4a8f',
} as const;

const COULEURS_VERROUILLE = { fond: '#e4e0d8', trait: '#6b6358' } as const;

export type PictogrammeBadge = keyof typeof PICTOGRAMMES;
export type TeinteBadge = keyof typeof TEINTES;
export type EtatBadge = 'debloque' | 'verrouille';

export interface BadgeVisuelProps {
  teinte: TeinteBadge;
  pictogramme: PictogrammeBadge;
  etat?: EtatBadge;
  /** Texte alternatif. Sans lui, le sceau est décoratif et masqué aux lecteurs d'écran. */
  titre?: string;
}

export function BadgeVisuel({ teinte, pictogramme, etat = 'debloque', titre }: BadgeVisuelProps) {
  const idTitre = useId();
  const verrouille = etat === 'verrouille';
  const fond = verrouille ? COULEURS_VERROUILLE.fond : TEINTES[teinte];
  const trait = verrouille ? COULEURS_VERROUILLE.trait : '#ffffff';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      className="badge-visuel"
      data-etat={etat}
      role={titre ? 'img' : undefined}
      aria-labelledby={titre ? idTitre : undefined}
      aria-hidden={titre ? undefined : true}
    >
      {titre && <title id={idTitre}>{titre}</title>}
      <circle
        cx="60"
        cy="60"
        r="56"
        fill={fond}
        stroke={verrouille ? trait : undefined}
        strokeWidth={verrouille ? 2 : undefined}
      />
      <circle
        cx="60"
        cy="60"
        r="49"
        fill="none"
        stroke={trait}
        strokeWidth="2"
        strokeDasharray={verrouille ? '5 4' : undefined}
        opacity="0.9"
      />
      <g
        transform="translate(36 36) scale(2)"
        fill="none"
        stroke={trait}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PICTOGRAMMES[pictogramme].map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}