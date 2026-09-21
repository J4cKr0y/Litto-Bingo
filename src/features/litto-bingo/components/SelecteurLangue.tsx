import { useLingui } from '@lingui/react';
import { t } from '@lingui/core/macro';
import { activerLocale, locales } from '../../../i18n';
import '../styles/SelecteurLangue.css';

export function SelecteurLangue() {
  useLingui();
  const { i18n } = useLingui();

  function gererChangement(e: React.ChangeEvent<HTMLSelectElement>) {
    activerLocale(e.target.value);
  }

  return (
    <select
      className="selecteur-langue"
      value={i18n.locale}
      onChange={gererChangement}
      aria-label={t`Langue de l'interface`}
    >
      {Object.entries(locales).map(([code, nom]) => (
        <option key={code} value={code}>
          {nom}
        </option>
      ))}
    </select>
  );
}