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

## Supprimer et récupérer

**Supprimer** demande une confirmation nommant la montre. La fiche est retirée de la collection, avec ses notes, variantes et photos intégrées, puis la modification est synchronisée. Cette version n’a pas de corbeille : privilégiez l’archivage si vous souhaitez simplement mettre une montre de côté.

Un export JSON/HTML réalisé avant suppression conserve une copie. Importer une sauvegarde remplace la collection entière après confirmation ; ce n’est pas une restauration isolée d’une seule fiche.

## Vérifications

Tests sur serveur réel : statuts persistants, variantes et photo associée, édition des sources et avis, notes et images préservées, annulation, archivage/restauration, retrait des choix principaux, visibilité des candidates, suppression avec annulation, récupération JSON et lecture depuis un autre navigateur. Compatibilité des anciens exports et refus d’une référence de photo invalide également vérifiés.

Le déploiement sur votre homelab n’est pas effectué depuis cet environnement. Les quatre suites existantes vérifient aussi la sauvegarde, les conflits, les photos et les exports.
