/* Fichier : src/features/litto-bingo/components/EnTeteBingo.tsx */
import { BarreProgression } from './BarreProgression';
import { CompteARebours } from './CompteARebours';
import type { Grille } from '../litto-bingo';
import '../styles/EnTeteBingo.css';

export interface EnTeteBingoProps {
  grille: Grille;
}

export function EnTeteBingo({ grille }: EnTeteBingoProps) {
  const casesCochees = grille.cases.filter((c) => c.cochee).length;

  return (
    <div className="en-tete-bingo">
      <div className="en-tete-bingo__progression">
        <BarreProgression casesCochees={casesCochees} casesTotal={grille.cases.length} />
      </div>
      <CompteARebours dateFin={grille.dateFin} />
    </div>
  );
}