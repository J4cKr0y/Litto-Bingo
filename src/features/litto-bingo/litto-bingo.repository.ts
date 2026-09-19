import type { Grille } from './litto-bingo';
import type { GrillePersistee } from './litto-bingo.dto';
import { CLE_BINGO_ACTIF } from './litto-bingo.dto';
import { versGrillePersistee, versGrilleDomaine } from './litto-bingo.mapper';

/**
 * Port (interface) définissant le contrat de persistance pour l'Agrégat Bingo.
 * Le domaine ne connaît que cette interface, jamais son implémentation concrète —
 * ce qui permettra de remplacer localStorage par un vrai backend (MVP3) sans
 * toucher à la logique métier ni aux composants UI.
 */
export interface BingoRepository {
  sauvegarderBingoActif(grille: Grille): Promise<void>;
  chargerBingoActif(): Promise<Grille | null>;
  supprimerBingoActif(): Promise<void>;
}

/**
 * Adapter : implémentation concrète du BingoRepository via localStorage.
 * Toute la connaissance de l'API localStorage et du format JSON est
 * encapsulée ici — le reste de l'application ne manipule que l'interface.
 */
export class LocalStorageBingoRepository implements BingoRepository {
  async sauvegarderBingoActif(grille: Grille): Promise<void> {
    const idExistant = this.lireIdExistant();
    const persistee = versGrillePersistee(grille, idExistant ?? undefined);

    localStorage.setItem(CLE_BINGO_ACTIF, JSON.stringify(persistee));
  }

  async chargerBingoActif(): Promise<Grille | null> {
    const brut = localStorage.getItem(CLE_BINGO_ACTIF);
    if (brut === null) {
      return null;
    }

    const persistee: GrillePersistee = JSON.parse(brut);
    return versGrilleDomaine(persistee);
  }

  async supprimerBingoActif(): Promise<void> {
    localStorage.removeItem(CLE_BINGO_ACTIF);
  }

  private lireIdExistant(): string | null {
    const brut = localStorage.getItem(CLE_BINGO_ACTIF);
    if (brut === null) return null;

    const persistee: GrillePersistee = JSON.parse(brut);
    return persistee.id;
  }
}