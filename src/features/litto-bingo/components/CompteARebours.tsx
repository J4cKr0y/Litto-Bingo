/* Fichier : src/features/litto-bingo/components/CompteARebours.tsx */
import { useEffect, useState } from 'react';
import { plural, t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import '../styles/CompteARebours.css';

export interface CompteARebSProps {
  /** Date de fin du bingo, ou null si aucune date de fin définie */
  dateFin: Date | null;
}

const UNE_MINUTE_MS = 60 * 1000;
const UN_JOUR_MS = 24 * 60 * 60 * 1000;
const SEUIL_URGENCE_MS = 2 * UN_JOUR_MS; // moins de 2 jours restants

export function CompteARebours({ dateFin }: CompteARebSProps) {
  useLingui(); // abonne le composant aux changements de langue, sans utiliser son retour

  const [maintenant, setMaintenant] = useState(() => Date.now());

  useEffect(() => {
    if (dateFin === null) return;

    const intervalle = setInterval(() => {
      setMaintenant(Date.now());
    }, UNE_MINUTE_MS);

    return () => clearInterval(intervalle);
  }, [dateFin]);

  if (dateFin === null) {
    return null;
  }

  const diffMs = dateFin.getTime() - maintenant;
  const expire = diffMs <= 0;
  const urgence = !expire && diffMs <= SEUIL_URGENCE_MS;

  let texte: string;
  if (expire) {
    texte = t`Bingo expiré`;
  } else {
    const jours = Math.floor(diffMs / UN_JOUR_MS);
    const heures = Math.floor((diffMs % UN_JOUR_MS) / (60 * 60 * 1000));

    if (jours > 0) {
      const jourTexte = plural(jours, { one: '# jour', other: '# jours' });
      const heureTexte = plural(heures, { one: '# heure', other: '# heures' });
      texte = t`Il reste ${jourTexte} et ${heureTexte}`;
    } else {
      const heureTexte = plural(heures, { one: '# heure', other: '# heures' });
      texte = t`Il reste ${heureTexte}`;
    }
  }

  return (
    <span
      className="compte-a-rebours"
      data-urgence={urgence}
      data-expire={expire}
      aria-live="polite"
    >
      {texte}
    </span>
  );
}