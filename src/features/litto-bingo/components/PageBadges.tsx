/* Fichier : src/features/litto-bingo/components/PageBadges.tsx */
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { ListeBadges, type BadgeAffiche } from './ListeBadges';
import '../styles/PageBadges.css';

export interface PageBadgesProps {
  badges: BadgeAffiche[];
  onRetour: () => void;
  onExporterBadge?: (id: string) => void;
  idExportEchoue?: string | null;
}

export function PageBadges({ badges, onRetour, onExporterBadge, idExportEchoue }: PageBadgesProps) {
  useLingui(); // abonne le composant aux changements de langue

  return (
    <main className="page-badges">
      <h1 className="page-badges__titre">
        <Trans>Vos badges</Trans>
      </h1>

      <button type="button" className="page-badges__retour" onClick={onRetour}>
        <Trans>← Retour au bingo</Trans>
      </button>

      <ListeBadges
        badges={badges}
        onExporterBadge={onExporterBadge}
        idExportEchoue={idExportEchoue}
      />
    </main>
  );
}