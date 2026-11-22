// src/features/litto-bingo/litto-bingo.mapper.ts
import type { Grille, TailleGrille } from './litto-bingo';
import type { GrillePersistee } from './litto-bingo.dto';

export function versGrillePersistee(
  grille: Grille,
  idExistant?: string,
  dateCreationExistante?: string
): GrillePersistee {
  return {
    id: idExistant ?? crypto.randomUUID(),
    dateCreation: dateCreationExistante ?? new Date().toISOString(),
    cases: grille.cases.map((c) => ({
      consigne: { ...c.consigne },
      cochee: c.cochee,
      livre: c.livre,
      historique: c.historique,
    })),
    generationLimitee: grille.generationLimitee,
    dateFin: grille.dateFin ? grille.dateFin.toISOString() : null,
    taille: grille.taille,
    remplacementsRestants: grille.remplacementsRestants,
    casesRenouveleesUtilisees: grille.casesRenouveleesUtilisees,
  };
}

export function versGrilleDomaine(persistee: GrillePersistee): Grille {
  return {
    cases: persistee.cases.map((c) => ({
      consigne: { ...c.consigne },
      cochee: c.cochee,
      livre: c.livre,
      historique: (c.historique ?? (c.livre ? [{ livre: c.livre, date: persistee.dateCreation, pages: null }] : [])).map(
        (h) => ({ ...h, pages: h.pages ?? null })
      ),
    })),
    generationLimitee: persistee.generationLimitee,
    dateFin: persistee.dateFin ? new Date(persistee.dateFin) : null,
    taille: (persistee.taille as TailleGrille) ?? 5,
    remplacementsRestants: persistee.remplacementsRestants ?? 0,
    casesRenouveleesUtilisees: persistee.casesRenouveleesUtilisees ?? 0,
  };
}