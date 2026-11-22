/* Fichier : src/features/litto-bingo/components/ModaleLivresLus.tsx */
import { useEffect, useId, useRef } from 'react';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { ListeLivresLus } from './ListeLivresLus';
import type { BingoAvecLivres, LivreLu } from '../litto-bingo-livres';
import '../styles/ModaleLivresLus.css';

export interface ModaleLivresLusProps {
  ouverte: boolean;
  livres: LivreLu[];
  bingos: BingoAvecLivres[];
  onFermer: () => void;
}

export function ModaleLivresLus({ ouverte, livres, bingos, onFermer }: ModaleLivresLusProps) {
  useLingui(); // abonne le composant aux changements de langue
  const dialogRef = useRef<HTMLDialogElement>(null);
  const elementDeclencheurRef = useRef<HTMLElement | null>(null);
  const idTitre = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (ouverte && !dialog.open) {
      elementDeclencheurRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!ouverte && dialog.open) {
      dialog.close();
    }
  }, [ouverte]);

  // Point de passage unique : Échap, bouton « Fermer » et clic sur le fond aboutissent tous ici.
  function gererFermeture() {
    elementDeclencheurRef.current?.focus();
    onFermer();
  }

  function gererClic(evenement: React.MouseEvent<HTMLDialogElement>) {
    // La cible est le <dialog> lui-même uniquement pour un clic sur le fond assombri.
    if (evenement.target === evenement.currentTarget) dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      className="modale-livres"
      aria-labelledby={idTitre}
      onClose={gererFermeture}
      onClick={gererClic}
    >
      <div className="modale-livres__conteneur">
        <div className="modale-livres__entete">
          <h2 id={idTitre} className="modale-livres__titre">
            <Trans>Vos livres lus</Trans>
          </h2>
          <button
            type="button"
            className="modale-livres__fermer"
            onClick={() => dialogRef.current?.close()}
          >
            <Trans>Fermer</Trans>
          </button>
        </div>

        <div className="modale-livres__corps">
          {ouverte && <ListeLivresLus livres={livres} bingos={bingos} />}
        </div>
      </div>
    </dialog>
  );
}