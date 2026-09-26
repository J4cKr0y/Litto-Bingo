/* Fichier : src/features/litto-bingo/components/FormulaireLivre.tsx */
import { useEffect, useId, useRef, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { plural, t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import type { EntreeHistorique } from '../litto-bingo';
import '../styles/FormulaireLivre.css';

export interface FormulaireLivreProps {
  ouvert: boolean;
  consigneTexte: string;
  livreInitial?: string | null;
  historique?: EntreeHistorique[];
  remplacementsRestants?: number;
  onValider: (livre: string) => void;
  onCorriger?: (livre: string) => void;
  onAjouterLecture?: (livre: string) => void;
  onDecocher?: () => void;
  onChangerConsigne?: () => void;
  onAnnuler: () => void;
}

export function FormulaireLivre({
  ouvert,
  consigneTexte,
  livreInitial = null,
  historique = [],
  remplacementsRestants = 0,
  onValider,
  onCorriger,
  onAjouterLecture,
  onDecocher,
  onChangerConsigne,
  onAnnuler,
}: FormulaireLivreProps) {
  useLingui();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const elementDeclencheurRef = useRef<HTMLElement | null>(null);
  const [livre, setLivre] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const champId = useId();

  const modeEdition = livreInitial !== null;
  const relecturesRestantes = 25 - historique.length;

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

  function validerAvec(action: (livre: string) => void) {
    const livreNettoye = livre.trim();

    if (livreNettoye === '') {
      setErreur(t`Indique le livre associé à cette case avant de la valider`);
      return;
    }

    action(livreNettoye);
  }

  function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    validerAvec(onValider);
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

      {historique.length > 0 && (
        <div className="formulaire-livre__historique">
          <p className="formulaire-livre__historique-titre">
            <Trans>Lectures précédentes</Trans>
          </p>
          <ul>
            {historique.map((entree, index) => (
              <li key={index}>{entree.livre}</li>
            ))}
          </ul>
        </div>
      )}

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

        {!modeEdition && onChangerConsigne && (
          <div className="formulaire-livre__remplacement">
            {remplacementsRestants > 0 ? (
              <>
                <button
                  type="button"
                  className="formulaire-livre__bouton-changer"
                  onClick={onChangerConsigne}
                >
                  <Trans>Changer cette consigne</Trans>
                </button>
                <span className="formulaire-livre__compteur">
                  {plural(remplacementsRestants, {
                    one: '# changement restant',
                    other: '# changements restants',
                  })}
                </span>
              </>
            ) : (
              <span className="formulaire-livre__compteur formulaire-livre__compteur--epuise">
                <Trans>Limite de changements atteinte pour cette grille</Trans>
              </span>
            )}
          </div>
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

          <button type="button" className="formulaire-livre__bouton-annuler" onClick={onAnnuler}>
            <Trans>Annuler</Trans>
          </button>

          {modeEdition ? (
            <>
              {onCorriger && (
                <button
                  type="button"
                  className="formulaire-livre__bouton-valider"
                  onClick={() => validerAvec(onCorriger)}
                >
                  <Trans>Corriger la dernière lecture</Trans>
                </button>
              )}
              {onAjouterLecture && relecturesRestantes > 0 && (
                <button
                  type="button"
                  className="formulaire-livre__bouton-valider"
                  onClick={() => validerAvec(onAjouterLecture)}
                >
                  <Trans>Ajouter une nouvelle lecture</Trans> ({relecturesRestantes})
                </button>
              )}
            </>
          ) : (
            <button type="submit" className="formulaire-livre__bouton-valider">
              <Trans>Valider</Trans>
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}