import '../styles/CarteStatistique.css';

export interface CarteStatistiqueProps {
  /** Valeur à afficher ; null affiche un texte de repli plutôt qu'un nombre trompeur */
  valeur: string | number | null;
  libelle: string;
  /** Texte affiché à la place de `valeur` quand elle vaut null (ex: "Pas encore de données") */
  texteVide?: string;
}

export function CarteStatistique({ valeur, libelle, texteVide = '—' }: CarteStatistiqueProps) {
  return (
    <div className="carte-statistique">
      {valeur === null ? (
        <span className="carte-statistique__valeur carte-statistique__valeur--vide">
          {texteVide}
        </span>
      ) : (
        <span className="carte-statistique__valeur">{valeur}</span>
      )}
      <span className="carte-statistique__libelle">{libelle}</span>
    </div>
  );
}