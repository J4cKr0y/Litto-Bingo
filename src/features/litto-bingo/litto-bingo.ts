// src/features/litto-bingo/litto-bingo.ts

export interface Consigne {
  id: string;
  texte: string;
  genre: string;
}

export interface Case {
  consigne: Consigne;
  cochee: boolean;
  livre: string | null;
}

export type TailleGrille = 3 | 4 | 5;

export interface Grille {
  cases: Case[];
  generationLimitee: boolean;
  dateFin: Date | null;
  taille: TailleGrille;
}

export interface OptionsGeneration {
  genre?: string;
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

  const pool = options?.genre
    ? consignesDisponibles.filter((c) => c.genre === options.genre)
    : consignesDisponibles;

  const consignesRetenues = melanger(pool).slice(0, nombreCases);

  return {
    cases: consignesRetenues.map((consigne) => ({ consigne, cochee: false, livre: null })),
    generationLimitee: consignesRetenues.length < nombreCases,
    dateFin: null,
    taille,
  };
}

export function cocherCase(grille: Grille, position: number, livre: string | null): void {
  if (estExpire(grille)) {
    throw new Error('Bingo expiré');
  }

  if (livre === null) {
    throw new Error('Indique le livre associé à cette case avant de la valider');
  }

  grille.cases[position].cochee = true;
  grille.cases[position].livre = livre;
}

export function decocherCase(grille: Grille, position: number): void {
  grille.cases[position].cochee = false;
  grille.cases[position].livre = null;
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