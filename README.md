# La collection — carnet horloger

Carnet horloger au style sombre, avec 41 fiches initiales issues du magazine fourni. **Un fichier HTML** suffit à l’usage local. Pour retrouver les mêmes données entre navigateurs, un petit serveur Node.js sans dépendances npm sert le HTML et sauvegarde un JSON privé. Aucun Docker ni service externe requis.

## Utiliser le carnet

Pour l’usage local, téléchargez `index.html` et ouvrez-le dans votre navigateur. Pour la synchronisation sur votre homelab, suivez [le guide de déploiement](docs/homelab.md) : Node.js 20+, deux fichiers applicatifs et un dossier de données durable.

- **Ma collection** : explorer les candidates de chaque rôle et choisir explicitement votre montre principale. Le rôle diver reste une envie future.
- **Le catalogue** : rechercher un modèle, ses caractéristiques ou vos notes ; filtrer par rôle et trier.
- **La fiche** : consulter les caractéristiques, les photos/variantes disponibles et les liens ; modifier la fiche et saisir vos notes.
- **Ajouter une montre** : saisie manuelle du modèle, des catégories, des caractéristiques, des notes et des URL HTTPS des photos et de la fiche produit.

En mode local, notes et choix restent dans ce navigateur. En mode connecté, ils sont enregistrés sur votre serveur et retrouvés depuis vos autres navigateurs. L’indicateur de sauvegarde distingue les changements locaux, la synchronisation en cours et les données réellement enregistrées sur le serveur. Les modifications ne changent pas le dépôt GitHub.

## Sauvegarder et transférer

**Exporter une sauvegarde** télécharge un JSON avec toutes vos fiches, notes et choix. **Importer une collection** le restaure après confirmation explicite du remplacement. Un fichier invalide est refusé sans modifier votre collection.

**Télécharger mon carnet HTML** produit un nouveau fichier HTML contenant vos données actuelles, que vous pouvez ouvrir ailleurs ou déposer sur votre serveur. Sur une adresse déjà utilisée dans le même navigateur, la sauvegarde locale existante reste prioritaire ; utilisez l’import JSON pour la remplacer.

La sauvegarde locale dépend du navigateur et de l’adresse du site. Effacer ses données, changer d’appareil ou utiliser une session privée peut la faire disparaître. L’export est votre sauvegarde durable. Si le stockage est bloqué ou saturé, le carnet le signale et reste utilisable pendant la session. Une sauvegarde locale illisible est préservée et peut être téléchargée avant récupération. Si un autre onglet modifie le carnet, les écritures du premier sont bloquées jusqu’au rechargement ; exportez ses changements si vous souhaitez les conserver.

## Photos, confidentialité et périmètre

Les deux photos déjà intégrées au magazine restent embarquées. Les autres photos et variantes nécessitent un accès aux sites sources et peuvent ne pas se charger ; les emplacements manquants sont indiqués. Le détourage IA expérimental de la maquette n’est pas utilisé dans l’application : les photos originales sont conservées.

En mode connecté, les données sont envoyées uniquement à votre serveur ; aucun service IA ou stockage tiers n’est utilisé. Les liens externes s’ouvrent dans un nouvel onglet. Le JSON et l’HTML exportés contiennent vos notes : ne les publiez que si vous souhaitez les partager. Un hébergement statique public ne fournit pas d’authentification.

Cette version propose l’ajout **manuel**. L’enrichissement IA, la suppression des fiches et le score de poignet restent des étapes ultérieures. Les informations du magazine n’ont pas été revérifiées ; les catégories des modèles hors collection sont des propositions modifiables.

## Développer et vérifier

Le code de l’application est dans `index.html`. Playwright sert uniquement aux tests. Node.js est nécessaire au serveur partagé ; l’usage local du HTML seul n’en a pas besoin. Le serveur utilise uniquement la bibliothèque standard de Node.

```sh
npm ci --ignore-scripts
npm test
```

Les tests utilisent `/usr/bin/chromium` s’il est présent, ou le navigateur installé par Playwright. Pour une autre installation :

```sh
npx playwright install chromium
npm test
```

`CHROMIUM_PATH` permet de choisir un Chromium système. Pour servir le carnet localement :

```sh
npm start
```

Port par défaut : 8765, écoute uniquement sur la machine locale. `PORT` permet de le changer. Sans `COLLECTION_PASSWORD`, le serveur sert le carnet en mode local uniquement. Avec cette variable privée et un dossier de données durable, il active la synchronisation. Voir [le guide homelab](docs/homelab.md).

Les tests vérifient la persistance après rechargement, l’édition, l’ajout, les catégories/choix, les sauvegardes JSON et HTML, les imports invalides et annulés, l’échappement des textes, les restrictions de liens, le stockage indisponible/corrompu, les conflits entre onglets et l’affichage mobile. Les téléchargements des photos tierces ne sont pas validés par cette suite.

## Documentation

- [Déploiement homelab et synchronisation](docs/homelab.md)
- [Version 0.2 : formulaire et sauvegarde partagée](docs/version-0.2.md)
- [Version 0.1 et choix techniques](docs/version-0.1.md)
- [Maquettes et direction visuelle](docs/maquettes.md)
- Les maquettes précédentes restent dans `maquettes/` ; leurs notes sont temporaires. L’application sauvegardant vos données est à la racine du dépôt.

## Photos conservées sur votre serveur

Version 0.3 : **Gérer les photos** copie les visuels avec leur provenance dans la collection partagée. Les fiches permettent aussi d’importer un fichier local. Les PNG transparents sont reconnus et les cadres de présentation sont homogènes, sans retouche de la montre. Voir [le guide photos](docs/photos.md) pour la mise à jour et la copie en lot.
