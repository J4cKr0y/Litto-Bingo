// Fichier : src/features/litto-bingo/components/PageHistorique.tsx

import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { TableauStatistiques } from './TableauStatistiques';
import { ListeHistorique } from './ListeHistorique';
import { calculerStatistiques, type BingoArchive } from '../litto-bingo-archive';
import '../styles/PageHistorique.css';

export interface PageHistoriqueProps {
  archives: BingoArchive[];
  onRetour: () => void;
}

export function PageHistorique({ archives, onRetour }: PageHistoriqueProps) {
  useLingui();
  const statistiques = calculerStatistiques(archives);

  return (
    <main className="page-historique">
      <h1 className="page-historique__titre">
        <Trans>Votre historique de lecture</Trans>
      </h1>

      <button className="page-historique__retour" onClick={onRetour}>
        <Trans>← Retour au bingo</Trans>
      </button>

      <TableauStatistiques statistiques={statistiques} />
      <ListeHistorique archives={archives} />
    </main>
  );
}