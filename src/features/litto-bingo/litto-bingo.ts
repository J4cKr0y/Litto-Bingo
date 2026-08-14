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

export function genererGrille(consignesDisponibles: Consigne[]): Grille | null {
  if (consignesDisponibles.length === 0) {
    return null;
  }

  const cases: Case[] = consignesDisponibles
    .slice(0, 25)
    .map((consigne) => ({ consigne }));

  return { cases };
}