import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import type { BingoArchive } from '../litto-bingo-archive';
import '../styles/LigneHistorique.css';

export interface LigneHistoriqueProps {
  archive: BingoArchive;
}

function formaterDuree(ms: number | null): string | null {
  if (ms === null) return null;
  const jours = Math.round(ms / (24 * 60 * 60 * 1000));
  return String(jours);
}

export function LigneHistorique({ archive }: LigneHistoriqueProps) {
  useLingui();

  const genresTexte = archive.genres.length > 0 ? archive.genres.join(', ') : t`Tous genres`;
  const duree = formaterDuree(archive.dureeMs);

  return (
    <div className="ligne-historique">
      <div className="ligne-historique__infos">
        <span className="ligne-historique__genres">{genresTexte}</span>
        <span className="ligne-historique__details">
          {archive.taille}×{archive.taille} —{' '}
          {archive.statut === 'complete' && duree !== null ? (
            <Trans>complété en {duree} jours</Trans>
          ) : (
            <Trans>{archive.casesCompletees} cases complétées</Trans>
          )}
        </span>
      </div>
      <span className="ligne-historique__statut" data-statut={archive.statut}>
        {archive.statut === 'complete' ? <Trans>Complété</Trans> : <Trans>Abandonné</Trans>}
      </span>
    </div>
  );
}