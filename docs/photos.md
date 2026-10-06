# Photos fiables — version 0.3

## Après mise à jour sur votre homelab

Remplacez `index.html` et `server.cjs` par les nouvelles versions, conservez votre `.env` et le dossier de données, puis redémarrez le serveur. Connectez votre navigateur et attendez « Collection partagée · à jour ».

Dans la collection ou le catalogue : **Gérer les photos → Copier les photos sur mon serveur**. La copie est progressive et peut être arrêtée après la photo en cours. Une fiche permet aussi de copier uniquement ses photos.

Le serveur télécharge les images originales et leurs éventuelles sources de secours. Le navigateur vérifie que l’image est décodable avant de l’intégrer. Les octets sont conservés, sans génération ni retouche. La source HTTPS reste mémorisée. Chaque copie est ensuite synchronisée dans le JSON de votre collection : aucun dossier média supplémentaire à installer.

Les photos intégrées sont disponibles depuis les autres navigateurs et dans les exports JSON/HTML, même lorsque les sites fournisseurs cessent de répondre. Sauvegardez le JSON du serveur : il contient désormais aussi les photos. Les liens documentaires vers les fabricants restent externes.

## Photos manquantes et détourées

Si un site bloque le téléchargement ou ne fournit plus la photo, la ligne d’échec reste visible et sa source n’est pas supprimée. Ouvrez la fiche et utilisez **Importer une photo** pour choisir un fichier local PNG, JPEG, WebP ou GIF. Les SVG sont exclus. Si vous remplacez une photo déjà intégrée par une autre, l’originale est conservée dans la galerie.

L’affichage utilise une taille et un cadre identiques, sans étirer ni couper les boîtiers ou bracelets. Les photos ordinaires ont un fond de présentation neutre commun. La transparence réelle d’une image est détectée : les PNG détourés peuvent alors être présentés directement sur le fond sombre, avec une ombre discrète.

Cette version ne fabrique pas de détourage IA et ne change pas les détails de la montre. Pour obtenir un détourage fidèle, privilégiez une image transparente du constructeur ou importez une photographie détourée du modèle exact. Les cadrages internes des fichiers sources peuvent varier ; la normalisation de l’affichage ne prétend pas recréer une vue identique à partir de photographies différentes.

## Limites et validation

Maximum : 2 Mo par nouvelle photo et 28 Mo pour le carnet enrichi, afin de garder les exports et la synchronisation sous la limite serveur de 30 Mo. Il n’y a pas de compression automatique pouvant altérer les photos. Un stockage local de navigateur saturé reste signalé ; utilisez la sauvegarde serveur et les exports.

La route de téléchargement exige une connexion. Elle accepte seulement HTTPS vers des adresses publiques, vérifie aussi les redirections et conserve la validation TLS. Elle refuse les adresses du réseau local ; elle ne transmet ni cookies ni mot de passe de collection aux sites tiers. Les téléchargements ont une limite de taille et de durée.

Tests effectués : copie intégrée et provenance sauvegardées, conservation des octets, rechargement sans site tiers, import local, refus d’une image invalide, export et lecture depuis un second navigateur. Les tests de téléchargement positif utilisent une source contrôlée ; les règles d’adresses privées et la reconnaissance des fichiers sont également vérifiées.

Dans l’environnement cloud, le téléchargement constructeur Seiko a échoué avec une erreur DNS `EAI_AGAIN`. Les 41 fiches n’ont donc pas été annoncées comme téléchargées ici. La commande en lot doit être lancée sur votre homelab, où l’application montrera les réussites et les échecs réels.

## Détourage facultatif — version 0.6

Sur la fiche, sélectionnez une photo puis **Détourer cette photo**. Un traitement local retire le fond clair et uni et propose un cadrage. Validez l’aperçu pour enregistrer le PNG transparent avec son original ; **Retirer le détourage** revient à l’image source. Les photos sur fond complexe nécessitent un fichier PNG déjà détouré. Voir [le guide de présentation](presentation.md), avec la capture réelle et les limites. Aucune dépendance de serveur ni aucun appel IA supplémentaire.
