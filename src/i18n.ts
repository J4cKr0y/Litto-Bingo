import { i18n } from '@lingui/core';

export const locales = { fr: 'Français', en: 'English' };
export const defaultLocale = 'fr';

const catalogues = import.meta.glob('./locales/*/messages.po');

export async function activerLocale(locale: string) {
  const chargerCatalogue = catalogues[`./locales/${locale}/messages.po`];

  if (!chargerCatalogue) {
    throw new Error(`Aucun catalogue de traduction trouvé pour la locale "${locale}"`);
  }

  const { messages } = (await chargerCatalogue()) as { messages: Record<string, string> };
  i18n.load(locale, messages);
  i18n.activate(locale);
}