export interface GrillePersistee {
  id: string;
  dateCreation: string; // ISO 8601
  cases: {
    consigne: {
      id: string;
      texte: string;
      genre: string;
    };
    cochee: boolean;
    livre: string | null;
  }[];
  generationLimitee: boolean;
  dateFin: string | null; // ISO 8601, ou null si pas de date de fin
}

/** Clé fixe localStorage pour le bingo actif (MVP2 : un seul bingo suivi à la fois) */
export const CLE_BINGO_ACTIF = 'litto-bingo:bingo-actif';