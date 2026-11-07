import { decouperEnLignes, echapperXml } from './litto-bingo-texte';

export interface ParamsExportSvg {
  /** Le sceau déjà rendu, sous forme de texte SVG complet (<svg …>…</svg>). */
  sceauSvg: string;
  nom: string;
  description: string;
  mention: string;
}

const TAILLE_IMAGE = 1080;
const LARGEUR_NOM = 20;
const Y_NOM = 650;
const INTERLIGNE_NOM = 84;
const ECART_NOM_DESCRIPTION = 80;
const LARGEUR_DESCRIPTION = 36;
const INTERLIGNE_DESCRIPTION = 52;
const Y_MENTION = 1010;
const COULEUR_TEXTE = '#2b2620';
const COULEUR_MENTION = '#6b6358';

function estSvg(texte: string): boolean {
  return /^\s*<svg[\s>][\s\S]*<\/svg>\s*$/.test(texte);
}

interface ParamsTexte {
  y: number;
  taille: number;
  texte: string;
  couleur: string;
  graisse?: string;
  style?: string;
}

/** Seul endroit où un texte est écrit dans le SVG : l'échappement ne peut donc pas être oublié. */
function ecrireTexte({ y, taille, texte, couleur, graisse, style }: ParamsTexte): string {
  const optionnels =
    (graisse ? ` font-weight="${graisse}"` : '') + (style ? ` font-style="${style}"` : '');
  return `<text x="540" y="${y}" font-family="Georgia, serif" font-size="${taille}"${optionnels} fill="${couleur}" text-anchor="middle">${echapperXml(texte)}</text>`;
}

function ecrireNom(lignes: string[]): string {
  return lignes
    .map((ligne, index) =>
      ecrireTexte({
        y: Y_NOM + index * INTERLIGNE_NOM,
        taille: 72,
        texte: ligne,
        couleur: COULEUR_TEXTE,
        graisse: '700',
      })
    )
    .join('');
}

function ecrireDescription(description: string, yDepart: number): string {
  return decouperEnLignes(description, LARGEUR_DESCRIPTION)
    .map((ligne, index) =>
      ecrireTexte({
        y: yDepart + index * INTERLIGNE_DESCRIPTION,
        taille: 40,
        texte: ligne,
        couleur: COULEUR_TEXTE,
      })
    )
    .join('');
}

function ecrireMention(mention: string): string {
  return ecrireTexte({
    y: Y_MENTION,
    taille: 40,
    texte: mention,
    couleur: COULEUR_MENTION,
    style: 'italic',
  });
}

export function composerSvgExport({ sceauSvg, nom, description, mention }: ParamsExportSvg): string {
  if (!estSvg(sceauSvg)) {
    throw new Error('Le sceau fourni n’est pas un SVG valide.');
  }

  // On découpe d'abord, puis on échappe chaque ligne : échapper avant allongerait les mots
  // (« & » deviendrait « &amp; ») et fausserait le calcul de largeur.
  const lignesNom = decouperEnLignes(nom, LARGEUR_NOM);
  const yDerniereLigneNom = Y_NOM + (lignesNom.length - 1) * INTERLIGNE_NOM;
  const yDescription = yDerniereLigneNom + ECART_NOM_DESCRIPTION;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TAILLE_IMAGE}" height="${TAILLE_IMAGE}" viewBox="0 0 ${TAILLE_IMAGE} ${TAILLE_IMAGE}">` +
    `<rect width="${TAILLE_IMAGE}" height="${TAILLE_IMAGE}" fill="#f7f5f0"/>` +
    `<rect x="24" y="24" width="1032" height="1032" rx="32" fill="none" stroke="#d8d3c9" stroke-width="4"/>` +
    `<svg x="340" y="100" width="400" height="400" viewBox="0 0 120 120">${sceauSvg}</svg>` +
    ecrireNom(lignesNom) +
    ecrireDescription(description, yDescription) +
    ecrireMention(mention) +
    `</svg>`
  );
}