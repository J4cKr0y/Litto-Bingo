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
import { PageHistorique } from './PageHistorique';
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
import { archiverBingo, type BingoArchive } from '../litto-bingo-archive';
import { LocalStorageArchiveRepository, type ArchiveRepository } from '../litto-bingo-archive.repository';
import { obtenirCatalogueConsignes, genresDisponibles } from '../consignes-catalogue';
import '../styles/PageBingo.css';

export interface PageBingoProps {
  consignesDisponibles?: Consigne[];
  repository?: BingoRepository;
  archiveRepository?: ArchiveRepository;
}

function creerGrilleAvecOptions(
  consignesDisponibles: Consigne[],
  options: OptionsNouveauBingo
): Grille | null {
  const grille = genererGrille(consignesDisponibles, {
    genres: options.genres,
    taille: options.taille,
  });

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
  archiveRepository = new LocalStorageArchiveRepository(),
}: PageBingoProps) {
  const { i18n } = useLingui();
  const consignesActives = consignesDisponibles ?? obtenirCatalogueConsignes(i18n.locale);

  const [grille, setGrille] = useState<Grille | null>(null);
  const [dateDebutBingo, setDateDebutBingo] = useState<Date | null>(null);
  const [chargement, setChargement] = useState(true);
  const [configurationOuverte, setConfigurationOuverte] = useState(false);
  const [modeSelection, setModeSelection] = useState(false);
  const [positionsSelectionnees, setPositionsSelectionnees] = useState<number[]>([]);
  const [vueHistorique, setVueHistorique] = useState(false);
  const [archives, setArchives] = useState<BingoArchive[]>([]);

  useEffect(() => {
    let annule = false;

    Promise.all([repository.chargerBingoActif(), repository.obtenirDateDebutBingoActif()]).then(
      ([bingoExistant, dateDebut]) => {
        if (annule) return;
        setGrille(bingoExistant);
        setDateDebutBingo(dateDebut);
        setChargement(false);
        setConfigurationOuverte(bingoExistant === null);
      }
    );

    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function archiverSiBesoin(statut: 'complete' | 'abandonne') {
    if (!grille || !dateDebutBingo) return;

    const archive = archiverBingo(grille, statut, dateDebutBingo, new Date());
    await archiveRepository.ajouterArchive(archive);
  }

  function gererGrilleChangee(grilleMiseAJour: Grille) {
    setGrille(grilleMiseAJour);
    repository.sauvegarderBingoActif(grilleMiseAJour, dateDebutBingo ?? undefined);

    if (verifierBingoComplet(grilleMiseAJour)) {
      archiverSiBesoin('complete').then(() => repository.supprimerBingoActif());
    }
  }

  async function gererCreationBingo(options: OptionsNouveauBingo) {
    const nouvelleGrille = creerGrilleAvecOptions(consignesActives, options);
    const maintenant = new Date();

    setGrille(nouvelleGrille);
    setDateDebutBingo(maintenant);
    setConfigurationOuverte(false);

    if (nouvelleGrille) {
      await repository.sauvegarderBingoActif(nouvelleGrille, maintenant);
    }
  }

  async function demarrerNouveauBingo() {
    const progressionExistante = grille?.cases.some((c) => c.cochee) ?? false;

    if (progressionExistante) {
      const confirme = window.confirm(
        t`Un nouveau bingo remplacera définitivement celui en cours. Il sera archivé comme abandonné. Continuer ?`
      );
      if (!confirme) return;

      await archiverSiBesoin('abandonne');
    }

    await repository.supprimerBingoActif();
    setConfigurationOuverte(true);
  }

  function basculerSelection(position: number) {
    setPositionsSelectionnees((prev) =>
      prev.includes(position) ? prev.filter((p) => p !== position) : [...prev, position]
    );
  }

  async function annulerSelection() {
    setModeSelection(false);
    setPositionsSelectionnees([]);
  }

  async function validerSelectionEtRegenerer() {
    if (!grille) return;

    await archiverSiBesoin('abandonne');

    const nouvelleGrille = genererGrilleConservant(grille, positionsSelectionnees, consignesActives);
    const maintenant = new Date();

    setGrille(nouvelleGrille);
    setDateDebutBingo(maintenant);
    setModeSelection(false);
    setPositionsSelectionnees([]);

    if (nouvelleGrille) {
      await repository.sauvegarderBingoActif(nouvelleGrille, maintenant);
    } else {
      await repository.supprimerBingoActif();
    }
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

  async function ouvrirHistorique() {
    const liste = await archiveRepository.listerArchives();
    setArchives(liste);
    setVueHistorique(true);
  }

  if (vueHistorique) {
    return <PageHistorique archives={archives} onRetour={() => setVueHistorique(false)} />;
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
        <button className="page-bingo__bouton-nouveau" onClick={ouvrirHistorique}>
          <Trans>Voir mon historique</Trans>
        </button>
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
        <button className="page-bingo__bouton-nouveau" onClick={ouvrirHistorique}>
          <Trans>Voir mon historique</Trans>
        </button>
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

      {!complet && !expire && !modeSelection && (
        <div className="page-bingo__actions">
          <button className="page-bingo__bouton-nouveau" onClick={() => setModeSelection(true)}>
            <Trans>Garder des cases pour le prochain bingo</Trans>
          </button>
        </div>
      )}

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