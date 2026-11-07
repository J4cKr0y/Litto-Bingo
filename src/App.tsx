import { useState } from 'react';
import {
  ZoneNotificationsBadges,
  type NotificationAffichee,
} from './features/litto-bingo/components/ZoneNotificationsBadges';
import { obtenirPresentationBadge } from './features/litto-bingo/litto-bingo-badges-presentation';
import './features/litto-bingo/styles/tokens.css';

const IDS = ['premier-pas', 'eclair', 'sans-filet', 'feuilles-et-chapitres', 'pionnier-2027', 'reveil-litteraire'];

function creerNotifications(): NotificationAffichee[] {
  return IDS.map((id) => ({ id, ...obtenirPresentationBadge(id) }));
}

function App() {
  const [notifications, setNotifications] = useState(creerNotifications);

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Aperçu ZoneNotificationsBadges</h1>
      <button type="button" onClick={() => setNotifications(creerNotifications())}>
        Débloquer 6 badges d'un coup
      </button>
      <button type="button" onClick={() => setNotifications((l) => [...l.slice(0, 1)])}>
        Une seule
      </button>

      <ZoneNotificationsBadges
        notifications={notifications}
        onFermer={(id) => setNotifications((l) => l.filter((n) => n.id !== id))}
        onToutFermer={() => setNotifications([])}
        onVoirBadges={() => console.log('voir les badges')}
      />
    </main>
  );
}

export default App;