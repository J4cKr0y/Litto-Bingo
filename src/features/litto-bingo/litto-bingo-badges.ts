// litto-bingo-badges.ts

import type { BingoArchive } from './litto-bingo-archive';

export interface JourMois {
  mois: number; // 1 à 12
  jour: number;
}

export interface FenetreSaison {
  type: 'saison';
  debut: JourMois;
  fin: JourMois;
}

export interface FenetreAnneeCivile {
  type: 'anneeCivile';
  annee: number;
}

export type FenetreBadge = FenetreSaison | FenetreAnneeCivile;

export interface DefinitionBadgeQuantitatifBase {
  id: string;
  type: 'quantitatif';
  seuil: number;
  fenetre?: FenetreBadge;
}

export interface DefinitionBadgeQuantitatifSimple extends DefinitionBadgeQuantitatifBase {
  champ: 'bingosCompletes' | 'livresDistincts' | 'genresDistincts' | 'pagesTotales';
}

export interface DefinitionBadgeQuantitatifParGenre extends DefinitionBadgeQuantitatifBase {
  champ: 'bingosAvecGenre';
  genres: string[];
}

export type DefinitionBadgeQuantitatif =
  | DefinitionBadgeQuantitatifSimple
  | DefinitionBadgeQuantitatifParGenre;

export interface DefinitionBadgeExploit {
  id: string;
  type: 'exploit';
  critere: 'dureeMaxMs' | 'casesRenouveleesMax';
  seuil: number;
  fenetre?: FenetreBadge;
}

export type DefinitionBadge = DefinitionBadgeQuantitatif | DefinitionBadgeExploit;

export interface BadgeDebloque {
  id: string;
  notifie: boolean;
}

export interface ProgressionBadges {
  badgesDebloques: BadgeDebloque[];
}

export interface ParamsCalculBadges {
  archives: BingoArchive[];
  catalogue: DefinitionBadge[];
  dateActivationBadges: Date;
  progressionActuelle: ProgressionBadges;
}

function compterDistincts(valeurs: string[]): number {
  return new Set(valeurs).size;
}

function calculerProgression(
  archives: BingoArchive[],
  badge: DefinitionBadgeQuantitatif
): number {
  switch (badge.champ) {
    case 'livresDistincts':
      return compterDistincts(archives.flatMap((a) => a.livresLus));
    case 'genresDistincts':
      return compterDistincts(archives.flatMap((a) => a.genres));
    case 'pagesTotales':
      return archives.reduce((total, a) => total + a.pagesTotales, 0);
    case 'bingosAvecGenre':
      return archives.filter((a) => a.genres.some((g) => badge.genres.includes(g))).length;
    case 'bingosCompletes':
      return archives.length;
  }
}

function archiveSatisfaitExploit(archive: BingoArchive, badge: DefinitionBadgeExploit): boolean {
  switch (badge.critere) {
    case 'dureeMaxMs':
      return archive.dureeMs !== null && archive.dureeMs <= badge.seuil;
    case 'casesRenouveleesMax':
      return archive.casesRenouveleesUtilisees <= badge.seuil;
  }
}

function cleJourMois(date: Date): number {
  return (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
}

function bornesFenetre(fenetre: FenetreSaison) {
  const debut = fenetre.debut.mois * 100 + fenetre.debut.jour;
  const fin = fenetre.fin.mois * 100 + fenetre.fin.jour;
  return { debut, fin, chevaucheDeuxAnnees: debut > fin };
}

function estDansFenetreSaison(date: Date, fenetre: FenetreSaison): boolean {
  const cle = cleJourMois(date);
  const { debut, fin, chevaucheDeuxAnnees } = bornesFenetre(fenetre);

  return chevaucheDeuxAnnees
    ? cle >= debut || cle <= fin
    : cle >= debut && cle <= fin;
}

function estDansFenetre(date: Date, fenetre: FenetreBadge): boolean {
  if (fenetre.type === 'anneeCivile') {
    return date.getUTCFullYear() === fenetre.annee;
  }
  return estDansFenetreSaison(date, fenetre);
}

function archivesDansFenetre(
  archives: BingoArchive[],
  badge: DefinitionBadge
): BingoArchive[] {
  const fenetre = badge.fenetre;
  if (fenetre) {
    return archives.filter((a) => estDansFenetre(new Date(a.dateArchivage), fenetre));
  }
  return archives;
}

function cleOccurrence(date: Date, fenetre: FenetreSaison): number {
  const annee = date.getUTCFullYear();
  const { fin, chevaucheDeuxAnnees } = bornesFenetre(fenetre);

  return chevaucheDeuxAnnees && cleJourMois(date) <= fin ? annee - 1 : annee;
}

function grouperParOccurrence(
  archives: BingoArchive[],
  fenetre: FenetreSaison
): BingoArchive[][] {
  const groupes = new Map<number, BingoArchive[]>();
  for (const archive of archives) {
    const cle = cleOccurrence(new Date(archive.dateArchivage), fenetre);
    groupes.set(cle, [...(groupes.get(cle) ?? []), archive]);
  }
  return [...groupes.values()];
}

function estBadgeAtteint(badge: DefinitionBadge, archives: BingoArchive[]): boolean {
  const archivesPertinentes = archivesDansFenetre(archives, badge);
  if (badge.type === 'exploit') {
    return archivesPertinentes.some((a) => archiveSatisfaitExploit(a, badge));
  }
  const fenetre = badge.fenetre;
  if (fenetre?.type === 'saison') {
    return grouperParOccurrence(archivesPertinentes, fenetre).some(
      (groupe) => calculerProgression(groupe, badge) >= badge.seuil
    );
  }
  return calculerProgression(archivesPertinentes, badge) >= badge.seuil;
}

export function calculerBadgesDebloques({
  archives,
  catalogue,
  dateActivationBadges,
  progressionActuelle,
}: ParamsCalculBadges): BadgeDebloque[] {
  const archivesCompteesDepuisActivation = archives.filter(
    (a) =>
      a.statut === 'complete' &&
      new Date(a.dateArchivage).getTime() >= dateActivationBadges.getTime()
  );

  const idsDejaDebloques = new Set(progressionActuelle.badgesDebloques.map((b) => b.id));

  return catalogue
    .filter((badge) => !idsDejaDebloques.has(badge.id))
    .filter((badge) => estBadgeAtteint(badge, archivesCompteesDepuisActivation))
    .map((badge) => ({ id: badge.id, notifie: false }));
}

export function marquerBadgeNotifie(
  progression: ProgressionBadges,
  badgeId: string
): ProgressionBadges {
  return {
    badgesDebloques: progression.badgesDebloques.map((b) =>
      b.id === badgeId ? { ...b, notifie: true } : b
    ),
  };
}

export function estBadgeExportable(
  progression: ProgressionBadges,
  badgeId: string
): boolean {
  return progression.badgesDebloques.some((b) => b.id === badgeId);
}

export function appliquerBadgesDebloques(
  progression: ProgressionBadges,
  nouveaux: BadgeDebloque[]
): ProgressionBadges {
  const idsExistants = new Set(progression.badgesDebloques.map((b) => b.id));

  return {
    badgesDebloques: [
      ...progression.badgesDebloques,
      ...nouveaux.filter((b) => !idsExistants.has(b.id)),
    ],
  };
}