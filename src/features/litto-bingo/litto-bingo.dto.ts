export interface GrillePersistee {
  id: string;
  dateCreation: string;
  cases: {
    consigne: { id: string; texte: string; genre: string };
    cochee: boolean;
    livre: string | null;
    historique: { livre: string; date: string; pages: number | null }[];
  }[];
  generationLimitee: boolean;
  dateFin: string | null;
  taille: number;
  remplacementsRestants: number;
  casesRenouveleesUtilisees: number;
}

export const CLE_BINGO_ACTIF = 'litto-bingo:bingo-actif';