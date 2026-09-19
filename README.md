# 📚 Litto-Bingo

Un générateur de bingo littéraire : une grille 5x5 de consignes de lecture aléatoires (genre, thème, contrainte...), à cocher au fil de vos lectures, avec suivi de progression et compte à rebours optionnel.

---

## 🎯 Vision produit

**Cible principale** : lecteurs et lectrices amateurs (grand public), avec un focus initial sur l'usage solo, pensé pour évoluer vers un usage partagé entre ami·es.

**Problème résolu** : les bingos littéraires qu'on trouve en ligne sont des images statiques (Canva, Instagram) qu'on remplit à la main, sans aucun suivi de progression ni de statistiques.

**Différenciation** : génération intelligente et filtrable par genre (manga / policier / SFFF / roman...), avec un moteur qui garantit des consignes distinctes et une grille cohérente même quand le réservoir de consignes est limité.

### Personas
- **Léa** — lectrice solo, motivée par le suivi de sa progression
- **Sarah** — anime un petit groupe de lecture, veut partager un bingo commun
- **Marc** — lecteur mono-genre exigeant, veut un défi calibré uniquement sur son genre de prédilection

---

## 🚀 MVP retenu : "Mon Bingo Vivant"

Sur 4 MVP envisagés (Générateur Pur / Bingo Vivant / Défi de Groupe / Archive du Lecteur), **"Mon Bingo Vivant"** a été retenu en premier car il :
- couvre le cœur de la valeur différenciante (génération filtrée) tout en ajoutant le minimum vital pour que l'outil serve réellement (suivi de progression) ;
- respecte la contrainte "zéro budget serveur" (100% front, `localStorage`) ;
- pose des fondations techniques (modèle de données, persistance abstraite) réutilisables telles quelles pour les MVP suivants.

**Contrainte architecturale actée** : stockage local pour ce MVP, mais avec une interface de persistance abstraite (pattern Repository) pour pouvoir brancher un vrai backend plus tard sans réécrire le domaine ni l'UI.

---

## 🏗️ Stack technique

- **Frontend** : React + TypeScript, Vite
- **Tests** : Vitest (unitaires sur le domaine, intégration sur la persistance avec `jsdom`)
- **Style** : CSS natif (custom properties, `@container` queries, `clamp()`/`cqi` pour le responsive fluide), sans framework CSS
- **Persistance** : `localStorage`, derrière une interface `BingoRepository` (Port/Adapter)

---

## ✅ Ce qui a été fait

### Méthodologie
1. **BDD** — 3 personas, 11 scénarios Gherkin (cas nominaux, limites, erreurs)
2. **Lean Startup** — 4 MVP évalués, MVP2 "Bingo Vivant" sélectionné
3. **Event Storming** — 2 Bounded Contexts (Génération de Bingo, Suivi de Progression), 1 Aggregate (`Bingo`) avec ses invariants métier
4. **TDD Analyzer** — 19 tests planifiés en ordre de complexité croissante (Transformation Priority Premise)
5. **TDD Implementer** — domaine implémenté en TDD strict (23 tests, cycle Red/Green/Refactor complet)
6. **Frontend UI** — 7 composants (Atomic Design), audités à l'accessibilité (WAVE, WCAG AA)
7. **Persistance** — Repository `localStorage` avec Data Mapper, 4 tests d'intégration

### Fonctionnalités livrées
- Écran de configuration à la création : choix du genre (ou "Tous genres") et d'une date de fin optionnelle via un calendrier natif
- Génération d'une grille 5x5 à partir d'un catalogue de 120 consignes (30 par genre : roman, policier, manga, SFFF)
- Filtrage par genre, avec gestion du cas "pas assez de consignes disponibles"
- Cases à cocher avec saisie obligatoire du livre associé
- Modification ou décochage d'une case déjà validée (droit à l'erreur en cas de faute de frappe ou de clic accidentel)
- Date de fin optionnelle avec compte à rebours (et état "urgent" sous 2 jours)
- Détection automatique de bingo expiré ou complété (avec bandeau de félicitations)
- Bouton "Nouveau bingo" (avec confirmation si une progression existe), qui repasse par l'écran de configuration
- Persistance automatique : la grille survit à la fermeture du navigateur et se recharge à l'identique
- Mise en page responsive, du mobile étroit (~320px, avec défilement horizontal en dernier recours) au grand écran desktop

### Modules du code
```
src/features/litto-bingo/
├── litto-bingo.ts               → domaine pur (genererGrille, cocherCase, decocherCase, etc.)
├── litto-bingo.test.ts          → 23 tests unitaires du domaine
├── litto-bingo.dto.ts           → format de sérialisation (GrillePersistee)
├── litto-bingo.mapper.ts        → conversion domaine ↔ persistance
├── litto-bingo.repository.ts    → Port (interface) + Adapter localStorage
├── litto-bingo.repository.test.ts → 4 tests d'intégration
├── consignes-catalogue.ts       → chargement du catalogue de consignes + genres disponibles
├── data/consignes.json          → 120 consignes (30 × 4 genres)
├── components/                  → CaseBingo, FormulaireLivre, FormulaireNouveauBingo,
│                                   BarreProgression, CompteARebours, GrilleBingo,
│                                   EnTeteBingo, PageBingo
└── styles/                      → CSS natif par composant + tokens.css (thème global)
```

### Points techniques notables (vus en cours de route)
- Plusieurs pièges CSS classiques rencontrés et corrigés : `1fr` en grid nécessite `minmax(0, 1fr)` pour rétrécir sous son contenu, les unités `cqi`/règles `@container` ne peuvent pas s'appliquer à l'élément qui déclare son propre `container-type` (il faut les poser sur un enfant), `min-width: 0` est nécessaire sur les enfants flex pour qu'ils rétrécissent correctement.
- `color-scheme: light` fixé globalement pour éviter que le thème sombre du navigateur ne rende les champs de formulaire illisibles.
- Focus trap et restauration du focus gérés via l'élément natif `<dialog>`, avec une restauration explicite du focus (le comportement natif n'étant pas fiable sur tous les navigateurs).
- Audits d'accessibilité systématiques (WAVE, WCAG AA) après chaque composant, avec plusieurs correctifs de contraste.

---

## 🔜 Ce que je compte faire ensuite

Séquence actée lors du Lean Startup :

1. **Enrichir le catalogue de consignes** — 30 par genre est un minimum ; en ajouter davantage pour réduire les répétitions perçues sur plusieurs bingos successifs.
2. **MVP4 — "Archive du Lecteur"** — historique multi-bingo (actuellement, un nouveau bingo écrase l'ancien sans trace) + dashboard de statistiques (cases/lignes complétées, temps moyen de complétion). Réutilise directement le modèle de données déjà posé.
3. **MVP3 — "Défi de Groupe"** — partage d'un bingo par lien avec un petit groupe d'ami·es, chacun suivant sa propre progression sur une grille commune. Nécessitera un backend léger (le point de bascule pour lequel l'architecture Repository a été pensée dès le départ) et introduira potentiellement Symfony/PHP côté serveur.
4. **Tests d'UI** — les composants React n'ont pour l'instant été validés que manuellement (câblage dans `App.tsx` + audits WAVE) ; une couverture de tests automatisés (React Testing Library) serait à ajouter avant une mise en production.
5. **Storybook** — les fichiers `.stories.tsx` ont été rédigés pour chaque composant mais Storybook n'est pas installé sur le projet ; à faire pour isoler les composants sans dépendre d'un câblage manuel dans `App.tsx`.

---

## 🧪 Lancer le projet

```bash
npm install
npm run dev     # serveur de développement
npm test        # suite de tests (Vitest)
```
