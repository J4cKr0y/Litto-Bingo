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

export interface Grille {
  cases: Case[];
  generationLimitee: boolean;
  dateFin: Date | null;
}

export interface OptionsGeneration {
  genre?: string;
}

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

  const pool = options?.genre
    ? consignesDisponibles.filter((c) => c.genre === options.genre)
    : consignesDisponibles;

  const consignesRetenues = melanger(pool).slice(0, 25);

  return {
    cases: consignesRetenues.map((consigne) => ({
      consigne,
      cochee: false,
      livre: null,
    })),
    generationLimitee: consignesRetenues.length < 25,
    dateFin: null,
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

const TAILLE_LIGNE = 5;

export function verifierLigneComplete(grille: Grille, ligneIndex: number): boolean {
  const debut = ligneIndex * TAILLE_LIGNE;
  const casesDeLaLigne = grille.cases.slice(debut, debut + TAILLE_LIGNE);

  return casesDeLaLigne.every((c) => c.cochee);
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

