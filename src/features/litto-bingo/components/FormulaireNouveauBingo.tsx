/* Fichier : src/features/litto-bingo/components/FormulaireNouveauBingo.tsx */
import { useId, useState } from 'react';
import '../styles/FormulaireNouveauBingo.css';

export interface OptionsNouveauBingo {
  genre?: string;
  dateFin?: Date;
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
  const [genre, setGenre] = useState<string>('');
  const [dateFinTexte, setDateFinTexte] = useState<string>('');
  const [erreur, setErreur] = useState<string | null>(null);

  const idGenre = useId();
  const idDate = useId();
  const dateMinimum = demain();

  function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    let dateFin: Date | undefined;
    if (dateFinTexte !== '') {
      const candidate = new Date(`${dateFinTexte}T23:59:59`);
      if (candidate.getTime() <= Date.now()) {
        setErreur('La date de fin doit être dans le futur');
        return;
      }
      dateFin = candidate;
    }

    onValider({
      genre: genre === '' ? undefined : genre,
      dateFin,
    });
  }

  return (
    <form className="formulaire-nouveau-bingo" onSubmit={gererSoumission}>
      <h2 className="formulaire-nouveau-bingo__titre">Créer votre bingo</h2>

      <div className="formulaire-nouveau-bingo__champ">
        <label htmlFor={idGenre}>Genre</label>
        <select id={idGenre} value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">Tous genres</option>
          {genresDisponibles.map((g) => (
            <option key={g} value={g}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="formulaire-nouveau-bingo__champ">
        <label htmlFor={idDate}>Date de fin (optionnelle)</label>
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
        Générer mon bingo
      </button>
    </form>
  );
}