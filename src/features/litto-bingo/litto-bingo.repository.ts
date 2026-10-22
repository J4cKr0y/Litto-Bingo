// Fichier : src/features/litto-bingo/litto-bingo.repository.ts

import type { Grille } from './litto-bingo';
import type { GrillePersistee } from './litto-bingo.dto';
import { CLE_BINGO_ACTIF } from './litto-bingo.dto';
import { versGrillePersistee, versGrilleDomaine } from './litto-bingo.mapper';

export interface BingoRepository {
  sauvegarderBingoActif(grille: Grille, dateDebut?: Date): Promise<void>;
  chargerBingoActif(): Promise<Grille | null>;
  obtenirDateDebutBingoActif(): Promise<Date | null>;
  supprimerBingoActif(): Promise<void>;
}

export class LocalStorageBingoRepository implements BingoRepository {
  async sauvegarderBingoActif(grille: Grille, dateDebut?: Date): Promise<void> {
    const existant = this.lirePersisteBrut();
    const persistee = versGrillePersistee(
      grille,
      existant?.id,
      dateDebut?.toISOString() ?? existant?.dateCreation
    );

    localStorage.setItem(CLE_BINGO_ACTIF, JSON.stringify(persistee));
  }

  async chargerBingoActif(): Promise<Grille | null> {
    const persistee = this.lirePersisteBrut();
    if (persistee === null) return null;
    return versGrilleDomaine(persistee);
  }

  async obtenirDateDebutBingoActif(): Promise<Date | null> {
    const persistee = this.lirePersisteBrut();
    if (persistee === null) return null;
    return new Date(persistee.dateCreation);
  }

  async supprimerBingoActif(): Promise<void> {
    localStorage.removeItem(CLE_BINGO_ACTIF);
  }

  private lirePersisteBrut(): GrillePersistee | null {
    const brut = localStorage.getItem(CLE_BINGO_ACTIF);
    return brut === null ? null : JSON.parse(brut);
  }
}