# Banc d’essai de l’import de fiches — 6 octobre 2026

## Conclusion après ouverture de l’accès Internet

**Les données standardisées seules ne suffisent pas pour une fiche horlogère complète. En revanche, le HTML des pages contient beaucoup d’informations utiles, y compris chez Brew.** Le second essai a obtenu six vraies fiches produit sur les sept liens ; le lien Seiko Japon SBTM329 affiche une page introuvable, même avec HTTP 200.

Une passe générique par libellés, sans sélecteur propre à chaque marque, retrouve un candidat correct pour **32 des 35 caractéristiques effectivement relevées à la main**, laisse deux dimensions composites à interpréter et manque une épaisseur. Ce chiffre mesure la présence d’un bon candidat, **pas la précision d’un import automatique** : des faux candidats et des doublons apparaissent aussi.

Pour un catalogue appelé à intégrer de nombreuses microbrands, nous recommandons une **approche hybride : métadonnées pour amorcer la fiche, puis IA pour interpréter les caractéristiques du texte avec justification**, plutôt qu’une série d’extracteurs par marque. Les règles génériques restent utiles comme sources de propositions ; elles ne justifient pas encore une sauvegarde automatique sans contrôle. Aucune IA externe n’a été testée : sa précision et son coût restent à mesurer avant implémentation.

## Pages réellement consultées

HTML brut téléchargé via le proxy configuré, sans navigateur ni exécution JavaScript. Les liens ci-dessous correspondent aux destinations réellement obtenues.

| Fiche | Accès et résultat | JSON-LD Product | Caractéristiques par libellés |
| --- | --- | --- | --- |
| [Seiko France SRPG35](https://www.seikowatches.com/fr-fr/products/5sports/srpg35) | Fiche obtenue | Aucun ; titre et photo en métadonnées | 7/7 champs avec bon candidat |
| [Seiko Japon SBTM329](https://www.seikowatches.com/jp-ja/products/seikoselection/sbtm329) | Page introuvable dans le contenu, HTTP 200 | Aucun ; métadonnées génériques Seiko | Pas une fiche produit |
| [Boutique Seiko Japon SBTM321](https://store.seikowatches.com/products/sbtm321) | Fiche obtenue | Nom, référence, photo, prix JPY | 4/6 champs ; dimensions composites ; épaisseur non séparée |
| [Citizen EU NJ0150-81Z](https://citizenwatch.eu/en/p/nj0150-81z/) | Fiche obtenue | Nom, référence, photo, prix EUR | 5/5 champs avec bon candidat |
| [Citizen Japon NB1050-59A](https://citizen.jp/shop/g/gNB1050-59A/) | Fiche obtenue | Nom, référence, photo, prix JPY | 6/6 champs avec bon candidat |
| [Hamilton H38525721](https://www.hamiltonwatch.com/en-int/h38525721-jazzmaster-thinline-auto.html) | Fiche obtenue, ancienne collection | Nom, référence, photo, prix CHF | 6/6 champs avec bon candidat |
| [Brew Metric Retro Dial / METRIC-BLK](https://www.brew-watches.com/products/brew-metric-retro-black) | Fiche obtenue | Nom, SKU, photo, prix USD | 4/5 champs ; dimensions composites |

Le dénominateur de la dernière colonne représente les caractéristiques présentes et relevées à la main dans ce HTML, parmi les sept champs techniques étudiés. Une donnée absente du HTML n’est pas comptée comme récupérable. Le SKU est une référence de boutique ; il ne faut pas systématiquement le présenter comme une référence fabricant.

La première URL Brew supposée (`/products/metric-retro-dial`) renvoie 404. Le bon lien a été trouvé dans la page d’accueil officielle. La boutique Seiko `/products/sbtm329`, essayée comme autre source, renvoie également 404 ; cela ne prouve pas que le modèle soit introuvable ailleurs.

Les cinq objets Product trouvés ne fournissent **aucune des sept caractéristiques techniques** via les propriétés standardisées examinées. Leurs descriptions peuvent contenir quelques indications ; elles ne sont pas interprétées par la première passe. Ce constat concerne cet échantillon, pas tous les sites horlogers.

## Exemples vérifiés et pièges

- **Seiko France SRPG35** : diamètre 39,4 mm, épaisseur 13,2 mm, corne à corne 48,1 mm, calibre 4R36, autonomie environ 41 heures, étanchéité 10 bar, Hardlex bombé. Tout figure dans le HTML, sans JSON-LD Product.
- **Citizen Japon NB1050-59A** : largeur 38,0 mm, épaisseur 10,5 mm, calibre 9011, environ 42 heures, 10 atmosphères et verre saphir. Les libellés japonais diffèrent de ceux de la boutique Seiko, mais une petite liste multilingue retrouve les candidats.
- **Brew Metric** : `CASE DIAMETER: 36MM x 41.5MM`, épaisseur 10,75 mm, mouvement hybride VK68 meca-quartz, saphir et 5 ATM. Ses spécifications sont dans un bloc HTML de texte riche. Une microbrand n’est donc pas nécessairement moins exploitable qu’une grande marque.
- **Dimensions Brew** : conserver `36 × 41,5 mm` comme dimensions brutes. Le seul libellé « CASE DIAMETER » ne certifie pas que 41,5 mm soit le corne à corne ; `LUG WIDTH: 19.85MM` désigne l’entrecorne, pas la longueur de la montre.
- **Dimensions SBTM321** : `厚さ:9.5mm 横:39.5mm 縦:46.1mm` regroupe épaisseur, largeur et hauteur. La passe générique ne les sépare pas. La dimension verticale n’est pas automatiquement validée comme corne à corne.
- **Faux candidats** : sur Seiko France, la navigation fait apparaître « Mouvement → Dimensions du boîtier » ; une règle naïve propose alors un faux mouvement. Sur Citizen Japon, une explication de la mesure apparaît comme deuxième candidat pour la taille du boîtier.
- **Unités et conditions** : Hamilton donne `Thickness (mm) → 8.45`, avec l’unité dans le libellé. Seiko solaire indique environ neuf mois en pleine charge et deux ans en économie d’énergie ; il faut conserver les deux conditions.
- **Marché et prix** : Hamilton international expose 925 CHF et signale « Past collection ». Le prix structuré n’est pas nécessairement un prix d’achat actuel en Belgique. Ne pas convertir ni remplacer silencieusement par un prix EUR.
- **Lien périmé** : le SBTM329 retourne HTTP 200, mais un message japonais dit que la page n’existe pas ou a été déplacée. Sans vérification du contenu, un import pourrait ajouter le logo et la description générale de Seiko comme une montre.

## Ce que cela implique pour l’IA

La récupération du contenu et son interprétation sont deux opérations différentes. Pour cet échantillon, six contenus sont obtenus sans rendre le site dans un navigateur : cela donne une base concrète pour une analyse IA, sans imposer d’emblée un navigateur automatisé sur le homelab.

Les adaptateurs CSS propres aux marques ne sont donc pas indispensables pour obtenir du texte exploitable. En revanche, choisir le bon passage, interpréter les dimensions, traduire les libellés, préserver les conditions et rejeter les mauvaises propositions demande davantage qu’une lecture JSON-LD. Une IA peut être appropriée pour cette partie, mais elle doit être comparée à la référence manuelle, pas présumée correcte.

L’étape IA à évaluer demanderait un résultat structuré avec référence exacte, marché, valeur et extrait justificatif pour chaque champ. Elle autoriserait les valeurs inconnues et signalerait les ambiguïtés. Elle recevrait le contenu de la page comme des données, jamais comme des instructions. Le nom seul ne suffirait pas à fusionner EU/JDM, couleurs ou variantes. L’utilisateur vérifierait la proposition avant enregistrement.

**Nous ne recommandons pas de passer directement à une recherche libre par nom comme unique mécanisme.** URL et référence restent de bons points de départ ; la recherche de sources alternatives peut venir ensuite pour les liens périmés ou les champs manquants. L’IA ne résout pas automatiquement une page inaccessible.

## Méthode, preuves et limites

Premier essai : proxy refusant les sept connexions (403), DNS direct `EAI_AGAIN`. Après modification réseau par l’utilisateur : le téléchargement Python via le proxy fonctionne ; le script Node en accès direct reçoit encore `ECONNREFUSED`. Il s’agit des voies réseau de cet environnement, pas d’un test sur le homelab.

Le HTML téléchargé a été analysé localement par le script Node. Il ne faut donc pas présenter le téléchargement Node direct comme réussi. Aucun contournement antibot, aucune désactivation TLS, aucun compte fabricant ni service IA utilisé.

Les scripts expérimentaux ne modifient pas l’application, le serveur ou la collection :

- `experiments/product-bench.cjs` : JSON-LD et métadonnées, onze champs étudiés, variantes gardées séparées, avertissement pour le message de page introuvable observé. Ce dernier n’est pas un détecteur universel de pages d’erreur.
- `experiments/text-candidates.cjs` : libellés génériques anglais/français/japonais et valeurs voisines dans le texte. Aucun sélecteur propre à une marque ; sortie de tous les candidats, sans sélection finale ni normalisation. Les entités HTML courantes et numériques sont partiellement décodées ; ce n’est pas un parseur HTML de production.
- `experiments/product-bench.test.cjs` : tests synthétiques de JSON-LD, variantes, contenu invalide, page introuvable et extraction de texte. Ces tests valident le comportement expérimental ; les résultats réels sont rapportés séparément.

Preuves dans `experiments/results/` :

- `2026-10-06-direct.json` et `2026-10-06-proxy.json` : premier essai bloqué.
- `2026-10-06-retry-direct.json` : accès Node encore refusé après ouverture réseau.
- `2026-10-06-retry-proxy.json` : réponses réelles, URL Brew erronée puis corrigée.
- `2026-10-06-retry-analysis.json` : extraction JSON-LD des pages réellement obtenues, provenance réseau et empreinte SHA-256 de chaque snapshot UTF-8 analysé.
- `2026-10-06-text-candidates.json` : référence manuelle des caractéristiques, tous les candidats et classement par champ. Les 32 bons candidats peuvent côtoyer des candidats incorrects : ce n’est pas un taux de réussite de 91 % d’une fiche importée.

Les HTML complets ne sont pas publiés dans le dépôt. Les caractéristiques rapportées constituent le relevé de ces pages à cette date, pas une validation indépendante des spécifications fabricant. Les photos n’ont pas été téléchargées pour vérification visuelle. Les pages après exécution JavaScript peuvent contenir davantage d’informations ; certains textes cachés sont présents dans le HTML brut et peuvent polluer une extraction. Six fiches ne représentent pas toute la diversité des microbrands.

## Rejouer

Node 20+, aucune installation npm nécessaire pour le banc. Depuis la racine du dépôt sur une machine ayant accès HTTPS directement :

```sh
node experiments/product-bench.test.cjs
node experiments/product-bench.cjs --output /tmp/watch-bench.json --save-html /tmp/watch-pages
```

Le téléchargement Node conserve la vérification TLS, vérifie les adresses publiques et limite les redirections. Il ne gère pas un proxy d’entreprise. Les résultats indisponibles restent signalés ; un rapport écrit avec succès ne garantit pas des pages téléchargées.

Pour analyser des copies HTML déjà obtenues, nommer les fichiers `seiko-fr.html`, `seiko-jp.html`, `seiko-store.html`, `citizen-eu.html`, `citizen-jp.html`, `hamilton.html` et `brew.html`, puis :

```sh
node experiments/product-bench.cjs --input-dir /tmp/watch-pages --output /tmp/watch-bench-local.json
node experiments/text-candidates.cjs /tmp/watch-pages/brew.html
```

Le mode local ne fait pas de requête réseau. Il suppose les URL de l’échantillon comme contexte : vérifier l’adresse d’origine si les fichiers viennent d’ailleurs. Le téléchargement utilisé pour ce second essai a été effectué avec `urllib.request` et le proxy configuré, avec validation TLS ; les réponses sont conservées dans le rapport d’accès.

L’application reste en version 0.4. Aucun import ni appel IA n’a été ajouté.
