export interface Consigne {
  id: string;
  texte: string;
  genre: string;
}

export interface Case {
  consigne: Consigne;
}

export interface Grille {
  cases: Case[];
}

function melanger<T>(tableau: T[]): T[] {
  const resultat = [...tableau];
  for (let i = resultat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultat[i], resultat[j]] = [resultat[j], resultat[i]];
  }
  return resultat;
}

export function genererGrille(consignesDisponibles: Consigne[]): Grille | null {
  if (consignesDisponibles.length === 0) {
    return null;
  }

  const cases: Case[] = melanger(consignesDisponibles)
    .slice(0, 25)
    .map((consigne) => ({ consigne }));

  return { cases };
}