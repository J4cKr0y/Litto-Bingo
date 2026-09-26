// src/features/litto-bingo/litto-bingo.ts

export interface Consigne {
  id: string;
  texte: string;
  genre: string;
}

export interface EntreeHistorique {
  livre: string;
  date: string; 
}

export interface Case {
  consigne: Consigne;
  cochee: boolean;
  livre: string | null; 
  historique: EntreeHistorique[];
}

export const MAX_RELECTURES = 25;

export type TailleGrille = 3 | 4 | 5;

export interface Grille {
  cases: Case[];
  generationLimitee: boolean;
  dateFin: Date | null;
  taille: TailleGrille;
  remplacementsRestants: number;
}

const REMPLACEMENTS_PAR_DEFAUT = 3;

export interface OptionsGeneration {
  genres?: string[];
  taille?: TailleGrille;
}

const TAILLE_PAR_DEFAUT: TailleGrille = 5;

function melanger<T>(tableau: T[]): T[] {
  const resultat = [...tableau];
  for (let i = resultat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultat[i], resultat[j]] = [resultat[j], resultat[i]];
  }
  return resultat;
}

export function genererGrille(
  consignesDisponibles: Consigne[],
  options?: OptionsGeneration
): Grille | null {
  if (consignesDisponibles.length === 0) {
    return null;
  }

  const taille = options?.taille ?? TAILLE_PAR_DEFAUT;
  const nombreCases = taille * taille;

  const pool =
  options?.genres && options.genres.length > 0
    ? consignesDisponibles.filter((c) => options.genres!.includes(c.genre))
    : consignesDisponibles;

  const consignesRetenues = melanger(pool).slice(0, nombreCases);

  return {
  cases: consignesRetenues.map((consigne) => ({
  consigne,
  cochee: false,
  livre: null,
  historique: [],
})),
  generationLimitee: consignesRetenues.length < nombreCases,
  dateFin: null,
  taille,
  remplacementsRestants: REMPLACEMENTS_PAR_DEFAUT,
};
}

/**
 * Génère un nouveau bingo en conservant certaines cases (avec leur état coché/livre) d'un bingo précédent.
 * La taille reste celle de la grille d'origine.
 */
export function genererGrilleConservant(
  grilleActuelle: Grille,
  positionsAConserver: number[],
  consignesDisponibles: Consigne[],
  options?: OptionsGeneration
): Grille | null {
  const taille = grilleActuelle.taille;
  const nombreCases = taille * taille;

  const casesConservees = positionsAConserver
    .filter((p) => p >= 0 && p < grilleActuelle.cases.length)
    .map((p) => grilleActuelle.cases[p]);

  const idsConserves = new Set(casesConservees.map((c) => c.consigne.id));

  const pool = options?.genres && options.genres.length > 0
    ? consignesDisponibles.filter((c) => options.genres!.includes(c.genre))
    : consignesDisponibles;

  const poolSansDoublons = pool.filter((c) => !idsConserves.has(c.id));
  const nombreAPiocher = Math.max(0, nombreCases - casesConservees.length);
  const nouvellesConsignes = melanger(poolSansDoublons).slice(0, nombreAPiocher);

  if (casesConservees.length === 0 && nouvellesConsignes.length === 0) {
    return null;
  }

  const nouvellesCases: Case[] = nouvellesConsignes.map((consigne) => ({
  consigne,
  cochee: false,
  livre: null,
  historique: [],
}));

  const casesFinal = [...casesConservees, ...nouvellesCases];

  return {
  cases: casesFinal,
  generationLimitee: casesFinal.length < nombreCases,
  dateFin: null,
  taille,
  remplacementsRestants: REMPLACEMENTS_PAR_DEFAUT,
};
}

export function cocherCase(grille: Grille, position: number, livre: string | null): void {
  if (estExpire(grille)) {
    throw new Error('Bingo expiré');
  }

  if (livre === null) {
    throw new Error('Indique le livre associé à cette case avant de la valider');
  }

  const c = grille.cases[position];

  if (c.historique.length >= MAX_RELECTURES) {
    throw new Error('Limite de relectures atteinte pour cette case');
  }

  c.historique.push({ livre, date: new Date().toISOString() });
  c.cochee = true;
  c.livre = livre;
}

export function decocherCase(grille: Grille, position: number): void {
  grille.cases[position].cochee = false;
  grille.cases[position].livre = null;
  grille.cases[position].historique = [];
}

export function corrigerDerniereEntree(grille: Grille, position: number, livre: string): void {
  const c = grille.cases[position];

  if (c.historique.length === 0) {
    throw new Error('Aucune lecture à corriger pour cette case');
  }

  c.historique[c.historique.length - 1] = {
    ...c.historique[c.historique.length - 1],
    livre,
  };
  c.livre = livre;
}

/**
 * Remplace la consigne d'une case précise par une autre, piochée aléatoirement dans le réservoir
 * (hors doublons avec les consignes déjà présentes dans la grille).
 * Consomme un remplacement du quota de la grille.
 */
export function remplacerConsigne(
  grille: Grille,
  position: number,
  consignesDisponibles: Consigne[],
  options?: OptionsGeneration
): void {
  if (grille.remplacementsRestants <= 0) {
    throw new Error('Vous avez atteint la limite de remplacements pour cette grille');
  }

  if (grille.cases[position].cochee) {
    throw new Error('Impossible de changer une case déjà cochée');
  }

  const pool = options?.genres && options.genres.length > 0
    ? consignesDisponibles.filter((c) => options.genres!.includes(c.genre))
    : consignesDisponibles;

  const idsPresents = new Set(grille.cases.map((c) => c.consigne.id));
  const poolSansDoublons = pool.filter((c) => !idsPresents.has(c.id));

  if (poolSansDoublons.length === 0) {
    throw new Error('Aucune consigne alternative disponible');
  }

  const nouvelleConsigne = melanger(poolSansDoublons)[0];

  grille.cases[position] = { consigne: nouvelleConsigne, cochee: false, livre: null, historique: [] };
  grille.remplacementsRestants -= 1;
}

export function verifierLigneComplete(grille: Grille, ligneIndex: number): boolean {
  const tailleLigne = grille.taille;
  const debut = ligneIndex * tailleLigne;
  const casesDeLaLigne = grille.cases.slice(debut, debut + tailleLigne);

  return casesDeLaLigne.length === tailleLigne && casesDeLaLigne.every((c) => c.cochee);
}

export function verifierBingoComplet(grille: Grille): boolean {
  return grille.cases.every((c) => c.cochee);
}

export function definirDateDeFin(grille: Grille, date: Date): void {
  if (date.getTime() <= Date.now()) {
    throw new Error('La date de fin doit être dans le futur');
  }

  grille.dateFin = date;
}

export function estExpire(grille: Grille): boolean {
  return grille.dateFin !== null && grille.dateFin.getTime() < Date.now();
}