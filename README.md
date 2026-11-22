# 📚 Litto-Bingo

Un générateur de bingo littéraire : une grille de consignes de lecture aléatoires (genre, thème, contrainte...), à cocher au fil de vos lectures, avec suivi de progression, historique de relectures, archive complète de vos bingos passés, statistiques de lecture, **badges** à débloquer (permanents, saisonniers, annuels) exportables en image, liste des livres lus et compte à rebours optionnel. Disponible en français et en anglais.

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

## 🚀 MVP2 retenu : "Archive du Lecteur"

Second incrément, une fois le retour utilisateur post-MVP1 traité. Sur 4 MVP envisagés pour cet incrément (Archive Brute / Tableau de Bord / Badges / revue de conception "Prêt-pour-le-Groupe"), la séquence **Archive Brute → Tableau de Bord** a été retenue en un seul cycle (les deux partagent le même Bounded Context) car :
- l'historique (Archive Brute) est un prérequis technique pur : sans données fiables, aucune statistique n'est calculable ;
- le Tableau de Bord est la vraie valeur différenciante actée en BDD (Q5 : orienter vers un futur comparatif de groupe sans jamais construire de backend prématurément) ;
- les Badges (jalons, gamification) sont repoussés après ce cycle, pour calibrer des seuils réalistes sur de vraies données plutôt qu'à l'aveugle.

**Décision actée pour l'avenir (Q4 du BDD de ce cycle)** : la contrainte "zéro budget" n'est plus absolue mais **conditionnelle** — un backend devient acceptable uniquement s'il reste gratuit même à 10 000 utilisateurs (architecture économe en requêtes). Aucun des MVP de ce cycle n'en a eu besoin ; la question ne se posera réellement qu'au moment du mode groupe (MVP3 du produit).

## 🚀 MVP3 retenu : "Les Badges" (+ "Liste des livres lus")

Troisième incrément, une fois les statistiques disponibles pour calibrer des seuils réalistes.

**Décisions actées en BDD (5 questions)** :
- **Nature** : jalons quantitatifs en majorité, quelques « exploits » ponctuels pour assaisonner.
- **Partage** : un badge doit pouvoir être exporté en image, pour être montré hors de l'application.
- **Notification** : immédiate, au moment précis du déblocage.
- **Non rétroactif** : seuls comptent les bingos archivés depuis l'activation des badges. Un bingo archivé est immuable, donc les exploits n'ont aucun problème de recalcul.
- **Valeur** : un langage commun pour le futur mode groupe (comparer ses badges).

**Lean Startup** : sur 4 MVP évalués, « Badges Complets » (quantitatifs + exploits + notification) et « Badge à Montrer » (export en image) ont été traités ensemble en un cycle. La « Galerie de Progression » a été réduite à l'essentiel (l'avancement « X sur Y »).

**Extension saisonnière** (demande utilisateur en cours de cycle) : 8 badges de saison sur quatre fenêtres fixes (printemps 20 mars–20 juin, été 21 juin–22 sept., automne 23 sept.–20 déc., hiver 21 déc.–19 mars ; hémisphère nord, bornes en UTC), plus un badge « Pionnier » par année civile. Une saison revient chaque année mais chaque badge de saison reste unique ; deux occurrences d'une même saison ne se cumulent jamais. Deux badges demandés (Calendrier de l'Avent, Automne Frissonnant) sont reportés : ils exigent de connaître la date et le genre de *chaque* lecture, que l'archive ne conserve pas.

**Mini-cycle « Liste des livres lus »** (BDD allégé + TDD) : on l'ouvre en cliquant sur la carte « Livres distincts lus » des statistiques. Deux tris (alphabétique, par bingo). Les titres qui ne diffèrent que par la casse, les accents ou les espaces sont **signalés comme proches sans être fusionnés** : la statistique reste inchangée. Née d'un doute sur le comptage des livres, levé grâce à cette liste (des titres répétés pendant les tests).

---

## 🏗️ Stack technique

- **Frontend** : React + TypeScript, Vite (avec le plugin SWC, requis par Lingui)
- **Tests** : Vitest (unitaires sur le domaine, intégration sur la persistance avec `jsdom`) + contrôle de types strict (`tsc --noEmit`)
- **Style** : CSS natif (custom properties, `@container` queries, `clamp()`/`cqi` pour le responsive fluide), sans framework CSS
- **Persistance** : `localStorage`, derrière une interface `BingoRepository` (Port/Adapter)
- **Internationalisation** : Lingui (FR source, EN traduit), avec traduction à la volée des consignes déjà générées
- **Qualité des tests** : Stryker (mutation testing), sur tous les fichiers du domaine des badges et de la liste des livres
- **Export d'image** : SVG composé puis dessiné sur un `canvas`, sans dépendance externe ; `react-dom/server` chargé à la demande

---

## ✅ Ce qui a été fait

### Méthodologie

**Cycle MVP1 — "Mon Bingo Vivant"**
1. **BDD** — 3 personas, 11 scénarios Gherkin (cas nominaux, limites, erreurs)
2. **Lean Startup** — 4 MVP évalués, MVP2 "Bingo Vivant" sélectionné
3. **Event Storming** — 2 Bounded Contexts (Génération de Bingo, Suivi de Progression), 1 Aggregate (`Bingo`) avec ses invariants métier
4. **TDD Analyzer** — 19 tests planifiés en ordre de complexité croissante (Transformation Priority Premise)
5. **TDD Implementer** — domaine implémenté en TDD strict (23 tests, cycle Red/Green/Refactor complet)
6. **Frontend UI** — 7 composants (Atomic Design), audités à l'accessibilité (WAVE, WCAG AA)
7. **Persistance** — Repository `localStorage` avec Data Mapper, 4 tests d'intégration
8. **Retour utilisateur (post-MVP)** — 12 demandes triées par effort/valeur, implémentées sans repasser systématiquement par le cycle TDD complet (décision assumée pour aller plus vite, au prix d'un risque de régression accepté et surveillé via `npm test`/`npm run typecheck` à chaque étape)

**Cycle MVP2 — "Archive du Lecteur"**
1. **BDD** — 3 personas (orientés gamification/comparatif futur), 10 scénarios Gherkin
2. **Lean Startup** — 4 MVP évalués, séquence Archive Brute → Tableau de Bord retenue (Badges repoussés)
3. **Event Storming** — 2 nouveaux Bounded Contexts (Archivage de Bingo, Statistiques de Lecture), 2 Aggregates (`BingoArchive`, `Statistiques`) + modification de l'Aggregate `Bingo` existant
4. **TDD Analyzer** — 19 tests planifiés
5. **TDD Implementer** — 23 tests au total (dont 2 ajouts en cours de route : un écart détecté entre l'UI prévue et les champs réellement testés dans `Statistiques`, corrigé par un aller-retour TDD immédiat plutôt que laissé filer)
6. **Frontend UI** — 5 nouveaux composants (CarteStatistique, LigneHistorique, TableauStatistiques, ListeHistorique, PageHistorique) + modification de `FormulaireLivre` (champ pages)
7. **Persistance** — 2 Repository (`BingoRepository` corrigé pour préserver la date de création, nouveau `ArchiveRepository`), archivage automatique à la complétion ou au remplacement d'un bingo

**Cycle MVP3 — "Les Badges"**
1. **BDD** — 3 personas, 8 scénarios Gherkin, plus 11 pour l'extension (saisons, Pionnier, paliers longs)
2. **Lean Startup** — 4 MVP évalués ; séquence « Badges Complets » + « Badge à Montrer » retenue
3. **Event Storming** — 1 Bounded Context (Succès de Lecture), 1 Aggregate (`ProgressionBadges`) qui consomme `BingoArchivé` ; delta pour les fenêtres temporelles
4. **TDD Analyzer** — 19 tests planifiés, puis 34 pour l'extension saisonnière
5. **TDD Implementer** — déblocage, fenêtres et occurrences de saison, avancement, affichage, service de déblocage, catalogue, composition de l'image et orchestrateur d'export, normalisation et liste des livres. **Score de mutation global : 98,3 %** (578 mutants tués, 10 survivants documentés et acceptés)
6. **Frontend UI** — BadgeVisuel, CarteBadge, ListeBadges, PageBadges, NotificationBadge, ZoneNotificationsBadges, ListeLivresLus, ModaleLivresLus
7. **Persistance** — repository `localStorage` asynchrone, à lecture tolérante
8. **Câblage et traduction** — branchement dans `PageBingo`, plus de 70 nouveaux textes traduits en anglais

### Fonctionnalités livrées
- Écran de configuration à la création : taille de grille (3x3/4x4/5x5), filtre **multi-genre** (cases à cocher, ou "tous genres"), date de fin optionnelle via un calendrier natif
- Génération à partir d'un catalogue de consignes couvrant 15 genres (roman, romance, policier, manga, science-fiction, fantastique, fantasy, BD, comics, roman graphique, romantasy, dark romance, dark fantasy, roman noir, cosy mystery)
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
- **Historique multi-bingo** : chaque bingo complété ou abandonné (remplacé par un nouveau, y compris via la conservation de cases) est archivé automatiquement, consultable depuis "Voir mon historique"
- **Saisie du nombre de pages** par livre lu (optionnelle), visible dans l'historique de relectures d'une case
- **Tableau de statistiques** : bingos réussis/abandonnés, cases complétées, livres distincts lus, pages lues, cases renouvelées, durée moyenne de complétion, genre le plus rapide/le plus lent — avec un message dédié tant qu'aucune donnée n'existe
- Archivage en **snapshot allégé** (pas la grille complète) pour limiter la croissance du stockage local dans le temps
- Dates de fin de bingo ancrées sur **UTC** (plutôt que le fuseau du navigateur), pour une cohérence future si un bingo est un jour partagé entre personnes de fuseaux différents (mode groupe)

- **Badges** : 20 badges (12 permanents : paliers de bingos, de livres, de genres et de pages, plus deux exploits « Éclair » et « Sans filet » ; 8 badges de saison) et un badge **Pionnier** par année civile. Un bingo abandonné ne débloque rien, et un badge n'est jamais redébloqué.
- **Notifications de déblocage** : une par badge, empilées, sans disparition automatique ; « Tout fermer », touche Échap, annonce vocale pour les lecteurs d'écran. Un badge est marqué « notifié » dès son affichage.
- **Page des badges** : trois sections (permanents, de saison, Pionnier), avancement « X sur Y » pour les badges quantitatifs verrouillés. Pour un badge de saison ou d'année, l'avancement ne reflète que l'occurrence en cours (0 hors saison). Un Pionnier d'une année révolue non obtenu n'est plus affiché.
- **Export d'un badge en image** (PNG 1 080 × 1 080 : sceau, nom, condition, mention) : partage natif sur appareil tactile, téléchargement sur ordinateur ; en cas d'échec, un message le signale et le badge reste intact.
- **Liste des livres lus** (modale ouverte depuis les statistiques) : tri alphabétique ou par bingo, nombre de bingos par titre, titres proches signalés.
- **Bingo complété figé** : une fois complété et archivé, il n'est plus modifiable et ne peut plus être archivé une seconde fois.

### Modules du code
```
src/features/litto-bingo/
├── litto-bingo.ts                  → domaine pur du bingo (genererGrille, cocherCase,
│                                      remplacerConsigne, enregistrerPagesLivre, etc.)
├── litto-bingo.dto.ts / .mapper.ts → format de sérialisation et conversion domaine ↔ stockage
├── litto-bingo.repository.ts       → Port + Adapter localStorage du bingo actif
├── litto-bingo-archive.ts          → archive immuable et statistiques (archiverBingo,
│                                      calculerStatistiques)
├── litto-bingo-archive.repository.ts → Port + Adapter localStorage des archives
├── litto-bingo-badges.ts           → domaine pur des badges : déblocage, fenêtres et
│                                      occurrences de saison, avancement, famille
├── litto-bingo-badges-catalogue.ts → catalogue (20 badges + Pionnier) et date d'activation
├── litto-bingo-badges-presentation.ts → noms, conditions, pictogrammes (textes Lingui)
├── litto-bingo-badges-affichage.ts → assemble ce que la page des badges affiche
├── litto-bingo-badges-service.ts   → service de déblocage (archives → progression)
├── litto-bingo-badges.repository.ts → Port + Adapter localStorage de la progression
├── litto-bingo-badges-export.ts    → composition pure du SVG de l'image exportée
├── litto-bingo-badges-exporter.ts  → orchestrateur d'export (dépendances injectées)
├── litto-bingo-badges-exporter.navigateur.ts → adapters navigateur : rendu, canvas,
│                                      partage, téléchargement (contrôle visuel manuel)
├── litto-bingo-texte.ts            → découpage en lignes et échappement XML
├── litto-bingo-livres.ts           → normalisation des titres, liste des livres lus,
│                                      regroupement par bingo
├── litto-bingo-test-utils.ts       → fabrique d'archives pour les tests
├── *.test.ts                       → un fichier de tests par module ci-dessus
├── consignes-catalogue.ts          → catalogue par langue + genres + traduction par id
├── data/consignes.json, consignes_en.json → consignes FR et EN (mêmes id et genres)
├── components/                     → CaseBingo, FormulaireLivre, FormulaireNouveauBingo,
│                                      BarreProgression, CompteARebours, GrilleBingo,
│                                      EnTeteBingo, PageBingo, SelecteurLangue, BoiteSuggestion,
│                                      CarteStatistique, LigneHistorique, TableauStatistiques,
│                                      ListeHistorique, PageHistorique, BadgeVisuel, CarteBadge,
│                                      ListeBadges, PageBadges, NotificationBadge,
│                                      ZoneNotificationsBadges, ListeLivresLus, ModaleLivresLus
├── assets/                         → decor-mosaique.svg (motif décoratif saisonnier)
└── styles/                         → CSS natif par composant, tokens.css, utilitaires.css

src/
├── i18n.ts                         → initialisation et activation des locales Lingui
└── locales/{fr,en}/messages.po     → catalogues de traduction (lingui extract)

scripts/stryker-ts6.mjs             → réinjecte TypeScript 6 pour Stryker (voir notes techniques)
stryker.config.json                 → configuration du contrôle de mutation
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
- **UTC plutôt que "fuseau fixe nommé"** pour les dates de fin : un fuseau national (ex. heure française) observe lui aussi des changements d'heure été/hiver, ce qui ne règle rien ; seul UTC n'a jamais de changement d'heure. Les durées (`dureeMs`, compte à rebours) étaient déjà sûres par construction puisque calculées par différence de millisecondes entre deux instants absolus, jamais par arithmétique de calendrier.
- **Vigilance sur la dérive UI/domaine** : à deux reprises pendant MVP2 (Archive du Lecteur), un composant UI a failli afficher un champ (`totalLivresDistincts`, puis trois autres champs de `Statistiques`) jamais réellement testé ni implémenté dans le domaine — l'écart a été détecté avant d'être livré, et corrigé par un aller-retour TDD immédiat plutôt que laissé filer. Signal à surveiller : toujours vérifier qu'un champ utilisé côté UI existe bien dans le tableau TPP d'origine.

- **Stryker et TypeScript 7** : Stryker 10 plante au démarrage (`ts.parseConfigFileTextToJson is not a function`) car TypeScript 7 n'expose plus cette fonction. Contournement : un script `postinstall` (`scripts/stryker-ts6.mjs`) place une copie de TypeScript 6 *sous* le dossier de Stryker, que Node trouve avant le TypeScript du projet. Il ne touche pas au TypeScript de build, ne s'exécute que si Stryker est présent, et ne bloque jamais l'installation (simple avertissement en cas d'échec). Un `npm install` efface cette copie, d'où le `postinstall`.
- **Le domaine ne lit jamais l'horloge** : la date du jour est toujours passée en paramètre (`maintenant`, année courante du catalogue). Toutes les saisons sont calculées en **UTC**, sur des bornes inclusives, avec une clé d'occurrence rattachant le début de l'hiver (décembre) et sa fin (janvier à mars) à la même année de départ.
- **Une seule règle pour « ce qui compte »** : le déblocage et l'avancement affiché s'appuient sur la même fonction (`archivesComptabilisables`), pour qu'ils ne puissent jamais diverger.
- **Export d'image** : l'orchestrateur reçoit ses dépendances (rendu du sceau, conversion, partage, téléchargement), ce qui rend testable toute la logique de décision : l'annulation du partage n'est pas une erreur, un partage qui échoue replie sur le téléchargement, toute autre défaillance devient une erreur unique. Les couleurs du sceau sont des attributs SVG littéraux, pas des variables CSS, car l'image est dessinée hors de la page. Le partage natif est réservé aux appareils tactiles : sur ordinateur, Windows proposait sinon sa fenêtre de partage.
- **Bug trouvé en test réel** : après complétion, la grille restait cliquable et chaque modification ré-archivait le bingo (et « Commencer un nouveau bingo » l'archivait une seconde fois comme abandonné). Un bingo en double comptait deux fois pour les badges et faussait « Livres distincts lus ». Corrigé par une grille figée une fois complétée, et un garde « déjà archivé ».
- **Comparaison des titres** : « Dune », « dune » et « Dune » (espace final) sont comptés comme trois livres par les statistiques et les badges. La liste des livres les **signale** comme proches (clé de comparaison sans casse, accents, espaces superflus ni apostrophes typographiques) sans les fusionner. Fusionner reste une décision à prendre.
- **Mutants survivants acceptés (10)** : les deux couleurs de texte de l'image exportée (choix de design), le message de l'erreur d'export (journaux seulement), et 7 mutants équivalents du repository (des gardes qui se recouvrent, chacune invisible isolément).
- **Limites connues** : les nombres des descriptions de badges (« 10 bingos », dates de saison) sont écrits en dur dans `litto-bingo-badges-presentation.ts` et doublonnent le catalogue, sans test automatique. Les saisons suivent l'hémisphère nord. Les composants React ne sont validés que manuellement (WAVE, vérifications visuelles), `PageBingo` compris. `DATE_ACTIVATION_BADGES` est provisoire (2026-10-24, phase de test).

---

## 🔜 Ce qu'on compte faire ensuite

### Retour utilisateur post-MVP1 (triage effort/valeur)
Douze demandes ont été recueillies après un premier retour d'usage réel. Neuf sont déjà faites. Restent, par ordre de priorité décroissante :
1. **Consignes saisonnières optionnelles** (ex. "lire à la plage" en été) — activables en option, sans forcer leur présence dans toutes les grilles.
2. **Jukebox sonore** (pluie, feu de cheminée) — mis en dernier volontairement : le plus coûteux en effort (gestion audio, droits des sons, préférence utilisateur pour ne pas imposer du son) pour la valeur la plus incertaine du lot.
3. **Filtre anti-contenu** (mots tabous) — gardé en réserve : le catalogue de consignes est actuellement entièrement contrôlé par l'équipe (pas de contenu généré par les utilisateurs), donc le risque réel est quasi nul aujourd'hui. À ressortir dès qu'une fonctionnalité introduit du texte libre modérable (consignes personnalisées, mode groupe).
4. **Détection automatique de la saison réelle** pour le décor — le décor automnal est fixe pour l'instant ; prévu pour devenir une fonction `obtenirDecorSaison(date)` qui choisit le bon SVG selon la date.

### Suite du cycle MVP3 (Badges)
1. **Badges de seconde vague** : Calendrier de l'Avent (24 cases en décembre) et Automne Frissonnant (un livre d'horreur à Halloween). Ils exigent d'enrichir l'archive d'une liste `{ date, genre }` par lecture, enrichissement qui offrirait aussi un ordre chronologique réel à la liste des livres. Le genre « horreur » n'existe pas dans le catalogue : choisir le plus proche.
2. **Décor saisonnier automatique** (flocons, arcs-en-ciel, tournesols) en réutilisant les fenêtres de saison des badges, pour n'avoir qu'**une seule définition** des saisons.
3. **Normalisation des titres** pour le comptage des livres distincts (aujourd'hui seulement signalée).
4. **Alerte de saturation du stockage**, et **export / suppression de l'historique**.
5. **Harmonisation du tu et du vous** dans les textes français (la source mélange les deux, l'anglais n'est pas concerné).
6. **Seuils des badges** à recalibrer sur de vrais usages.

### Séquence produit plus large (actée lors du Lean Startup)
1. **Enrichir encore le catalogue de consignes** par genre pour réduire les répétitions perçues sur plusieurs bingos successifs.
2. **MVP3 du produit — "Défi de Groupe"** — partage d'un bingo par lien avec un petit groupe d'ami·es, chacun suivant sa propre progression sur une grille commune. Nécessitera un backend conditionnel (acceptable seulement s'il reste gratuit même à 10 000 utilisateurs, cf. décision actée en BDD du cycle MVP2) et introduira potentiellement Symfony/PHP côté serveur — et probablement `HashRouter` si des URLs dédiées par bingo apparaissent à cette occasion. Les statistiques ont été conçues dès ce cycle (fonctions pures prenant une liste d'archives en entrée) pour pouvoir alimenter un futur classement comparatif sans réécriture.
3. **Vrai envoi d'email** pour la boîte à suggestions, en remplacement du `mailto:` transitoire, une fois un backend disponible.
4. **Tests d'UI** — les composants React n'ont pour l'instant été validés que manuellement (câblage direct dans `PageBingo` + audits WAVE) ; une couverture de tests automatisés (React Testing Library) serait à ajouter avant une mise en production.
5. **Storybook** — les fichiers `.stories.tsx` ont été rédigés pour les composants du MVP1 mais Storybook n'est pas installé sur le projet ; à faire pour isoler les composants sans dépendre d'un câblage manuel.

---

## 🧪 Lancer le projet

```bash
npm install
npm run dev         # serveur de développement
npm test            # suite de tests (Vitest)
npm run typecheck   # contrôle de types strict (tsc --noEmit)
npm run extract     # extrait les textes traduisibles vers src/locales/*/messages.po
npm run compile     # compile les catalogues de traduction (à faire après toute traduction)
npm run mutation    # contrôle de mutation Stryker (réinjecte TypeScript 6 au besoin, voir notes techniques)
```
