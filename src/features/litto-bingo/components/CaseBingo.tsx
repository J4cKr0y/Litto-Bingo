/* Fichier : src/features/litto-bingo/components/CaseBingo.tsx */
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
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
  useLingui();

const libelle = cochee
  ? t`${consigneTexte}, complétée avec ${livre ?? ''}`
  : t`${consigneTexte}, non complétée`;

  return (
    <button
      type="button"
      className="case-bingo"
      aria-pressed={cochee}
      aria-label={libelle}
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