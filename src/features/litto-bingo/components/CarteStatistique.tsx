import '../styles/CarteStatistique.css';

export interface CarteStatistiqueProps {
  /** Valeur à afficher ; null affiche un texte de repli plutôt qu'un nombre trompeur */
  valeur: string | number | null;
  libelle: string;
  /** Texte affiché à la place de `valeur` quand elle vaut null (ex: "Pas encore de données") */
  texteVide?: string;
  /** Rend la carte cliquable (bouton natif). `libelleAction` est alors affiché comme indice visible. */
  onActiver?: () => void;
  libelleAction?: string;
}

export function CarteStatistique({
  valeur,
  libelle,
  texteVide = '—',
  onActiver,
  libelleAction,
}: CarteStatistiqueProps) {
  const contenu = (
    <>
      {valeur === null ? (
        <span className="carte-statistique__valeur carte-statistique__valeur--vide">
          {texteVide}
        </span>
      ) : (
        <span className="carte-statistique__valeur">{valeur}</span>
      )}
      <span className="carte-statistique__libelle">{libelle}</span>
      {onActiver && libelleAction && (
        <span className="carte-statistique__action">{libelleAction}</span>
      )}
    </>
  );

  if (onActiver) {
    return (
      <button
        type="button"
        className="carte-statistique carte-statistique--cliquable"
        onClick={onActiver}
      >
        {contenu}
      </button>
    );
  }

  return <div className="carte-statistique">{contenu}</div>;
}