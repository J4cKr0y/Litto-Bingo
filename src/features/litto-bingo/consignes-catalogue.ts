import type { Consigne } from './litto-bingo';
import donneesConsignes from './data/consignes.json';

/** Catalogue complet des consignes disponibles, chargé depuis le fichier JSON. */
export const catalogueConsignes: Consigne[] = donneesConsignes;

/** Liste des genres disponibles dans le catalogue, dérivée automatiquement (pas de duplication à maintenir à la main). */
export const genresDisponibles: string[] = Array.from(
  new Set(catalogueConsignes.map((c) => c.genre))
);