# Gestion complète des fiches — version 0.4

## Mise à jour

Remplacez `index.html` et `server.cjs`, conservez `.env` et le dossier de données, puis redémarrez votre serveur et rechargez les pages sur tous vos navigateurs. Un ancien onglet qui ne connaît pas les nouveaux champs ne peut pas les effacer via une sauvegarde : le serveur lui demande de se mettre à jour. Les collections et exports précédents sont compatibles : les fiches sans statut deviennent « Souhaitée », sans archives ni nouvelles variantes structurées. Les photos, notes, sources et avis existants sont conservés.

## Statuts et archives

Dans **Modifier cette fiche**, choisissez **Possédée**, **Souhaitée** ou **Écartée**. Les deux premiers peuvent participer à la collection principale ; les montres écartées restent dans le catalogue mais ne figurent plus parmi les candidates.

**Archiver** conserve toute la fiche, y compris notes et photos, et la retire des candidates et de la vue active du catalogue. Une confirmation est demandée. Le filtre **Archives** permet de la retrouver et **Restaurer la fiche** de la réactiver. Le statut possédée/souhaitée/écartée reste inchangé lors de l’archivage et de la restauration.

Si une fiche choisie est archivée, écartée ou supprimée, ses choix principaux sont désélectionnés. Aucune autre montre n’est choisie à votre place. La restauration d’une archive ne restaure pas automatiquement ce choix.

Le catalogue peut afficher les fiches actives, les possédées, les souhaitées, les écartées, les archives ou toutes les fiches. Une fiche archivée est retrouvée dans Archives/Toutes, quel que soit son statut.

## Variantes, sources et avis

L’éditeur propose trois sections supplémentaires repliables :

- **Variantes de couleur** : nom, référence, couleur, photo associée choisie dans la galerie existante, lien HTTPS facultatif. Les boutons sur la fiche affichent la photo et la référence correspondantes.
- **Sources et liens** : ajouter, corriger ou retirer chaque source. Les liens s’ouvrent dans un nouvel onglet.
- **Avis et points forts / réserves** : modifier les blocs du magazine ou ajouter vos propres textes titrés.

Seule la validation **Enregistrer la montre** applique ces modifications. **Annuler** ne modifie pas le carnet. Les photos existantes ne sont pas supprimées lorsque l’on retire une variante ; elles restent dans la galerie. Remplacer la photo principale conserve son originale et maintient les variantes qui lui étaient associées sur cette photo originale. L’import photo de la version 0.3 permet de compléter la galerie avant d’associer une image à une variante.

Les anciennes galeries restent consultables telles quelles : cette version n’invente pas des références ou des couleurs pour remplir automatiquement les variantes structurées.

## Variante affichée dans la collection — version 0.5.1

Sur la fiche, cliquez sur une variante de couleur ou sur une photo de la galerie, puis sur **Afficher dans ma collection**. Parcourir les photos reste un aperçu ; seul ce bouton enregistre l’affichage choisi. La sélection d’une variante affiche sa photo, son nom/couleur et sa référence sur la carte de collection. Une variante sans photo associée doit d’abord être complétée dans l’éditeur.

Les anciennes galeries sans variantes structurées sont prises en charge : choisissez directement une photo. **Revenir à la photo principale** rétablit l’affichage initial. Le choix de couleur est commun aux rôles de cette montre et ne change pas votre choix de montre principale par rôle.

Le choix est conservé dans la sauvegarde JSON/HTML et, en mode connecté, partagé entre les navigateurs. La fiche s’ouvre avec cette photo par défaut. Une modification de variante conserve son choix ; retirer une variante qui précède celle choisie ne déplace pas la sélection vers une autre couleur. Supprimer la variante choisie ou retirer sa photo associée rétablit la photo principale. Les images restent dans la galerie.

Depuis la collection, cliquez sur **la photo ou le nom** pour ouvrir la fiche. Ces deux boutons sont également accessibles au clavier ; le bouton « Voir la fiche » reste disponible.

Pour mettre à jour, remplacez les deux fichiers applicatifs, conservez vos données et votre fichier d’environnement, puis redémarrez et rechargez les navigateurs. Les anciennes sauvegardes s’importent avec la photo principale par défaut. Les anciennes pages ne peuvent pas effacer les nouveaux choix lors d’une sauvegarde : elles doivent être rechargées.

## Supprimer et récupérer

**Supprimer** demande une confirmation nommant la montre. La fiche est retirée de la collection, avec ses notes, variantes et photos intégrées, puis la modification est synchronisée. Cette version n’a pas de corbeille : privilégiez l’archivage si vous souhaitez simplement mettre une montre de côté.

Un export JSON/HTML réalisé avant suppression conserve une copie. Importer une sauvegarde remplace la collection entière après confirmation ; ce n’est pas une restauration isolée d’une seule fiche.

## Vérifications

Tests sur serveur réel : statuts persistants, variantes et photo associée, édition des sources et avis, notes et images préservées, annulation, archivage/restauration, retrait des choix principaux, visibilité des candidates, suppression avec annulation, récupération JSON et lecture depuis un autre navigateur. Compatibilité des anciens exports et refus d’une référence de photo invalide également vérifiés.

Le déploiement sur votre homelab n’est pas effectué depuis cet environnement. Les quatre suites existantes vérifient aussi la sauvegarde, les conflits, les photos et les exports.

La suite supplémentaire de la version 0.5.1 vérifie les clics photo/nom et le clavier, la variante et les galeries simples, la persistance et le second navigateur, les exports, l’édition/suppression des variantes, le retour à la photo principale et la protection contre une ancienne page.
