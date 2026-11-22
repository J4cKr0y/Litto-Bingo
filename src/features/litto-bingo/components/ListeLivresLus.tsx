/* Fichier : src/features/litto-bingo/components/ListeLivresLus.tsx */
import { useId, useState } from 'react';
import { plural, t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import type { BingoAvecLivres, LivreLu } from '../litto-bingo-livres';
import '../styles/utilitaires.css';
import '../styles/ListeLivresLus.css';

type ModeTri = 'alphabetique' | 'bingo';

export interface ListeLivresLusProps {
  livres: LivreLu[];
  bingos: BingoAvecLivres[];
}

function formaterDate(dateIso: string | undefined, locale: string): string {
  if (!dateIso) return t`Date inconnue`;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(dateIso));
}

function listerProches(titres: string[]): string {
  return titres.map((titre) => `“${titre}”`).join(', ');
}

export function ListeLivresLus({ livres, bingos }: ListeLivresLusProps) {
  const { i18n } = useLingui(); // abonne le composant aux changements de langue
  const [mode, setMode] = useState<ModeTri>('alphabetique');
  const idGroupe = useId();

  if (livres.length === 0) {
    return (
      <p className="liste-livres__vide" role="status">
        <Trans>Aucun livre pour l’instant : complète un bingo pour commencer ta liste.</Trans>
      </p>
    );
  }

  const aDesProches = livres.some((livre) => livre.similaires.length > 0);

  return (
    <div className="liste-livres">
      <p className="liste-livres__resume">
        {plural(livres.length, { one: '# livre distinct', other: '# livres distincts' })}
      </p>

      {aDesProches && (
        <p className="liste-livres__aide">
          <Trans>
            Les titres signalés comme proches ne diffèrent que par la casse, les accents ou les
            espaces. Ils comptent comme des livres distincts.
          </Trans>
        </p>
      )}

      <fieldset className="liste-livres__tri">
        <legend className="visuellement-cache">
          <Trans>Trier les livres</Trans>
        </legend>
        <label className="liste-livres__choix">
          <input
            type="radio"
            name={`tri-livres-${idGroupe}`}
            value="alphabetique"
            checked={mode === 'alphabetique'}
            onChange={() => setMode('alphabetique')}
          />
          <Trans>Par ordre alphabétique</Trans>
        </label>
        <label className="liste-livres__choix">
          <input
            type="radio"
            name={`tri-livres-${idGroupe}`}
            value="bingo"
            checked={mode === 'bingo'}
            onChange={() => setMode('bingo')}
          />
          <Trans>Par bingo</Trans>
        </label>
      </fieldset>

      {mode === 'alphabetique' ? (
        <ul className="liste-livres__liste" role="list">
          {livres.map((livre) => (
            <li key={livre.titre} className="liste-livres__livre">
              <span className="liste-livres__titre">{livre.titre}</span>
              {livre.nombreBingos > 1 && (
                <span className="liste-livres__meta">
                  {plural(livre.nombreBingos, { one: 'Dans # bingo', other: 'Dans # bingos' })}
                </span>
              )}
              {livre.similaires.length > 0 && (
                <span className="liste-livres__meta liste-livres__meta--proche">
                  {t`Proche de : ${listerProches(livre.similaires)}`}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="liste-livres__bingos">
          {bingos.map((bingo, index) => {
            const idTitre = `${idGroupe}-bingo-${index}`;
            const numero = index + 1;
            const statut = bingo.statut === 'complete' ? t`Complété` : t`Abandonné`;
            const nombre = plural(bingo.livres.length, { one: '# livre', other: '# livres' });

            return (
              <section key={bingo.id} className="liste-livres__bingo" aria-labelledby={idTitre}>
                <h3 id={idTitre} className="liste-livres__bingo-titre">
                  {t`Bingo n° ${numero}`}
                </h3>
                <p className="liste-livres__meta">
                  {statut} · {formaterDate(bingo.dateArchivage, i18n.locale)} · {nombre}
                </p>
                {bingo.livres.length === 0 ? (
                  <p className="liste-livres__meta">
                    <Trans>Aucun livre enregistré pour ce bingo.</Trans>
                  </p>
                ) : (
                  <ul className="liste-livres__liste" role="list">
                    {bingo.livres.map((titre, position) => (
                      <li key={`${titre}-${position}`} className="liste-livres__livre">
                        <span className="liste-livres__titre">{titre}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}