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
    })),
    generationLimitee: grille.generationLimitee,
    dateFin: grille.dateFin ? grille.dateFin.toISOString() : null,
    taille: grille.taille,
  };
}

export function versGrilleDomaine(persistee: GrillePersistee): Grille {
  return {
    cases: persistee.cases.map((c) => ({
      consigne: { ...c.consigne },
      cochee: c.cochee,
      livre: c.livre,
    })),
    generationLimitee: persistee.generationLimitee,
    dateFin: persistee.dateFin ? new Date(persistee.dateFin) : null,
    taille: (persistee.taille as TailleGrille) ?? 5, // repli pour les bingos sauvegardés avant cette fonctionnalité
  };
}