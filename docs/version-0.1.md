# Version 0.1 — premier carnet utilisable

## Architecture

Un fichier HTML contient le CSS, le JavaScript et les 41 fiches initiales. Aucun service externe n’est nécessaire à la sauvegarde ou à l’édition. Les photos distantes et les liens documentaires utilisent Internet.

Le choix de sauvegarde par défaut est local, conformément à l’étape acceptée : aucune synchronisation ou authentification n’est ajoutée. Les exports JSON et HTML assurent le transfert et la sauvegarde. La version de format est `1`.

Le stockage utilise la clé `watch-selection.collection.v1`. Chaque fiche possède un identifiant stable, des rôles (plusieurs possibles), caractéristiques, photos et secours éventuels, liens, textes éditoriaux et notes. Les huit choix principaux référencent des identifiants de fiches. Retirer un rôle d’une fiche choisie désélectionne seulement son choix dans ce rôle ; aucune autre candidate n’est sélectionnée automatiquement.

## Comportements importants

- Parcourir les candidates ne change pas votre choix. L’action « Choisir celle-ci » le sauvegarde explicitement.
- Les notes se sauvegardent dès la saisie. Une fiche modifiée se sauvegarde seulement après « Enregistrer » ; annuler ne change rien.
- Les caractéristiques peuvent être ajoutées, modifiées et retirées. Les catégories sont éditables. Un modèle non catégorisé reste visible dans le catalogue.
- L’éditeur conserve les avis, les sources et les variantes du document initial. Une nouvelle photo principale remplace la première image ; les autres restent disponibles. Une URL nocturne optionnelle ajoute une image réelle, sans simulation lumineuse.
- Les liens et photos renseignés manuellement utilisent HTTPS. Le texte est affiché comme texte, jamais interprété comme HTML.
- Importer implique de remplacer toute la collection après confirmation avec le nombre de fiches/choix. La validation vérifie notamment version, identifiants uniques, rôles, cohérence des choix et URL ; taille maximale 30 Mo.
- Le carnet HTML exporté contient l’état courant et fonctionne sans les autres fichiers du dépôt. Il réutilise le stockage local s’il en existe un pour son adresse. Le JSON permet de remplacer explicitement cet état.
- Un échec de stockage ne fait pas croire à une sauvegarde réussie. Une ancienne sauvegarde illisible n’est pas écrasée sans action explicite. Un changement dans un autre onglet bloque les écritures devenues obsolètes.

## Validation effectuée

Suite Playwright sur Chromium : 41 fiches initiales, huit rôles, notes et choix conservés après rechargement, édition des prix/descriptions, ajout manuel, refus d’URL HTTP, affichage littéral de balises dans un nom, export JSON, refus d’import invalide, annulation d’import, remplacement/restauration JSON et démarrage d’un HTML exporté dans un navigateur sans données précédentes. Affichage testé à 390 px ; stockage refusé, sauvegarde corrompue et conflit entre onglets également vérifiés.

Installation reproductible testée avec `npm ci --ignore-scripts`. Le navigateur cloud interdit les URL `file://` : l’exécution et l’HTML exporté ont été validés via HTTP local. L’ouverture par double clic dépend des règles du navigateur utilisé ; la sauvegarde en mémoire et les exports restent disponibles si son stockage local est refusé.

## Limites et suites

Les images externes sont conservées avec leurs sources, mais leur téléchargement est bloqué par le proxy de cet environnement pour plusieurs domaines. Les visuels manquants ne sont ni inventés ni remplacés par une autre montre. L’essai de détourage IA de la maquette est écarté du carnet utilisable ; une future homogénéisation doit préserver les photos réelles et les détails des références.

Les prix et avis sont ceux du magazine V27 (certaines mentions internes indiquent V26). L’application ne vérifie pas leur actualité. Le classement initial hors groupes explicitement documentés utilise des indices de style ; il est modifiable et ne prétend pas à une analyse IA.

Étape suivante proposée : fiabiliser les photos et compléter les données, puis concevoir l’enrichissement assisté avec sources et confirmation. Synchronisation, accès privé et coût du service IA demandent encore un choix d’hébergement. Aucun site n’est publié par cette livraison.
