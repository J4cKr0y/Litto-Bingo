/* Fichier : src/features/litto-bingo/components/FormulaireNouveauBingo.tsx */
import { useId, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import type { TailleGrille } from '../litto-bingo';
import '../styles/FormulaireNouveauBingo.css';

export interface OptionsNouveauBingo {
  genres?: string[];
  dateFin?: Date;
  taille: TailleGrille;
}

export interface FormulaireNouveauBingoProps {
  genresDisponibles: string[];
  onValider: (options: OptionsNouveauBingo) => void;
}

function demain(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function FormulaireNouveauBingo({
  genresDisponibles,
  onValider,
}: FormulaireNouveauBingoProps) {
  useLingui();
  const [genresSelectionnes, setGenresSelectionnes] = useState<string[]>([]);
  const [taille, setTaille] = useState<TailleGrille>(5);
  const [dateFinTexte, setDateFinTexte] = useState<string>('');
  const [erreur, setErreur] = useState<string | null>(null);

  const idTaille = useId();
  const idDate = useId();
  const dateMinimum = demain();

  function basculerGenre(genre: string) {
    setGenresSelectionnes((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    let dateFin: Date | undefined;
    if (dateFinTexte !== '') {
      const candidate = new Date(`${dateFinTexte}T23:59:59`);
      if (candidate.getTime() <= Date.now()) {
        setErreur(t`La date de fin doit être dans le futur`);
        return;
      }
      dateFin = candidate;
    }

    onValider({
      genres: genresSelectionnes.length > 0 ? genresSelectionnes : undefined,
      dateFin,
      taille,
    });
  }

  return (
    <form className="formulaire-nouveau-bingo" onSubmit={gererSoumission}>
      <h2 className="formulaire-nouveau-bingo__titre">
        <Trans>Créer votre bingo</Trans>
      </h2>

      <div className="formulaire-nouveau-bingo__champ">
        <label htmlFor={idTaille}>
          <Trans>Taille de la grille</Trans>
        </label>
        <select
          id={idTaille}
          value={taille}
          onChange={(e) => setTaille(Number(e.target.value) as TailleGrille)}
        >
          <option value={3}>3 × 3</option>
          <option value={4}>4 × 4</option>
          <option value={5}>5 × 5</option>
        </select>
      </div>

      <fieldset className="formulaire-nouveau-bingo__champ formulaire-nouveau-bingo__genres">
        <legend>
          <Trans>Genres (aucun coché = tous genres)</Trans>
        </legend>
        {genresDisponibles.map((g) => (
          <label key={g} className="formulaire-nouveau-bingo__genre-option">
            <input
              type="checkbox"
              checked={genresSelectionnes.includes(g)}
              onChange={() => basculerGenre(g)}
            />
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </label>
        ))}
      </fieldset>

      <div className="formulaire-nouveau-bingo__champ">
        <label htmlFor={idDate}>
          <Trans>Date de fin (optionnelle)</Trans>
        </label>
        <input
          id={idDate}
          type="date"
          min={dateMinimum}
          value={dateFinTexte}
          onChange={(e) => setDateFinTexte(e.target.value)}
          onClick={(e) => e.currentTarget.showPicker?.()}
        />
      </div>

      {erreur && (
        <p className="formulaire-nouveau-bingo__erreur" role="alert">
          {erreur}
        </p>
      )}

      <button type="submit" className="formulaire-nouveau-bingo__bouton">
        <Trans>Générer mon bingo</Trans>
      </button>
    </form>
  );
}