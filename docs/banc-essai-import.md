# Banc d’essai de l’import de fiches — 6 octobre 2026

## Résultat et niveau de certitude

**Le banc est prêt et a été exécuté, mais la viabilité de l’extraction sur les sites réels reste indéterminée.** Les sept destinations sont inaccessibles depuis cet environnement. Aucun HTML fabricant n’a été obtenu, aucune caractéristique réelle extraite et aucune comparaison avec une IA effectuée. Ces échecs ne constituent pas des mauvaises performances d’extraction et ne prouvent pas que ces sites bloqueraient le homelab.

| Échantillon | Référence | Accès Node direct | Accès via proxy configuré |
| --- | --- | --- | --- |
| Seiko France | SRPG35 | DNS `EAI_AGAIN` | Tunnel refusé 403 |
| Seiko Japon | SBTM329 | DNS `EAI_AGAIN` | Tunnel refusé 403 |
| Boutique Seiko Japon | SBTM321 | DNS `EAI_AGAIN` | Tunnel refusé 403 |
| Citizen EU | NJ0150-81Z | DNS `EAI_AGAIN` | Tunnel refusé 403 |
| Citizen Japon | NB1050-59A | DNS `EAI_AGAIN` | Tunnel refusé 403 |
| Hamilton | H38525721 | DNS `EAI_AGAIN` | Tunnel refusé 403 |
| Brew | Metric Retro Dial, URL candidate | DNS `EAI_AGAIN` | Tunnel refusé 403 |

Les six premières adresses proviennent de la collection. L’adresse Brew est une candidate : son existence et sa correspondance au modèle souhaité n’ont pas pu être vérifiées. Les observations brutes sont dans `experiments/results/2026-10-06-direct.json` et `2026-10-06-proxy.json`.

## Ce que le banc mesure

Le script indépendant `experiments/product-bench.cjs` n’active aucune fonction de l’application et ne touche pas à la collection. Node 20+, aucune installation npm, aucun service IA.

Il relève les scripts JSON-LD, les objets Product et ProductGroup, le titre et les métadonnées OpenGraph. Chaque objet Product reste séparé : pas de fusion entre recommandations, variantes et produit principal. Plusieurs produits sont signalés comme nécessitant une sélection. Les données de ProductGroup ne sont pas propagées aux variantes ; une page dont les informations sont uniquement sur le groupe peut donc avoir une couverture sous-estimée.

Onze champs sont examinés : nom, référence, image, prix, diamètre, épaisseur, corne à corne, mouvement/calibre, réserve de marche, étanchéité et verre. Pour les caractéristiques, seuls certains libellés explicites de `additionalProperty` en anglais, français ou japonais sont reconnus. Aucun tableau HTML spécifique, texte libre ou JavaScript embarqué propre à une marque n’est interprété. Pas de traduction automatique ni de conversion de devise. Les images ne sont pas téléchargées. Le benchmark privilégie la prudence et ne constitue pas un importeur final.

Chaque valeur a une provenance et les champs manquants sont listés. **Le nombre de champs présents ne mesure pas leur exactitude.** Il faut vérifier à la main la référence, la photo, les unités, le prix/devise et le produit réellement décrit. La langue d’un HTML téléchargé est supposée UTF-8 ; les anciennes pages japonaises dans un autre encodage nécessiteraient une adaptation.

Quatre tests synthétiques vérifient le parcours JSON-LD `@graph`, les variantes indépendantes, quelques libellés japonais, les métadonnées, le JSON invalide et l’absence de caractéristiques inventées depuis une description. Ils ne démontrent aucune compatibilité avec Seiko, Citizen, Hamilton ou Brew.

## Rejouer depuis une machine ayant accès aux sites

Depuis la racine du dépôt :

```sh
node experiments/product-bench.test.cjs
node experiments/product-bench.cjs --output /tmp/watch-bench.json --save-html /tmp/watch-pages
```

Le second appel effectue sept requêtes HTTPS publiques, avec vérification TLS, contrôle des adresses publiques et redirections limitées. Il utilise HTTPS directement, comme le serveur applicatif actuel ; il ne gère pas un proxy d’entreprise. Il n’utilise ni compte ni mot de passe et ne contourne pas une protection antibot. Les pages reçues et le rapport sont enregistrés uniquement aux chemins indiqués. Les résultats indisponibles sont rapportés sans masquer leur erreur ; un rapport écrit avec succès n’implique pas des téléchargements réussis.

Si les pages peuvent être enregistrées depuis un navigateur, les placer sous les noms `seiko-fr.html`, `seiko-jp.html`, `seiko-store.html`, `citizen-eu.html`, `citizen-jp.html`, `hamilton.html` et `brew.html`, puis :

```sh
node experiments/product-bench.cjs --input-dir /tmp/watch-pages --output /tmp/watch-bench-local.json
```

Le mode local ne fait aucune requête réseau. Il considère les URL d’origine de l’échantillon comme contexte ; un snapshot enregistré à une autre adresse doit être identifié manuellement. Un HTML après exécution JavaScript par le navigateur peut fournir davantage d’informations que la réponse brute : ne pas confondre ces deux modes. La liste des URL est au début du script et peut être corrigée, notamment pour Brew.

## Comment décider

Pour chaque fiche accessible, établir une ligne de référence manuelle des onze champs, puis classer chaque extraction : correcte, incorrecte, absente du site, ou présente mais non extraite. Identifier séparément les erreurs de sélection de produit et l’accès bloqué.

La décision doit surtout porter sur les caractéristiques utiles et le temps de correction, pas sur le taux de récupération du titre. Si les fiches nécessitent régulièrement des règles de tableaux propres à chaque marque, ou si les caractéristiques sont principalement en texte libre, un catalogue croissant de microbrands rend les extracteurs spécifiques peu intéressants à maintenir.

**Orientation recommandée, sous réserve de ce relevé réel : approche hybride.** Utiliser gratuitement les données structurées disponibles pour amorcer la fiche, puis une analyse IA du contenu de la page pour les caractéristiques restantes. Éviter de commencer par une longue liste d’extracteurs par marque. Pour Brew, aucune technologie de boutique ni richesse des métadonnées n’est présumée ici.

L’IA n’est pas une solution automatique à l’accès bloqué : si elle analyse le HTML fourni par notre serveur, elle a besoin que ce HTML soit obtenu. Un service capable de rechercher et consulter des sources peut offrir une autre voie d’accès, mais celle-ci doit être testée aussi. Une recherche uniquement par nom augmente le risque de confondre version EU/JDM, référence, couleur ou ancien modèle.

Une future comparaison IA utiliserait exactement les mêmes pages et la même référence manuelle, demanderait un résultat structuré avec extrait justificatif pour chaque caractéristique, autoriserait explicitement les valeurs inconnues et mesurerait les erreurs ainsi que le coût. Aucun fournisseur ni coût mesuré n’est présenté faute d’essai effectif. L’import resterait une proposition à vérifier avant sauvegarde.

## Suite concrète

L’application reste en version 0.4, sans import automatique ajouté. Pour obtenir un verdict empirique, il manque seulement un accès aux pages de cet échantillon ou des copies HTML. Dans les paramètres réseau de l’environnement cloud, les domaines concernés sont `www.seikowatches.com`, `store.seikowatches.com`, `citizenwatch.eu`, `citizen.jp`, `www.hamiltonwatch.com` et `www.brew-watches.com` ; les éventuels domaines de redirection restent à observer. Aucune liste d’autorisation existante n’a été remplacée.
