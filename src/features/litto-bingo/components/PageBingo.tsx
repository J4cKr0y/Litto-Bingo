/* Fichier : src/features/litto-bingo/components/PageBingo.tsx */
import { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { EnTeteBingo } from './EnTeteBingo';
import { GrilleBingo } from './GrilleBingo';
import { FormulaireNouveauBingo, type OptionsNouveauBingo } from './FormulaireNouveauBingo';
import { BoiteSuggestion } from './BoiteSuggestion';
import {
  genererGrille,
  definirDateDeFin,
  verifierBingoComplet,
  estExpire,
  type Consigne,
  type Grille,
} from '../litto-bingo';
import { LocalStorageBingoRepository, type BingoRepository } from '../litto-bingo.repository';
import { catalogueConsignes, genresDisponibles } from '../consignes-catalogue';
import '../styles/PageBingo.css';
import { SelecteurLangue } from './SelecteurLangue';

export interface PageBingoProps {
  /** Réservoir de consignes disponibles pour la génération */
  consignesDisponibles: Consigne[];
  /** Filtre de genre optionnel */
  genre?: string;
  /** Date de fin optionnelle */
  dateFin?: Date;
  /** Injectable pour les tests / futures migrations (SQLite, API...) */
  repository?: BingoRepository;
}

function creerGrilleAvecOptions(
  consignesDisponibles: Consigne[],
  options: OptionsNouveauBingo
): Grille | null {
  const grille = genererGrille(
    consignesDisponibles,
    options.genre ? { genre: options.genre } : undefined
  );

  if (grille && options.dateFin) {
    try {
      definirDateDeFin(grille, options.dateFin);
    } catch {
      // Filet de sécurité : le formulaire empêche déjà ce cas en amont (attribut min),
      // on ignore silencieusement une date invalide plutôt que de planter la génération.
    }
  }

  return grille;
}

export function PageBingo({
  consignesDisponibles = catalogueConsignes,
  repository = new LocalStorageBingoRepository(),
}: PageBingoProps) {
  useLingui();
  const [grille, setGrille] = useState<Grille | null>(null);
  const [chargement, setChargement] = useState(true);
  const [configurationOuverte, setConfigurationOuverte] = useState(false);

  useEffect(() => {
    let annule = false;

    repository.chargerBingoActif().then((bingoExistant) => {
      if (annule) return;
      setGrille(bingoExistant);
      setChargement(false);
      setConfigurationOuverte(bingoExistant === null);
    });

    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function gererGrilleChangee(grilleMiseAJour: Grille) {
    setGrille(grilleMiseAJour);
    repository.sauvegarderBingoActif(grilleMiseAJour);
  }

  function gererCreationBingo(options: OptionsNouveauBingo) {
    const nouvelleGrille = creerGrilleAvecOptions(consignesDisponibles, options);
    setGrille(nouvelleGrille);
    setConfigurationOuverte(false);

    if (nouvelleGrille) {
      repository.sauvegarderBingoActif(nouvelleGrille);
    }
  }

  function demarrerNouveauBingo() {
    const progressionExistante = grille?.cases.some((c) => c.cochee) ?? false;

    if (progressionExistante) {
      const confirme = window.confirm(
        _(t`Un nouveau bingo remplacera définitivement celui en cours (pas encore d'historique). Continuer ?`)
      );
      if (!confirme) return;
    }

    setConfigurationOuverte(true);
  }

  if (chargement) {
    return (
      <main className="page-bingo">
        <h1 className="page-bingo__titre">Litto-Bingo</h1>
        <p role="status">
          <Trans>Chargement de votre bingo...</Trans>
        </p>
      </main>
    );
  }

  if (configurationOuverte) {
    return (
      <main className="page-bingo">
        <h1 className="page-bingo__titre">Litto-Bingo</h1>
        <FormulaireNouveauBingo
          genresDisponibles={genresDisponibles}
          onValider={gererCreationBingo}
        />
      </main>
    );
  }

  if (grille === null) {
    return (
      <main className="page-bingo">
        <h1 className="page-bingo__titre">Litto-Bingo</h1>
        <p role="alert">
          <Trans>Impossible de générer une grille : aucune consigne disponible pour ce filtre.</Trans>
        </p>
      </main>
    );
  }

  const complet = verifierBingoComplet(grille);
  const expire = !complet && estExpire(grille);

  return (
    <main className="page-bingo">
      <header className="page-bingo__entete">
  <div className="page-bingo__barre-superieure">
    <h1 className="page-bingo__titre">Litto-Bingo</h1>
    <SelecteurLangue />
  </div>
  <p className="page-bingo__sous-titre">
    <Trans>Coche une case à chaque livre lu qui correspond à la consigne</Trans>
  </p>
        {grille.generationLimitee && (
          <p role="status" className="page-bingo__sous-titre">
            <Trans>
              Peu de consignes disponibles pour ce filtre — la grille a été complétée du mieux possible.
            </Trans>
          </p>
        )}
      </header>

      {complet && (
        <div className="page-bingo__bandeau page-bingo__bandeau--succes" role="status">
          <Trans>🎉 Bingo complété ! Bravo pour cette belle pile de lectures.</Trans>
          <br />
          <button onClick={demarrerNouveauBingo}>
            <Trans>Commencer un nouveau bingo</Trans>
          </button>
        </div>
      )}

      {expire && (
        <div className="page-bingo__bandeau page-bingo__bandeau--info" role="status">
          <Trans>⏳ Ce bingo est arrivé à échéance.</Trans>
          <br />
          <button onClick={demarrerNouveauBingo}>
            <Trans>Commencer un nouveau bingo</Trans>
          </button>
        </div>
      )}

      <EnTeteBingo grille={grille} />
      <GrilleBingo grille={grille} onGrilleChangee={gererGrilleChangee} />

      {!complet && !expire && (
        <div className="page-bingo__actions">
          <button className="page-bingo__bouton-nouveau" onClick={demarrerNouveauBingo}>
            <Trans>Nouveau bingo</Trans>
          </button>
        </div>
      )}

      <BoiteSuggestion />
    </main>
  );
}