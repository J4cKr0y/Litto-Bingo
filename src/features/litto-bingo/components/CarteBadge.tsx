/* Fichier : src/features/litto-bingo/components/CarteBadge.tsx */
import { useId } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import {
  BadgeVisuel,
  type EtatBadge,
  type PictogrammeBadge,
  type TeinteBadge,
} from './BadgeVisuel';
import '../styles/CarteBadge.css';
import '../styles/utilitaires.css';

export interface ProgressionAffichee {
  valeur: number;
  seuil: number;
}

export interface CarteBadgeProps {
  nom: string;
  description: string;
  teinte: TeinteBadge;
  pictogramme: PictogrammeBadge;
  etat: EtatBadge;
  /** Affichée uniquement pour un badge verrouillé. Calculée par le parent. */
  progression?: ProgressionAffichee;
  /** Le bouton d'export n'apparaît que pour un badge débloqué et si ce rappel est fourni. */
  onExporter?: () => void;
  exportEchoue?: boolean;
}

export function CarteBadge({
  nom,
  description,
  teinte,
  pictogramme,
  etat,
  progression,
  onExporter,
  exportEchoue = false,
}: CarteBadgeProps) {
  useLingui(); // abonne le composant aux changements de langue
  const idProgression = useId();
  const debloque = etat === 'debloque';

  const seuil = progression?.seuil ?? 0;
  const valeurAffichee = Math.min(progression?.valeur ?? 0, seuil);

  return (
    <article className="carte-badge" data-etat={etat}>
      <div className="carte-badge__corps">
        <div className="carte-badge__sceau">
          <BadgeVisuel teinte={teinte} pictogramme={pictogramme} etat={etat} />
        </div>

        <div className="carte-badge__contenu">
          <h3 className="carte-badge__nom">{nom}</h3>
          <p className="carte-badge__statut" data-etat={etat}>
            {debloque ? t`Débloqué` : t`Verrouillé`}
          </p>
          <p className="carte-badge__description">{description}</p>

          {!debloque && progression && (
            <>
              <p id={idProgression} className="carte-badge__progression-texte">
                {t`${valeurAffichee} sur ${seuil}`}
              </p>
              <progress
                className="carte-badge__progression"
                max={seuil}
                value={valeurAffichee}
                aria-labelledby={idProgression}
              />
            </>
          )}

          {debloque && onExporter && (
            <button type="button" className="carte-badge__bouton" onClick={onExporter}>
              <Trans>Exporter en image</Trans>
              <span className="visuellement-cache"> — {nom}</span>
            </button>
          )}

          {exportEchoue && (
            <p role="alert" className="carte-badge__erreur">
              <Trans>L’export a échoué. Votre badge reste disponible, vous pouvez réessayer.</Trans>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}