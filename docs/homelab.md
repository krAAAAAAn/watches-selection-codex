# Homelab : serveur léger, sans Docker

## Choix retenu

Un processus Node.js 20 ou plus récent, sans framework ni dépendance npm en production. Il sert `index.html`, contrôle la connexion et sauvegarde un JSON. Pour quelques dizaines ou centaines de montres, une base de données ne simplifierait pas le système. Aucun service tiers n’est nécessaire.

La synchronisation automatique implique de lancer ce processus : poser seulement le HTML et le JSON sur un hébergement statique permet la lecture partagée, mais pas l’enregistrement depuis l’application.

## Fichiers à copier

```text
index.html
server.cjs
```

La donnée persistante est stockée séparément, dans `COLLECTION_DATA_DIR/collection.json` (par défaut `.collection-data/collection.json`). Ce répertoire n’est jamais servi par HTTP et est ignoré par Git. **Il doit être conservé lors des mises à jour**. Ne lancez qu’un processus serveur pour ce dossier ; le contrôle de version et la file d’écriture fonctionnent dans ce processus, pas dans un cluster.

Aucun `npm install` n’est requis pour le serveur. Playwright est uniquement une dépendance de développement pour les tests.

## Lancement direct

Configurez localement les variables ci-dessous, par exemple dans un fichier d’environnement privé hors du répertoire public, lisible uniquement par votre utilisateur. Ne donnez pas le mot de passe dans le chat ou le dépôt. Un exemple sans véritable secret est fourni dans `deploy/watch-collection.env.example`.

| Variable | Rôle |
|---|---|
| `COLLECTION_PASSWORD` | Mot de passe partagé entre vos navigateurs. Sans cette valeur, la synchronisation reste désactivée et l’application fonctionne localement. |
| `COLLECTION_DATA_DIR` | Répertoire durable et inscriptible contenant le JSON. |
| `HOST` | `127.0.0.1` par défaut ; `0.0.0.0` pour écouter sur les interfaces du serveur. |
| `PORT` | `8765` par défaut. |
| `COLLECTION_SECURE_COOKIES` | `1` lorsque l’accès utilisateur passe par HTTPS. |

Après chargement de ces variables dans votre terminal :

```sh
node server.cjs
```

Le serveur ne contient pas son propre certificat TLS. Utilisez votre reverse proxy existant pour l’accès HTTPS, en conservant l’en-tête `Host`. Sur un réseau privé utilisé temporairement en HTTP, laissez `COLLECTION_SECURE_COOKIES` à `0` ; les mots de passe et notes ne sont alors pas chiffrés pendant le transport. Pour un accès extérieur, utilisez HTTPS.

Le mot de passe n’est pas intégré au HTML. La session utilise un cookie HttpOnly/SameSite ; son jeton reste en mémoire serveur et expire après sept jours. Le redémarrage du serveur demande une nouvelle connexion, sans effacer la collection.

## Démarrage avec systemd (facultatif)

`deploy/watch-collection.service` est un exemple pour Linux avec systemd. Adaptez le chemin de Node et les dossiers à votre machine. L’exemple utilise :

- utilisateur de service `watches` ;
- fichiers applicatifs dans `/opt/watch-collection` ;
- donnée inscriptible dans `/var/lib/watch-collection`, appartenant à `watches` ;
- variables dans `/etc/watch-collection.env`, protégé en lecture (mode 600).

Installez l’unité dans `/etc/systemd/system/watch-collection.service`, puis :

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now watch-collection
sudo systemctl status watch-collection
```

Ces commandes n’ont pas été exécutées sur votre homelab. L’unité est un modèle de déploiement, pas la preuve d’un serveur déjà installé.

## Première connexion et fonctionnement

1. Exportez une copie du carnet local actuel si vous l’avez déjà enrichi.
2. Ouvrez l’application à l’adresse du serveur et connectez ce navigateur avec le mot de passe configuré.
3. Le premier navigateur initialise la collection serveur à partir de son carnet. Une initialisation simultanée par un autre navigateur déclenche un conflit plutôt qu’un écrasement.
4. Connectez les autres navigateurs à **la même adresse serveur**. Ils chargent ses données, puis se mettent à jour environ toutes les cinq secondes lorsqu’ils n’ont pas de modification en cours.
5. L’indicateur « Collection partagée · à jour » confirme l’enregistrement serveur. « Synchronisation en cours » ou « Non synchronisé » ne sont pas des confirmations de sauvegarde distante.

Un navigateur qui édite une ancienne version ne peut pas remplacer une version serveur plus récente. Son brouillon est conservé localement et peut être exporté ; « Charger la version du serveur » abandonne ce brouillon après confirmation. Il n’y a pas de fusion automatique ambiguë.

Si le réseau est coupé, les changements restent dans un brouillon local et peuvent être repris après rechargement. Réessayez la synchronisation ou reconnectez-vous si la session a expiré. Les exports JSON/HTML restent disponibles. Les navigateurs connectés ne remplacent pas leur ancien carnet local : il reste conservé séparément.

## Sauvegardes et limites

Sauvegardez régulièrement le dossier de données ou exportez un JSON depuis l’application. L’écriture utilise un fichier temporaire, une synchronisation sur disque et un renommage atomique ; un JSON serveur illisible n’est pas remplacé par une collection vide. Le modèle systemd impose que le dossier de données existe et soit inscriptible.

Cette version utilise un seul mot de passe et une seule collection personnelle, pas plusieurs comptes. Le détourage et la disponibilité des photos restent indépendants de la synchronisation.

Le serveur, la persistance après redémarrage et les conflits entre navigateurs sont testés dans l’environnement de développement. Votre accès réseau, votre reverse proxy et votre unité systemd devront être vérifiés sur votre machine après installation.

## Le serveur répond mais aucun JSON n’est créé

Si le terminal indique « Synchronisation désactivée (COLLECTION_PASSWORD absent) », les modifications restent dans le stockage propre au navigateur. Configurez le mot de passe dans l’environnement du **processus serveur**, puis redémarrez ce processus. Avec systemd, modifiez son `EnvironmentFile` et redémarrez le service ; une variable exportée dans un autre terminal n’affecte pas un service déjà lancé.

Connectez d’abord le navigateur contenant vos choix actuels, puis attendez « Collection partagée · à jour ». C’est cette première connexion/sauvegarde qui initialise le fichier `collection.json`. Le dossier par défaut est `.collection-data` à côté de `server.cjs` : son nom commence par un point et peut être caché par votre explorateur. Le terminal affiche désormais son chemin lorsque la synchronisation est activée.

Connectez ensuite les autres navigateurs avec le même mot de passe. Si le fichier n’apparaît toujours pas, vérifiez le dossier configuré et ses droits d’écriture, ainsi que le message de synchronisation dans l’interface. Pour un accès HTTP local, `COLLECTION_SECURE_COOKIES` doit rester à `0` ; réservez `1` à votre accès HTTPS.
