import type { Consigne } from './litto-bingo';
import donneesFr from './data/consignes.json';
import donneesEn from './data/consignes_en.json';

const cataloguesParLangue: Record<string, Consigne[]> = {
  fr: donneesFr,
  en: donneesEn,
};

export function obtenirCatalogueConsignes(locale: string): Consigne[] {
  return cataloguesParLangue[locale] ?? donneesFr;
}

/** Traduit à l'affichage le texte d'une consigne déjà générée, via son id stable. */
export function obtenirTexteConsigneTraduit(id: string, locale: string): string | undefined {
  return cataloguesParLangue[locale]?.find((c) => c.id === id)?.texte;
}

export const genresDisponibles: string[] = Array.from(
  new Set(donneesFr.map((c) => c.genre))
);