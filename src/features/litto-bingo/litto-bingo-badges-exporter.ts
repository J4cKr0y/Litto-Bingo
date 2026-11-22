import { composerSvgExport } from './litto-bingo-badges-export';

export type ResultatExport = 'partage' | 'telecharge' | 'annule';

export interface ParamsExport {
  nom: string;
  description: string;
  mention: string;
  nomFichier: string;
}

export interface DependancesExport {
  /** Le sceau du badge, rendu sous forme de texte SVG. */
  rendreSceauSvg(): Promise<string>;
  /** Dessine le SVG composé et le convertit en image PNG. */
  convertirSvgEnPng(svg: string): Promise<Blob>;
  peutPartagerFichier(fichier: File): boolean;
  partager(fichier: File, titre: string): Promise<void>;
  telecharger(fichier: File): void;
}

/**
 * Erreur unique de l'export : l'interface la reconnaît et affiche son propre message traduit.
 * Le message ci-dessous ne sert qu'aux journaux de développement.
 */
export class ExportBadgeEchoue extends Error {
  readonly causeOriginale: unknown;

  constructor(causeOriginale?: unknown) {
    super('L’export du badge a échoué.');
    this.name = 'ExportBadgeEchoue';
    this.causeOriginale = causeOriginale;
  }
}

function estAnnulation(erreur: unknown): boolean {
  return (
    typeof erreur === 'object' &&
    erreur !== null &&
    (erreur as { name?: unknown }).name === 'AbortError'
  );
}

/** Exécute une étape de l'export : toute erreur est convertie en ExportBadgeEchoue. */
async function etape<T>(operation: () => T | Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (erreur) {
    throw new ExportBadgeEchoue(erreur);
  }
}

export async function exporterBadge(
  { nom, description, mention, nomFichier }: ParamsExport,
  dependances: DependancesExport
): Promise<ResultatExport> {
  const sceauSvg = await etape(() => dependances.rendreSceauSvg());
  const svg = await etape(() => composerSvgExport({ sceauSvg, nom, description, mention }));
  const png = await etape(() => dependances.convertirSvgEnPng(svg));
  const fichier = new File([png], nomFichier, { type: 'image/png' });

  if (dependances.peutPartagerFichier(fichier)) {
    try {
      await dependances.partager(fichier, nom);
      return 'partage';
    } catch (erreur) {
      if (estAnnulation(erreur)) return 'annule';
      // Autre échec de partage (ex. autorisation expirée) : on bascule sur le téléchargement.
    }
  }

  await etape(() => dependances.telecharger(fichier));
  return 'telecharge';
}