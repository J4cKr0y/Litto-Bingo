/* Fichier : src/features/litto-bingo/components/FormulaireLivre.tsx */
import { useEffect, useId, useRef, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import '../styles/FormulaireLivre.css';

export interface FormulaireLivreProps {
  /** Contrôle l'ouverture du dialog */
  ouvert: boolean;
  /** Texte de la consigne concernée, affiché en contexte */
  consigneTexte: string;
  /** Titre déjà associé à la case, si elle est cochée (mode édition) */
  livreInitial?: string | null;
  /** Déclenché avec le titre du livre saisi, une fois validé */
  onValider: (livre: string) => void;
  /** Fourni uniquement quand la case est déjà cochée, pour proposer de la dévalider */
  onDecocher?: () => void;
  /** Déclenché à l'annulation (Échap, clic sur backdrop, bouton Annuler) */
  onAnnuler: () => void;
}

export function FormulaireLivre({
  ouvert,
  consigneTexte,
  livreInitial = null,
  onValider,
  onDecocher,
  onAnnuler,
}: FormulaireLivreProps) {
  useLingui();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const elementDeclencheurRef = useRef<HTMLElement | null>(null);
  const [livre, setLivre] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const champId = useId();

  const modeEdition = livreInitial !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (ouvert && !dialog.open) {
      elementDeclencheurRef.current = document.activeElement as HTMLElement;
      setLivre(livreInitial ?? '');
      setErreur(null);
      dialog.showModal();
    } else if (!ouvert && dialog.open) {
      dialog.close();
      elementDeclencheurRef.current?.focus();
    }
  }, [ouvert, livreInitial]);

  function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    const livreNettoye = livre.trim();

    if (livreNettoye === '') {
      setErreur(t`Indique le livre associé à cette case avant de la valider`);
      return;
    }

    onValider(livreNettoye);
  }

  return (
    <dialog
      ref={dialogRef}
      className="formulaire-livre"
      onCancel={onAnnuler}
      onClose={onAnnuler}
    >
      <h2 className="formulaire-livre__titre">
        {modeEdition ? <Trans>Modifier cette case</Trans> : <Trans>Valider cette case</Trans>}
      </h2>
      <p className="formulaire-livre__consigne">{consigneTexte}</p>

      <form onSubmit={gererSoumission}>
        <div className="formulaire-livre__champ">
          <label htmlFor={champId}>
            <Trans>Titre du livre lu</Trans>
          </label>
          <input
            id={champId}
            type="text"
            value={livre}
            onChange={(e) => setLivre(e.target.value)}
            aria-invalid={erreur !== null}
            aria-describedby={erreur ? `${champId}-erreur` : undefined}
            autoFocus
          />
        </div>

        {erreur && (
          <p id={`${champId}-erreur`} className="formulaire-livre__erreur" role="alert">
            {erreur}
          </p>
        )}

        <div className="formulaire-livre__actions">
          {modeEdition && onDecocher && (
            <button
              type="button"
              className="formulaire-livre__bouton-decocher"
              onClick={onDecocher}
            >
              <Trans>Décocher</Trans>
            </button>
          )}
          <button
            type="button"
            className="formulaire-livre__bouton-annuler"
            onClick={onAnnuler}
          >
            <Trans>Annuler</Trans>
          </button>
          <button type="submit" className="formulaire-livre__bouton-valider">
            {modeEdition ? <Trans>Mettre à jour</Trans> : <Trans>Valider</Trans>}
          </button>
        </div>
      </form>
    </dialog>
  );
}