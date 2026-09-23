/* Fichier : src/features/litto-bingo/components/GrilleBingo.tsx */
import { useState } from 'react';
import { CaseBingo } from './CaseBingo';
import { FormulaireLivre } from './FormulaireLivre';
import { cocherCase, decocherCase, estExpire, type Grille } from '../litto-bingo';
import { obtenirTexteConsigneTraduit } from '../consignes-catalogue';
import { t } from '@lingui/core/macro';
import '../styles/GrilleBingo.css';

export interface GrilleBingoProps {
  grille: Grille;
  locale: string;
  onGrilleChangee: (grilleMiseAJour: Grille) => void;
}

export function GrilleBingo({ grille, locale, onGrilleChangee }: GrilleBingoProps) {
  const [positionOuverte, setPositionOuverte] = useState<number | null>(null);
  const expiree = estExpire(grille);

  function texteAffiche(consigneId: string, texteOriginal: string): string {
    return obtenirTexteConsigneTraduit(consigneId, locale) ?? texteOriginal;
  }

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
        aria-label={t`Grille de bingo littéraire, 25 cases`}
        data-expiree={expiree}
      >
        {grille.cases.map((c, position) => (
          <CaseBingo
            key={c.consigne.id}
            consigneTexte={texteAffiche(c.consigne.id, c.consigne.texte)}
            cochee={c.cochee}
            livre={c.livre}
            disabled={expiree}
            onCliquer={() => gererClicCase(position)}
          />
        ))}
      </div>

      <FormulaireLivre
        ouvert={positionOuverte !== null}
        consigneTexte={
          caseOuverte ? texteAffiche(caseOuverte.consigne.id, caseOuverte.consigne.texte) : ''
        }
        livreInitial={caseOuverte?.livre ?? null}
        onValider={gererValidationLivre}
        onDecocher={caseOuverte?.cochee ? gererDecochage : undefined}
        onAnnuler={() => setPositionOuverte(null)}
      />
    </>
  );
}