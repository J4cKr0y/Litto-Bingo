import { createElement } from 'react';
import { BadgeVisuel, type PictogrammeBadge, type TeinteBadge } from './components/BadgeVisuel';
import {
  exporterBadge,
  type DependancesExport,
  type ResultatExport,
} from './litto-bingo-badges-exporter';

const TAILLE_PNG = 1080;
const MENTION = 'Litto-Bingo';

export interface SceauBadge {
  teinte: TeinteBadge;
  pictogramme: PictogrammeBadge;
}

export interface BadgeExportable extends SceauBadge {
  id: string;
  nom: string;
  description: string;
}

async function rendreSceauSvg({ teinte, pictogramme }: SceauBadge): Promise<string> {
  // Chargé à la demande : react-dom/server n'alourdit pas le chargement de l'application.
  const { renderToStaticMarkup } = await import('react-dom/server');
  return renderToStaticMarkup(createElement(BadgeVisuel, { teinte, pictogramme }));
}

function convertirSvgEnPng(svg: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = TAILLE_PNG;
        canvas.height = TAILLE_PNG;

        const contexte = canvas.getContext('2d');
        if (!contexte) {
          reject(new Error('Contexte canvas indisponible'));
          return;
        }

        contexte.drawImage(image, 0, 0, TAILLE_PNG, TAILLE_PNG);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('canvas.toBlob a renvoyé null'));
        }, 'image/png');
      } catch (erreur) {
        reject(erreur);
      }
    };

    image.onerror = () => reject(new Error('Chargement de l’image SVG impossible'));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

function telecharger(fichier: File): void {
  const url = URL.createObjectURL(fichier);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = fichier.name;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  // Libération différée : la libérer tout de suite peut annuler le téléchargement.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Partage natif réservé aux appareils tactiles : sur ordinateur, on télécharge. */
function estAppareilTactile(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
}

export function creerDependancesNavigateur(sceau: SceauBadge): DependancesExport {
  return {
    rendreSceauSvg: () => rendreSceauSvg(sceau),
    convertirSvgEnPng,
    peutPartagerFichier: (fichier) =>
      estAppareilTactile() &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [fichier] }),
    partager: (fichier, titre) => navigator.share({ files: [fichier], title: titre }),
    telecharger,
  };
}

/** Point d'entrée pour l'interface : exporte un badge et dit ce qui s'est passé. */
export function exporterBadgeDansLeNavigateur(badge: BadgeExportable): Promise<ResultatExport> {
  return exporterBadge(
    {
      nom: badge.nom,
      description: badge.description,
      mention: MENTION,
      nomFichier: `litto-bingo-${badge.id}.png`,
    },
    creerDependancesNavigateur(badge)
  );
}