# Version 0.2 — formulaire guidé et collection partagée

## Formulaire

Le formulaire est organisé en sections : modèle, place dans la collection, caractéristiques, photos facultatives et notes. Les cases de catégorie ont une largeur fixe ; les alignements et champs s’adaptent à l’écran. Les exemples sont adaptés au prix, aux dimensions, au mouvement ou à l’étanchéité. Ce sont des placeholders : ils ne deviennent pas des données par défaut.

« Voir un exemple rempli » utilise la fiche Citizen Tsuyosa déjà présente dans le magazine. Cette action est réservée à l’ajout et n’enregistre rien avant validation. Le lien produit existant est repris lors de l’édition ; les sources supplémentaires sont conservées.

## Synchronisation

Solution retenue après clarification de l’hébergement : un petit processus Node.js sur le homelab, sans Docker et sans dépendances npm. Aucun service externe ni clé de fournisseur ne sont nécessaires. Voir `docs/homelab.md` pour l’installation et les deux fichiers à copier.

Le serveur protège les données par une session de navigateur (cookie HttpOnly/SameSite) et un mot de passe configuré sur la machine. Les écritures exigent JSON, refusent les origines étrangères et valident la collection avec la même logique que le navigateur. Les tentatives de connexion sont limitées.

Les notes et fiches sont enregistrées au serveur avec un numéro de révision. Une file sérialise les écritures ; une révision périmée renvoie un conflit, sans écrasement. Le navigateur conserve alors son brouillon et propose de l’exporter ou de charger la version serveur après confirmation.

Les navigateurs sans modification en cours vérifient la révision toutes les cinq secondes et au retour dans l’onglet ; une réponse inchangée ne renvoie pas les photos et l’ensemble des données. Le polling est suspendu pendant l’édition. Un brouillon hors ligne est conservé séparément du carnet local et repris après rechargement. Les données serveur survivent au redémarrage du processus ; les sessions demandent une nouvelle connexion.

Le déploiement reste **un seul processus** pour un dossier de données. Pas de cluster ni de fusion automatique des conflits. Une sauvegarde illisible est signalée et préservée. Une sauvegarde régulière du dossier de données ou un export JSON reste nécessaire.

## Vérification

`npm test` exécute les tests locaux et la suite utilisant le serveur réel. Deux contextes de navigateur indépendants valident le partage des notes, les conflits sans écrasement et la reprise d’un brouillon hors ligne. Des requêtes concurrentes de même version valident qu’une seule écriture réussit. Accès non authentifié, origine étrangère, collection invalide, redémarrage et donnée corrompue sont également testés.

L’installation sur le homelab, le reverse proxy HTTPS et l’unité systemd ne sont pas exécutés ici. Les instructions d’installation sont des modèles prêts à adapter, pas la preuve d’un déploiement déjà actif sur la machine utilisateur.
