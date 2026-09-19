/* Fichier : src/features/litto-bingo/components/PageBingo.tsx */
import { useEffect, useState } from 'react';
import { EnTeteBingo } from './EnTeteBingo';
import { GrilleBingo } from './GrilleBingo';
import { FormulaireNouveauBingo, type OptionsNouveauBingo } from './FormulaireNouveauBingo';
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
        'Un nouveau bingo remplacera définitivement celui en cours (pas encore d\'historique). Continuer ?'
      );
      if (!confirme) return;
    }

    setConfigurationOuverte(true);
  }

  if (chargement) {
    return (
      <main className="page-bingo">
        <h1 className="page-bingo__titre">Litto-Bingo</h1>
        <p role="status">Chargement de votre bingo...</p>
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
          Impossible de générer une grille : aucune consigne disponible pour ce filtre.
        </p>
      </main>
    );
  }

  const complet = verifierBingoComplet(grille);
  const expire = !complet && estExpire(grille);

  return (
    <main className="page-bingo">
      <header className="page-bingo__entete">
        <h1 className="page-bingo__titre">Litto-Bingo</h1>
        <p className="page-bingo__sous-titre">
          Coche une case à chaque livre lu qui correspond à la consigne
        </p>
        {grille.generationLimitee && (
          <p role="status" className="page-bingo__sous-titre">
            Peu de consignes disponibles pour ce filtre — la grille a été complétée du mieux possible.
          </p>
        )}
      </header>

      {complet && (
        <div className="page-bingo__bandeau page-bingo__bandeau--succes" role="status">
          🎉 Bingo complété ! Bravo pour cette belle pile de lectures.
          <br />
          <button onClick={demarrerNouveauBingo}>Commencer un nouveau bingo</button>
        </div>
      )}

      {expire && (
        <div className="page-bingo__bandeau page-bingo__bandeau--info" role="status">
          ⏳ Ce bingo est arrivé à échéance.
          <br />
          <button onClick={demarrerNouveauBingo}>Commencer un nouveau bingo</button>
        </div>
      )}

      <EnTeteBingo grille={grille} />
      <GrilleBingo grille={grille} onGrilleChangee={gererGrilleChangee} />

      {!complet && !expire && (
        <div className="page-bingo__actions">
          <button className="page-bingo__bouton-nouveau" onClick={demarrerNouveauBingo}>
            Nouveau bingo
          </button>
        </div>
      )}
    </main>
  );
}