import { useId, useState } from 'react';
import '../styles/BoiteSuggestion.css';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

const ADRESSE_CONTACT = 'kiky270281@gmail.com'; 

export function BoiteSuggestion() {
  useLingui(); // Abonnement au contexte de langue (v6)
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const champId = useId();

  function gererEnvoi(e: React.FormEvent) {
    e.preventDefault();
    const messageNettoye = message.trim();

    if (messageNettoye === '') {
      setErreur(t`Écrivez votre suggestion avant de l'envoyer`);
      return;
    }

    setErreur(null);
    const sujet = encodeURIComponent('Suggestion Litto-Bingo');
    const corps = encodeURIComponent(messageNettoye);
    window.location.href = `mailto:${ADRESSE_CONTACT}?subject=${sujet}&body=${corps}`;
  }

  return (
    <form className="boite-suggestion" onSubmit={gererEnvoi}>
      <h2 className="boite-suggestion__titre">
        <Trans>Une suggestion, un bug à signaler ?</Trans>
      </h2>

      <label htmlFor={champId} className="visually-hidden">
        <Trans>Votre message</Trans>
      </label>
      <textarea
        id={champId}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t`Dites-nous ce que vous en pensez...`}
        aria-invalid={erreur !== null}
        aria-describedby={erreur ? `${champId}-erreur` : undefined}
      />

      {erreur && (
        <p id={`${champId}-erreur`} className="boite-suggestion__erreur" role="alert">
          {erreur}
        </p>
      )}

      <button type="submit" className="boite-suggestion__bouton">
        <Trans>Envoyer par email</Trans>
      </button>
    </form>
  );
}