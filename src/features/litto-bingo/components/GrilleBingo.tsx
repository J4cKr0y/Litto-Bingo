/* Fichier : src/features/litto-bingo/components/GrilleBingo.tsx */
import { useState } from 'react';
import { CaseBingo } from './CaseBingo';
import { FormulaireLivre } from './FormulaireLivre';
import { cocherCase, decocherCase, estExpire, type Grille } from '../litto-bingo';
import '../styles/GrilleBingo.css';

export interface GrilleBingoProps {
  /** La grille à afficher, issue de genererGrille() */
  grille: Grille;
  /** Déclenché après chaque mutation réussie de la grille (case cochée) */
  onGrilleChangee: (grilleMiseAJour: Grille) => void;
}

export function GrilleBingo({ grille, onGrilleChangee }: GrilleBingoProps) {
  const [positionOuverte, setPositionOuverte] = useState<number | null>(null);
  const expiree = estExpire(grille);

  function gererClicCase(position: number) {
    if (expiree) return;
    setPositionOuverte(position);
  }

  function gererValidationLivre(livre: string) {
    if (positionOuverte === null) return;

    cocherCase(grille, positionOuverte, livre);
    onGrilleChangee({ ...grille });
    setPositionOuverte(null);
  }

  function gererDecochage() {
    if (positionOuverte === null) return;

    decocherCase(grille, positionOuverte);
    onGrilleChangee({ ...grille });
    setPositionOuverte(null);
  }

  const caseOuverte = positionOuverte !== null ? grille.cases[positionOuverte] : null;

  return (
    <>
      <div
        className="grille-bingo"
        role="group"
        aria-label="Grille de bingo littéraire, 25 cases"
        data-expiree={expiree}
      >
        {grille.cases.map((c, position) => (
          <CaseBingo
            key={c.consigne.id}
            consigneTexte={c.consigne.texte}
            cochee={c.cochee}
            livre={c.livre}
            disabled={expiree}
            onCliquer={() => gererClicCase(position)}
          />
        ))}
      </div>

      <FormulaireLivre
        ouvert={positionOuverte !== null}
        consigneTexte={caseOuverte?.consigne.texte ?? ''}
        livreInitial={caseOuverte?.livre ?? null}
        onValider={gererValidationLivre}
        onDecocher={caseOuverte?.cochee ? gererDecochage : undefined}
        onAnnuler={() => setPositionOuverte(null)}
      />
    </>
  );
}