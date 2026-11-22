/* Fichier : src/features/litto-bingo/components/PageBingo.tsx */
import { useEffect, useState, useRef } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { EnTeteBingo } from './EnTeteBingo';
import { GrilleBingo } from './GrilleBingo';
import { FormulaireNouveauBingo, type OptionsNouveauBingo } from './FormulaireNouveauBingo';
import { BoiteSuggestion } from './BoiteSuggestion';
import { SelecteurLangue } from './SelecteurLangue';
import { PageHistorique } from './PageHistorique';
import { PageBadges } from './PageBadges';
import { ZoneNotificationsBadges, type NotificationAffichee } from './ZoneNotificationsBadges';
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
import type { ProgressionBadges } from '../litto-bingo-badges';
import {
  LocalStorageProgressionBadgesRepository,
  type ProgressionBadgesRepository,
} from '../litto-bingo-badges.repository';
import { construireCatalogue, DATE_ACTIVATION_BADGES } from '../litto-bingo-badges-catalogue';
import { debloquerBadges } from '../litto-bingo-badges-service';
import { construireBadgesAffiches } from '../litto-bingo-badges-affichage';
import { obtenirPresentationBadge } from '../litto-bingo-badges-presentation';
import { exporterBadgeDansLeNavigateur } from '../litto-bingo-badges-exporter.navigateur';
import { ExportBadgeEchoue } from '../litto-bingo-badges-exporter';
import { obtenirCatalogueConsignes, genresDisponibles } from '../consignes-catalogue';
import '../styles/PageBingo.css';

export interface PageBingoProps {
  consignesDisponibles?: Consigne[];
  repository?: BingoRepository;
  archiveRepository?: ArchiveRepository;
  progressionBadgesRepository?: ProgressionBadgesRepository;
}

type Vue = 'bingo' | 'historique' | 'badges';

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
  progressionBadgesRepository = new LocalStorageProgressionBadgesRepository(),
}: PageBingoProps) {
  const { i18n } = useLingui();
  const consignesActives = consignesDisponibles ?? obtenirCatalogueConsignes(i18n.locale);

  const [grille, setGrille] = useState<Grille | null>(null);
  const [dateDebutBingo, setDateDebutBingo] = useState<Date | null>(null);
  const [chargement, setChargement] = useState(true);
  const [configurationOuverte, setConfigurationOuverte] = useState(false);
  const [modeSelection, setModeSelection] = useState(false);
  const [positionsSelectionnees, setPositionsSelectionnees] = useState<number[]>([]);
  const [vue, setVue] = useState<Vue>('bingo');
  const [archives, setArchives] = useState<BingoArchive[]>([]);
  const [progressionBadges, setProgressionBadges] = useState<ProgressionBadges>({
    badgesDebloques: [],
  });
  const [notifications, setNotifications] = useState<NotificationAffichee[]>([]);
  const [idExportEchoue, setIdExportEchoue] = useState<string | null>(null);
  // Vrai dès que le bingo affiché a été archivé comme complété : il est alors figé.
  const bingoDejaArchive = useRef(false);

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

  async function archiverSiBesoin(statut: 'complete' | 'abandonne', grilleAArchiver = grille) {
    if (!grilleAArchiver || !dateDebutBingo) return;

    const archive = archiverBingo(grilleAArchiver, statut, dateDebutBingo, new Date());
    await archiveRepository.ajouterArchive(archive);
  }

  /** Annonce les badges débloqués par les archives. Ne doit jamais perturber le bingo. */
  async function annoncerBadgesDebloques() {
    try {
      const ids = await debloquerBadges(
        {
          catalogue: construireCatalogue(new Date().getUTCFullYear(), genresDisponibles),
          dateActivationBadges: DATE_ACTIVATION_BADGES,
        },
        { archives: archiveRepository, progression: progressionBadgesRepository }
      );

      if (ids.length > 0) {
        setNotifications((existantes) => [
          ...existantes,
          ...ids.map((id) => ({ id, ...obtenirPresentationBadge(id) })),
        ]);
      }
    } catch (erreur) {
      console.error('Calcul des badges impossible :', erreur);
    }
  }

  async function finaliserBingoComplet(grilleFinale: Grille) {
    await archiverSiBesoin('complete', grilleFinale);
    await repository.supprimerBingoActif();
    await annoncerBadgesDebloques();
  }

  function gererGrilleChangee(grilleMiseAJour: Grille) {
    setGrille(grilleMiseAJour);
    // Un bingo déjà archivé est figé : ni nouvel archivage, ni ré-enregistrement du bingo actif.
    if (bingoDejaArchive.current) return;

    repository.sauvegarderBingoActif(grilleMiseAJour, dateDebutBingo ?? undefined);

    if (verifierBingoComplet(grilleMiseAJour)) {
      bingoDejaArchive.current = true;
      finaliserBingoComplet(grilleMiseAJour);
    }
  }

  async function gererCreationBingo(options: OptionsNouveauBingo) {
    const nouvelleGrille = creerGrilleAvecOptions(consignesActives, options);
    const maintenant = new Date();
    bingoDejaArchive.current = false;
    setGrille(nouvelleGrille);
    setDateDebutBingo(maintenant);
    setConfigurationOuverte(false);

    if (nouvelleGrille) {
      await repository.sauvegarderBingoActif(nouvelleGrille, maintenant);
    }
  }

  async function demarrerNouveauBingo() {
    // Un bingo déjà archivé comme complété n'est ni confirmé ni archivé une seconde fois.
    const progressionExistante =
      !bingoDejaArchive.current && (grille?.cases.some((c) => c.cochee) ?? false);

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
    bingoDejaArchive.current = false;
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
    setVue('historique');
  }

  async function ouvrirBadges() {
    const [liste, progression] = await Promise.all([
      archiveRepository.listerArchives(),
      progressionBadgesRepository.charger(),
    ]);
    setArchives(liste);
    setProgressionBadges(progression);
    setIdExportEchoue(null);
    setVue('badges');
  }

  function voirBadgesDepuisNotification() {
    setNotifications([]);
    ouvrirBadges();
  }

  async function exporterBadgeAffiche(id: string) {
    setIdExportEchoue(null);
    try {
      await exporterBadgeDansLeNavigateur({ id, ...obtenirPresentationBadge(id) });
    } catch (erreur) {
      if (!(erreur instanceof ExportBadgeEchoue)) throw erreur;
      console.error('Export du badge impossible :', erreur.causeOriginale);
      setIdExportEchoue(id);
    }
  }

  function rendreContenu() {
    if (vue === 'historique') {
      return <PageHistorique archives={archives} onRetour={() => setVue('bingo')} />;
    }

    if (vue === 'badges') {
      const badges = construireBadgesAffiches({
        catalogue: construireCatalogue(new Date().getUTCFullYear(), genresDisponibles),
        progression: progressionBadges,
        archives,
        dateActivationBadges: DATE_ACTIVATION_BADGES,
        maintenant: new Date(),
        obtenirPresentation: obtenirPresentationBadge,
      });

      return (
        <PageBadges
          badges={badges}
          onRetour={() => setVue('bingo')}
          onExporterBadge={exporterBadgeAffiche}
          idExportEchoue={idExportEchoue}
        />
      );
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
          <div className="page-bingo__actions">
            <button className="page-bingo__bouton-nouveau" onClick={ouvrirHistorique}>
              <Trans>Voir mon historique</Trans>
            </button>
            <button className="page-bingo__bouton-nouveau" onClick={ouvrirBadges}>
              <Trans>Voir mes badges</Trans>
            </button>
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
          <div className="page-bingo__actions">
            <button className="page-bingo__bouton-nouveau" onClick={ouvrirHistorique}>
              <Trans>Voir mon historique</Trans>
            </button>
            <button className="page-bingo__bouton-nouveau" onClick={ouvrirBadges}>
              <Trans>Voir mes badges</Trans>
            </button>
          </div>
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
          verrouillee={complet}
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

  return (
    <>
      {rendreContenu()}
      <ZoneNotificationsBadges
        notifications={notifications}
        onFermer={(id) => setNotifications((liste) => liste.filter((n) => n.id !== id))}
        onToutFermer={() => setNotifications([])}
        onVoirBadges={voirBadgesDepuisNotification}
      />
    </>
  );
}