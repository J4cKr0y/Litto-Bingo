/* Fichier : src/features/litto-bingo/components/BarreProgression.tsx */
import { plural, t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
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
  useLingui();
  const pourcentage = Math.round((casesCochees / casesTotal) * 100);
  const casesTexte = plural(casesCochees, { one: '# case', other: '# cases' });

  return (
    <div className="barre-progression">
      <span className="barre-progression__texte">
        {casesTexte} / {casesTotal} ({pourcentage}%)
      </span>
      <progress
        className="barre-progression__jauge"
        value={casesCochees}
        max={casesTotal}
        aria-label={t`Progression du bingo : ${casesTexte} sur ${casesTotal} complétées`}
      />
    </div>
  );
}