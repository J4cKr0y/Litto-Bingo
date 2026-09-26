# 📚 Litto-Bingo

Un générateur de bingo littéraire : une grille de consignes de lecture aléatoires (genre, thème, contrainte...), à cocher au fil de vos lectures, avec suivi de progression, historique de relectures et compte à rebours optionnel. Disponible en français et en anglais.

---

## 🎯 Vision produit

**Cible principale** : lecteurs et lectrices amateurs (grand public), avec un focus initial sur l'usage solo, pensé pour évoluer vers un usage partagé entre ami·es.

**Problème résolu** : les bingos littéraires qu'on trouve en ligne sont des images statiques (Canva, Instagram) qu'on remplit à la main, sans aucun suivi de progression ni de statistiques.

**Différenciation** : génération intelligente et filtrable par genre (manga / policier / SFFF / roman / BD / romantasy / dark romance...), avec un moteur qui garantit des consignes distinctes et une grille cohérente même quand le réservoir de consignes est limité.

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

- **Frontend** : React + TypeScript, Vite (avec le plugin SWC, requis par Lingui)
- **Tests** : Vitest (unitaires sur le domaine, intégration sur la persistance avec `jsdom`) + contrôle de types strict (`tsc --noEmit`)
- **Style** : CSS natif (custom properties, `@container` queries, `clamp()`/`cqi` pour le responsive fluide), sans framework CSS
- **Persistance** : `localStorage`, derrière une interface `BingoRepository` (Port/Adapter)
- **Internationalisation** : Lingui (FR source, EN traduit), avec traduction à la volée des consignes déjà générées

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
8. **Retour utilisateur (post-MVP)** — 12 demandes triées par effort/valeur, implémentées sans repasser systématiquement par le cycle TDD complet (décision assumée pour aller plus vite, au prix d'un risque de régression accepté et surveillé via `npm test`/`npm run typecheck` à chaque étape)

### Fonctionnalités livrées
- Écran de configuration à la création : taille de grille (3x3/4x4/5x5), filtre **multi-genre** (cases à cocher, ou "tous genres"), date de fin optionnelle via un calendrier natif
- Génération à partir d'un catalogue de 300 consignes (7 genres : roman, policier, manga, SFFF, BD, romantasy, dark romance)
- Filtrage multi-genre, avec gestion du cas "pas assez de consignes disponibles"
- Cases à cocher avec saisie obligatoire du livre associé
- **Historique de relectures par case** : une case déjà validée peut être revalidée (jusqu'à 25 fois), avec un historique consultable des titres précédents ; possibilité de corriger la dernière entrée sans consommer une relecture, ou de décocher entièrement (efface l'historique)
- **Changement de consigne** (jusqu'à 3 fois par grille, avec compteur affiché) sur une case non cochée, sans redémarrer tout le bingo
- **Conservation de cases** en relançant un nouveau bingo (mode sélection dédié) : les cases gardées conservent leur état coché/livre, le reste est régénéré
- Date de fin optionnelle avec compte à rebours (et état "urgent" sous 2 jours)
- Détection automatique de bingo expiré ou complété (avec bandeau de félicitations)
- Bouton "Nouveau bingo" (avec confirmation si une progression existe), qui repasse par l'écran de configuration
- Persistance automatique : la grille survit à la fermeture du navigateur et se recharge à l'identique
- Mise en page responsive, du mobile étroit (~270px, avec défilement horizontal en dernier recours) au grand écran desktop
- **Interface bilingue** (FR/EN) avec sélecteur de langue, traduction à la volée des consignes déjà générées (via un id stable partagé entre les deux catalogues), et pluriels gérés correctement dans les deux langues
- **Décor saisonnier** (motif automnal fixe dans les marges du grand écran, non lié à la date réelle pour l'instant)
- Titre en police manuscrite (Caveat)
- Boîte à suggestions par email (`mailto:`, solution transitoire en attendant un vrai backend)

### Modules du code
```
src/features/litto-bingo/
├── litto-bingo.ts               → domaine pur (genererGrille, genererGrilleConservant,
│                                   cocherCase, decocherCase, corrigerDerniereEntree,
│                                   remplacerConsigne, etc.)
├── litto-bingo.test.ts          → tests unitaires du domaine
├── litto-bingo.dto.ts           → format de sérialisation (GrillePersistee)
├── litto-bingo.mapper.ts        → conversion domaine ↔ persistance (avec replis pour
│                                   les grilles sauvegardées avant chaque nouveau champ)
├── litto-bingo.repository.ts    → Port (interface) + Adapter localStorage
├── litto-bingo.repository.test.ts → tests d'intégration
├── consignes-catalogue.ts       → chargement du catalogue par langue + genres disponibles
│                                   + lookup de traduction par id de consigne
├── data/consignes.json          → catalogue français (300 consignes, 7 genres)
├── data/consignes_en.json       → catalogue anglais (mêmes id/genre, texte traduit)
├── components/                  → CaseBingo, FormulaireLivre, FormulaireNouveauBingo,
│                                   BarreProgression, CompteARebours, GrilleBingo,
│                                   EnTeteBingo, PageBingo, SelecteurLangue,
│                                   BoiteSuggestion
├── assets/                      → decor-mosaique.svg (motif décoratif saisonnier)
└── styles/                      → CSS natif par composant + tokens.css (thème global)

src/
├── i18n.ts                      → initialisation et activation des locales Lingui
└── locales/{fr,en}/messages.po  → catalogues de traduction (extraits via lingui extract)
```

### Points techniques notables (appris en cours de route)
- Plusieurs pièges CSS classiques rencontrés et corrigés : `1fr` en grid nécessite `minmax(0, 1fr)` pour rétrécir sous son contenu, les unités `cqi`/règles `@container` ne peuvent pas s'appliquer à l'élément qui déclare son propre `container-type` (il faut les poser sur un enfant), `min-width: 0` est nécessaire sur les enfants flex pour qu'ils rétrécissent correctement.
- `color-scheme: light` fixé globalement pour éviter que le thème sombre du navigateur ne rende les champs de formulaire illisibles.
- Focus trap et restauration du focus gérés via l'élément natif `<dialog>`, avec une restauration explicite du focus (le comportement natif n'étant pas fiable sur tous les navigateurs).
- Audits d'accessibilité systématiques (WAVE, WCAG AA) après chaque composant, avec plusieurs correctifs de contraste.
- **Lingui v6** nécessite le plugin SWC (`@vitejs/plugin-react-swc` + `@lingui/swc-plugin`), pas le plugin Babel historique. Les macros `t`/`plural` (`@lingui/core/macro`) se compilent directement sur l'instance globale `i18n` — elles ne doivent **pas** être enveloppées dans `_()` (piège rencontré : ça "fonctionne" par coïncidence en langue source mais casse silencieusement, ou pire, provoque des erreurs de compilation imprévisibles sur des macros imbriquées). `useLingui()` sert uniquement à abonner un composant aux changements de langue, pas à traduire.
- Catalogue de consignes dupliqué par langue (mêmes `id`/`genre`, `texte` traduit) plutôt qu'un système de traduction généraliste : simple, mais demande de maintenir les fichiers `consignes*.json` synchronisés à la main si le catalogue français évolue.
- **Décision actée pour le futur** : aucun routeur n'est utilisé actuellement (une seule vue, navigation par état React). Si un besoin de routage apparaît (ex. une URL dédiée par bingo pour l'historique du MVP4), utiliser **`HashRouter`** et non `BrowserRouter` — le projet étant 100% front sans backend (probable hébergement statique), `BrowserRouter` casserait au rechargement sur une route autre que la racine, faute de configuration serveur pour rediriger vers `index.html`.
- **Déploiement GitHub Pages** : le dossier de build Vite est `dist/` (pas `build/`), et `base` doit être configuré dans `vite.config.ts` avec le nom du dépôt pour que les assets se chargent correctement sous `username.github.io/nom-du-repo/`.

---

## 🔜 Ce qu'on compte faire ensuite

### Retour utilisateur post-MVP (triage effort/valeur)
Douze demandes ont été recueillies après un premier retour d'usage réel. Neuf sont déjà faites (voir ci-dessus). Restent, par ordre de priorité décroissante :
1. **Consignes saisonnières optionnelles** (ex. "lire à la plage" en été) — activables en option, sans forcer leur présence dans toutes les grilles.
2. **Jukebox sonore** (pluie, feu de cheminée) — mis en dernier volontairement : le plus coûteux en effort (gestion audio, droits des sons, préférence utilisateur pour ne pas imposer du son) pour la valeur la plus incertaine du lot.
3. **Filtre anti-contenu** (mots tabous) — gardé en réserve : le catalogue de consignes est actuellement entièrement contrôlé par l'équipe (pas de contenu généré par les utilisateurs), donc le risque réel est quasi nul aujourd'hui. À ressortir dès qu'une fonctionnalité introduit du texte libre modérable (consignes personnalisées, mode groupe).
4. **Détection automatique de la saison réelle** pour le décor — le décor automnal est fixe pour l'instant ; prévu pour devenir une fonction `obtenirDecorSaison(date)` qui choisit le bon SVG selon la date.

### Séquence produit plus large (actée lors du Lean Startup)
1. **Enrichir encore le catalogue de consignes** par genre pour réduire les répétitions perçues sur plusieurs bingos successifs.
2. **MVP4 — "Archive du Lecteur"** — historique **multi-bingo** (actuellement, un nouveau bingo écrase l'ancien sans trace, l'historique livré ne concerne que les relectures d'une même case) + dashboard de statistiques (cases/lignes complétées, temps moyen de complétion). Réutilise directement le modèle de données déjà posé.
3. **MVP3 — "Défi de Groupe"** — partage d'un bingo par lien avec un petit groupe d'ami·es, chacun suivant sa propre progression sur une grille commune. Nécessitera un backend léger (le point de bascule pour lequel l'architecture Repository a été pensée dès le départ) et introduira potentiellement Symfony/PHP côté serveur — et probablement `HashRouter` si des URLs dédiées par bingo apparaissent à cette occasion.
4. **Vrai envoi d'email** pour la boîte à suggestions, en remplacement du `mailto:` transitoire, une fois un backend disponible.
5. **Tests d'UI** — les composants React n'ont pour l'instant été validés que manuellement (câblage dans `App.tsx` + audits WAVE) ; une couverture de tests automatisés (React Testing Library) serait à ajouter avant une mise en production.
6. **Storybook** — les fichiers `.stories.tsx` ont été rédigés pour chaque composant mais Storybook n'est pas installé sur le projet ; à faire pour isoler les composants sans dépendre d'un câblage manuel dans `App.tsx`.

---

## 🧪 Lancer le projet

```bash
npm install
npm run dev         # serveur de développement
npm test            # suite de tests (Vitest)
npm run typecheck   # contrôle de types strict (tsc --noEmit)
npm run extract     # extrait les textes traduisibles vers src/locales/*/messages.po
npm run compile     # compile les catalogues de traduction (à faire après toute traduction)
```
