import type { Grille, TailleGrille } from './litto-bingo';
import type { GrillePersistee } from './litto-bingo.dto';

export function versGrillePersistee(grille: Grille, idExistant?: string): GrillePersistee {
  return {
    id: idExistant ?? crypto.randomUUID(),
    dateCreation: new Date().toISOString(),
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
  };
}

export function versGrilleDomaine(persistee: GrillePersistee): Grille {
  return {
    cases: persistee.cases.map((c) => ({
      consigne: { ...c.consigne },
      cochee: c.cochee,
      livre: c.livre,
      historique: c.historique ?? (c.livre ? [{ livre: c.livre, date: persistee.dateCreation }] : []),
    })),
    generationLimitee: persistee.generationLimitee,
    dateFin: persistee.dateFin ? new Date(persistee.dateFin) : null,
    taille: (persistee.taille as TailleGrille) ?? 5,
    remplacementsRestants: persistee.remplacementsRestants ?? 0,
  };
}