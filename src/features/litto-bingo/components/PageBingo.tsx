/* Fichier : src/features/litto-bingo/components/PageBingo.tsx */
import { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { EnTeteBingo } from './EnTeteBingo';
import { GrilleBingo } from './GrilleBingo';
import { FormulaireNouveauBingo, type OptionsNouveauBingo } from './FormulaireNouveauBingo';
import { BoiteSuggestion } from './BoiteSuggestion';
import { SelecteurLangue } from './SelecteurLangue';
import {
  genererGrille,
  definirDateDeFin,
  verifierBingoComplet,
  estExpire,
  genererGrilleConservant,
  remplacerConsigne,
  type Consigne,
  type Grille,
} from '../litto-bingo';
import { LocalStorageBingoRepository, type BingoRepository } from '../litto-bingo.repository';
import { obtenirCatalogueConsignes, genresDisponibles } from '../consignes-catalogue';
import '../styles/PageBingo.css';

export interface PageBingoProps {
  /** Réservoir de consignes disponibles pour la génération */
  consignesDisponibles?: Consigne[];
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
  { genres: options.genres, taille: options.taille }
);

  if (grille && options.dateFin) {
    try {
      definirDateDeFin(grille, options.dateFin);
    } catch {
      // Filet de sécurité : le formulaire empêche déjà ce cas en amont.
    }
  }

  return grille;
}

export function PageBingo({
  consignesDisponibles,
  repository = new LocalStorageBingoRepository(),
}: PageBingoProps) {
  const { i18n } = useLingui();
  const consignesActives = consignesDisponibles ?? obtenirCatalogueConsignes(i18n.locale);

  const [grille, setGrille] = useState<Grille | null>(null);
  const [chargement, setChargement] = useState(true);
  const [configurationOuverte, setConfigurationOuverte] = useState(false);
  const [modeSelection, setModeSelection] = useState(false);
  const [positionsSelectionnees, setPositionsSelectionnees] = useState<number[]>([]);

function basculerSelection(position: number) {
  setPositionsSelectionnees((prev) =>
    prev.includes(position) ? prev.filter((p) => p !== position) : [...prev, position]
  );
}

function annulerSelection() {
  setModeSelection(false);
  setPositionsSelectionnees([]);
}

function validerSelectionEtRegenerer() {
  if (!grille) return;

  const nouvelleGrille = genererGrilleConservant(
    grille,
    positionsSelectionnees,
    consignesActives
  );

  setGrille(nouvelleGrille);
  setModeSelection(false);
  setPositionsSelectionnees([]);

  if (nouvelleGrille) {
    repository.sauvegarderBingoActif(nouvelleGrille);
  }
}

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
  
  function gererChangementConsigne(position: number) {
  if (!grille) return;

  try {
    remplacerConsigne(grille, position, consignesActives);
    gererGrilleChangee({ ...grille });
  } catch (erreur) {
    window.alert((erreur as Error).message);
  }
}

  function gererCreationBingo(options: OptionsNouveauBingo) {
    const nouvelleGrille = creerGrilleAvecOptions(consignesActives, options);
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
        t`Un nouveau bingo remplacera définitivement celui en cours (pas encore d'historique). Continuer ?`
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
        <div className="page-bingo__barre-superieure">
          <h1 className="page-bingo__titre">Litto-Bingo</h1>
          <SelecteurLangue />
        </div>
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
      <GrilleBingo
		grille={grille}
		locale={i18n.locale}
		onGrilleChangee={gererGrilleChangee}
		modeSelection={modeSelection}
		positionsSelectionnees={positionsSelectionnees}
		onToggleSelection={basculerSelection}
		onChangerConsigne={gererChangementConsigne}
	  />

{modeSelection && (
  <div className="page-bingo__bandeau page-bingo__bandeau--info" role="status">
    <Trans>Cliquez sur les cases à conserver ({positionsSelectionnees.length} sélectionnée(s))</Trans>
    <br />
    <button onClick={validerSelectionEtRegenerer}>
      <Trans>Générer le nouveau bingo</Trans>
    </button>{' '}
    <button onClick={annulerSelection}>
      <Trans>Annuler</Trans>
    </button>
  </div>
)}		
{!complet && !expire && !modeSelection && (
  <div className="page-bingo__actions">
    <button className="page-bingo__bouton-nouveau" onClick={() => setModeSelection(true)}>
      <Trans>Garder des cases pour le prochain bingo</Trans>
    </button>
  </div>
)}
		
      {!complet && !expire && !modeSelection && (
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