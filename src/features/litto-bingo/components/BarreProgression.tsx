/* Fichier : src/features/litto-bingo/components/BarreProgression.tsx */
import '../styles/BarreProgression.css';

export interface BarreProgressionProps {
  /** Nombre de cases actuellement cochées */
  casesCochees: number;
  /** Nombre total de cases dans la grille (5x5 = 25 par défaut) */
  casesTotal?: number;
}

export function BarreProgression({
  casesCochees,
  casesTotal = 25,
}: BarreProgressionProps) {
  const pourcentage = Math.round((casesCochees / casesTotal) * 100);

  return (
    <div className="barre-progression">
      <span className="barre-progression__texte">
        {casesCochees} / {casesTotal} cases complétées ({pourcentage}%)
      </span>
      <progress
        className="barre-progression__jauge"
        value={casesCochees}
        max={casesTotal}
        aria-label={`Progression du bingo : ${casesCochees} case${casesCochees > 1 ? 's' : ''} complétée${casesCochees > 1 ? 's' : ''} sur ${casesTotal}`}
      />
    </div>
  );
}