/* Fichier : src/features/litto-bingo/components/CaseBingo.tsx */
import '../styles/CaseBingo.css';

export interface CaseBingoProps {
  /** Texte de la consigne affichée sur la case */
  consigneTexte: string;
  /** Indique si la case est cochée */
  cochee: boolean;
  /** Titre du livre associé, si la case est cochée */
  livre: string | null;
  /** Désactive l'interaction (ex: bingo expiré) */
  disabled?: boolean;
  /** Déclenché au clic sur la case */
  onCliquer: () => void;
}

export function CaseBingo({
  consigneTexte,
  cochee,
  livre,
  disabled = false,
  onCliquer,
}: CaseBingoProps) {
  return (
    <button
      type="button"
      className="case-bingo"
      aria-pressed={cochee}
      aria-label={
        cochee
          ? `${consigneTexte}, complétée avec ${livre}`
          : `${consigneTexte}, non complétée`
      }
      disabled={disabled}
      onClick={onCliquer}
    >
      <span className="case-bingo__consigne">{consigneTexte}</span>
      {cochee && livre && (
        <span className="case-bingo__livre">{livre}</span>
      )}
    </button>
  );
}