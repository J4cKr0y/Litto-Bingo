// Fichier : src/features/litto-bingo/components/TableauStatistiques.tsx

import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { CarteStatistique } from './CarteStatistique';
import type { Statistiques } from '../litto-bingo-archive';
import '../styles/TableauStatistiques.css';

export interface TableauStatistiquesProps {
  statistiques: Statistiques;
}

function formaterDureeMoyenne(ms: number | null): string | null {
  if (ms === null) return null;
  const jours = Math.round(ms / (24 * 60 * 60 * 1000));
  return String(jours);
}

export function TableauStatistiques({ statistiques }: TableauStatistiquesProps) {
  useLingui();

  const totalBingos = statistiques.totalBingosCompletes + statistiques.totalBingosAbandonnes;

  if (totalBingos === 0) {
    return (
      <p className="tableau-statistiques__vide" role="status">
        <Trans>Aucune donnée disponible pour l'instant — complétez ou abandonnez un premier bingo pour voir vos statistiques.</Trans>
      </p>
    );
  }

  return (
    <div className="tableau-statistiques">
      <CarteStatistique
        valeur={statistiques.totalBingosCompletes}
        libelle={t`Bingos réussis`}
      />
      <CarteStatistique
        valeur={statistiques.totalBingosAbandonnes}
        libelle={t`Bingos abandonnés`}
      />
      <CarteStatistique
        valeur={statistiques.totalCasesCompletees}
        libelle={t`Cases complétées`}
      />
      <CarteStatistique
        valeur={statistiques.totalLivresDistincts}
        libelle={t`Livres distincts lus`}
      />
      <CarteStatistique
        valeur={statistiques.totalPagesLues}
        libelle={t`Pages lues`}
      />
      <CarteStatistique
        valeur={statistiques.totalCasesRenouvelees}
        libelle={t`Cases renouvelées`}
      />
      <CarteStatistique
        valeur={formaterDureeMoyenne(statistiques.dureeMoyenneMs)}
        libelle={t`Jours en moyenne par bingo`}
        texteVide={t`Pas encore de bingo complété`}
      />
      <CarteStatistique
        valeur={statistiques.genreLePlusRapide}
        libelle={t`Genre le plus rapide`}
        texteVide={t`Pas encore assez de données`}
      />
      <CarteStatistique
        valeur={statistiques.genreLePlusLent}
        libelle={t`Genre le plus lent`}
        texteVide={t`Pas encore assez de données`}
      />
    </div>
  );
}