// Fichier : src/features/litto-bingo/litto-bingo-archive.repository.ts

import type { BingoArchive } from './litto-bingo-archive';

const CLE_ARCHIVES = 'litto-bingo:archives';

export interface ArchiveRepository {
  ajouterArchive(archive: BingoArchive): Promise<void>;
  listerArchives(): Promise<BingoArchive[]>;
}

export class LocalStorageArchiveRepository implements ArchiveRepository {
  async ajouterArchive(archive: BingoArchive): Promise<void> {
    const archives = await this.listerArchivesBrut();
    archives.push(archive);
    localStorage.setItem(CLE_ARCHIVES, JSON.stringify(archives));
  }

  async listerArchives(): Promise<BingoArchive[]> {
    return this.listerArchivesBrut();
  }

  private async listerArchivesBrut(): Promise<BingoArchive[]> {
    const brut = localStorage.getItem(CLE_ARCHIVES);
    if (brut === null) return [];

    try {
      const archives = JSON.parse(brut);
      return Array.isArray(archives) ? archives : [];
    } catch {
      // Historique corrompu ou illisible — cf. scénario BDD dédié :
      // on ne bloque jamais l'app, on retourne une liste vide plutôt que de planter.
      return [];
    }
  }
}