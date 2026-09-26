/* Fichier : src/features/litto-bingo/components/GrilleBingo.tsx */
import { useState } from 'react';
import { CaseBingo } from './CaseBingo';
import { FormulaireLivre } from './FormulaireLivre';
import { cocherCase, decocherCase, corrigerDerniereEntree, estExpire, type Grille } from '../litto-bingo';
import { obtenirTexteConsigneTraduit } from '../consignes-catalogue';
import { t } from '@lingui/core/macro';
import '../styles/GrilleBingo.css';

export interface GrilleBingoProps {
  grille: Grille;
  locale: string;
  onGrilleChangee: (grilleMiseAJour: Grille) => void;
  modeSelection?: boolean;
  positionsSelectionnees?: number[];
  onToggleSelection?: (position: number) => void;
  onChangerConsigne?: (position: number) => void;
}

export function GrilleBingo({
  grille,
  locale,
  onGrilleChangee,
  modeSelection = false,
  positionsSelectionnees = [],
  onToggleSelection,
  onChangerConsigne,
}: GrilleBingoProps) {
  const [positionOuverte, setPositionOuverte] = useState<number | null>(null);
  const expiree = estExpire(grille);

  function texteAffiche(consigneId: string, texteOriginal: string): string {
    return obtenirTexteConsigneTraduit(consigneId, locale) ?? texteOriginal;
  }

  function gererClicCase(position: number) {
    if (modeSelection) {
      onToggleSelection?.(position);
      return;
    }
    if (expiree) return;
    setPositionOuverte(position);
  }

  function gererValidationLivre(livre: string) {
    if (positionOuverte === null) return;
    cocherCase(grille, positionOuverte, livre);
    onGrilleChangee({ ...grille });
    setPositionOuverte(null);
  }

  function gererAjoutLecture(livre: string) {
    if (positionOuverte === null) return;
    cocherCase(grille, positionOuverte, livre);
    onGrilleChangee({ ...grille });
    setPositionOuverte(null);
  }

  function gererCorrection(livre: string) {
    if (positionOuverte === null) return;
    corrigerDerniereEntree(grille, positionOuverte, livre);
    onGrilleChangee({ ...grille });
    setPositionOuverte(null);
  }

  function gererDecochage() {
    if (positionOuverte === null) return;
    decocherCase(grille, positionOuverte);
    onGrilleChangee({ ...grille });
    setPositionOuverte(null);
  }

  function gererChangementConsigne() {
    if (positionOuverte === null) return;
    onChangerConsigne?.(positionOuverte);
    setPositionOuverte(null);
  }

  const caseOuverte = positionOuverte !== null ? grille.cases[positionOuverte] : null;

  return (
    <>
      <div
        className="grille-bingo"
        role="group"
        aria-label={t`Grille de bingo littéraire, ${grille.cases.length} cases`}
        data-expiree={expiree}
        style={{ '--taille-grille': grille.taille } as React.CSSProperties}
      >
        {grille.cases.map((c, position) => (
          <CaseBingo
            key={c.consigne.id}
            consigneTexte={texteAffiche(c.consigne.id, c.consigne.texte)}
            cochee={c.cochee}
            livre={c.livre}
            disabled={!modeSelection && expiree}
            selectionnee={modeSelection && positionsSelectionnees.includes(position)}
            onCliquer={() => gererClicCase(position)}
          />
        ))}
      </div>

      <FormulaireLivre
        ouvert={!modeSelection && positionOuverte !== null}
        consigneTexte={
          caseOuverte ? texteAffiche(caseOuverte.consigne.id, caseOuverte.consigne.texte) : ''
        }
        livreInitial={caseOuverte?.livre ?? null}
        historique={caseOuverte?.historique ?? []}
        remplacementsRestants={grille.remplacementsRestants}
        onValider={gererValidationLivre}
        onCorriger={caseOuverte?.cochee ? gererCorrection : undefined}
        onAjouterLecture={caseOuverte?.cochee ? gererAjoutLecture : undefined}
        onDecocher={caseOuverte?.cochee ? gererDecochage : undefined}
        onChangerConsigne={
          caseOuverte && !caseOuverte.cochee ? gererChangementConsigne : undefined
        }
        onAnnuler={() => setPositionOuverte(null)}
      />
    </>
  );
}