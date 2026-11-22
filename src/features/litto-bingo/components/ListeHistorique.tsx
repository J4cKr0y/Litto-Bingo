// Fichier : src/features/litto-bingo/components/ListeHistorique.tsx

import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { LigneHistorique } from './LigneHistorique';
import type { BingoArchive } from '../litto-bingo-archive';
import '../styles/ListeHistorique.css';

export interface ListeHistoriqueProps {
  archives: BingoArchive[];
}

export function ListeHistorique({ archives }: ListeHistoriqueProps) {
  useLingui();

  if (archives.length === 0) {
    return (
      <p className="liste-historique__vide" role="status">
        <Trans>Aucun bingo dans votre historique pour l'instant.</Trans>
      </p>
    );
  }

  return (
    <div className="liste-historique">
      {[...archives].reverse().map((archive) => (
        <LigneHistorique key={archive.id} archive={archive} />
      ))}
    </div>
  );
}