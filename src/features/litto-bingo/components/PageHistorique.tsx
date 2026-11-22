// Fichier : src/features/litto-bingo/components/PageHistorique.tsx

import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { TableauStatistiques } from './TableauStatistiques';
import { ListeHistorique } from './ListeHistorique';
import { ModaleLivresLus } from './ModaleLivresLus';
import { calculerStatistiques, type BingoArchive } from '../litto-bingo-archive';
import { listerLivresLus, regrouperLivresParBingo } from '../litto-bingo-livres';
import '../styles/PageHistorique.css';

export interface PageHistoriqueProps {
  archives: BingoArchive[];
  onRetour: () => void;
}

export function PageHistorique({ archives, onRetour }: PageHistoriqueProps) {
  const { i18n } = useLingui();
  const [livresOuverts, setLivresOuverts] = useState(false);
  const statistiques = calculerStatistiques(archives);

  // La liste n'est calculée que quand la modale est ouverte.
  const livres = livresOuverts ? listerLivresLus(archives, i18n.locale) : [];
  const bingos = livresOuverts ? regrouperLivresParBingo(archives) : [];

  return (
    <main className="page-historique">
      <h1 className="page-historique__titre">
        <Trans>Votre historique de lecture</Trans>
      </h1>

      <button className="page-historique__retour" onClick={onRetour}>
        <Trans>← Retour au bingo</Trans>
      </button>

      <TableauStatistiques
        statistiques={statistiques}
        onVoirLivres={() => setLivresOuverts(true)}
      />
      <ListeHistorique archives={archives} />

      <ModaleLivresLus
        ouverte={livresOuverts}
        livres={livres}
        bingos={bingos}
        onFermer={() => setLivresOuverts(false)}
      />
    </main>
  );
}