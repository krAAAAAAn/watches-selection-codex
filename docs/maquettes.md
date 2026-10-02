# Maquettes — carnet horloger

## Périmètre
Prototype visuel et cliquable, pas la première version de production. Ouvrir `maquettes/index.html` directement dans un navigateur. Aucun outil de compilation ou serveur requis.

Source : fichier fourni `Comparatif_montres_magazine_2026_collection_v27.html`. Les 41 fiches ont été extraites : descriptions, caractéristiques, avis, variantes et liens. Ces données ne sont pas de nouvelles vérifications des modèles ou des prix. Le document affiche par endroits une révision V26 malgré son nom V27.

## Trois écrans
- Collection : huit rôles repris du document, photos en premier, navigation entre candidates et sélection explicite d’un choix principal. La diver reste une envie future, sans achat implicite.
- Catalogue : recherche textuelle et filtre par rôle ; accès aux 41 fiches. Les groupes de candidates sont une proposition éditoriale non exhaustive, à valider.
- Fiche : images disponibles, caractéristiques, textes du magazine, sources et zone de notes. Les photos de nuit ne sont montrées que si elles existent dans la source ; aucune simulation de lume.

Le bouton Ajouter expose les étapes d’un futur enrichissement. Il ne lance pas de requête IA. Choix et notes sont temporaires et disparaissent au rechargement ; aucune donnée n’est envoyée ni sauvegardée.

## Direction visuelle
Révision 02 après retour utilisateur : fond anthracite, texte clair, accent bleu froid et typographie sans empattements. Fonds photo et cadrages normalisés ; suppression du mélange de couleurs des images avec le fond. Quatre cartes par ligne sur grand écran, deux sur tablette et une sur mobile. Les liens documentaires HTTPS ouvrent un nouvel onglet.

## Images
Les deux visuels déjà embarqués dans la source (Concordia et Tsuyosa) sont conservés dans le fichier. Les autres images et variantes conservent leurs URL sources ; leur affichage dépend du réseau et des sites tiers. Le proxy de cet environnement a refusé les téléchargements externes (403) lors de la préparation. Un emplacement explicitement marqué remplace une photo non chargée, sans inventer le modèle.

## Décisions à prendre après revue
1. Valider cette direction et les interactions de choix par rôle.
2. Choisir sauvegarde locale/export ou synchronisation entre appareils.
3. Définir la confidentialité avant de publier données et notes sur GitHub ou un hébergement public.
4. Définir l’enrichissement IA ultérieur et la validation des sources.

## Suite proposée
Développer ensuite seulement : modèle de données pérenne, sauvegarde/export/import, édition manuelle et images locales fiables. Le score de poignet est différé : 18 cm seuls ne suffisent pas à calculer une note fiable.

## Essai de détourage
La Concordia dispose d’un visuel transparent produit par IA uniquement pour évaluer la direction graphique. Ce traitement peut modifier des détails : il ne constitue pas une photo produit de référence. La photo source est conservée dans la fiche pour comparaison. Pour la version définitive, préférer des PNG fabricants transparents ou un détourage fidèle des photographies sources, avec contrôle des détails. Les autres photos ne sont pas annoncées comme détourées.
