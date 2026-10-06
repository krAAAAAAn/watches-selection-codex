# Version 0.6.2 — import Certina

## Problème reproduit

Fiche utilisée : https://www.certina.com/be-fr/watch/ds-8-gent-40mm/c0454104404100

L'ancien analyseur ne récupérait que l'étanchéité et le traitement antireflet. La référence restait vide et la photo était incorrectement remplacée par l'URL de la page.

La page publique est un HTML rendu par le serveur, sans objet `Product` JSON-LD ni image Open Graph. Les données sont présentes dans des champs HTML identifiés, mais certains libellés sont particuliers : **Hauteur** pour l'épaisseur du boîtier, **Modèle** dans la section mouvement pour le calibre, **Entre-corne** et **Poids net**. Le verre possède plusieurs valeurs. Des infobulles contiennent aussi des descriptions générales de matériaux ou de technologies qui ne doivent pas devenir des caractéristiques certifiées de cette référence. Enfin, les recommandations en bas de page affichent d'autres références, diamètres et prix.

## Correctif

L'analyse générique reste utilisée pour les autres sites. Sur `certina.com`, lorsque le produit structuré manque et que la fiche attendue est identifiable, une lecture ciblée des champs HTML complète l'import. Aucun JavaScript du site n'est exécuté, aucun navigateur côté serveur ni nouvelle dépendance n'est nécessaire.

La lecture se limite à l'article de la montre affichée et exclut les infobulles explicatives, la navigation et les recommandations. Elle utilise les identifiants des champs pour distinguer l'épaisseur d'une dimension quelconque et le modèle de mouvement d'un nom de montre. Les multiples valeurs du verre sont conservées. La référence affichée est confrontée au dernier segment de l'URL quand celui-ci contient une référence Certina.

Les champs absents restent absents. Les valeurs numériques ambiguës sont laissées à la saisie manuelle. Si la structure attendue n'est plus présente, l'analyse générique et la saisie manuelle restent disponibles, avec les avertissements habituels.

Une photo absente reste désormais vide sur tous les sites : elle n'est plus convertie en URL de la page. Pour la bibliothèque publique Certina `/sites/default/files/maps-medias/`, le lien de la photo principale est ramené au fichier original lorsque ses seuls paramètres concernent le redimensionnement (`im`, `itok`). Sur cette fiche, les deux liens transformés essayés répondaient **403**, alors que le PNG original répondait **200**, avec 421 336 octets, sous la limite de 2 Mo. Le modèle et la couleur ont été contrôlés visuellement ; l'image originale est transparente. La règle ne modifie pas les URL d'autres hébergeurs ni les paramètres inconnus.

## Résultat sur cette fiche belge francophone

Ces valeurs sont un relevé de la page lors du diagnostic ; prix et caractéristiques doivent toujours être vérifiés avant un achat.

| Information | Valeur lue |
| --- | --- |
| Nom | Certina DS-8 Gent 40mm |
| Référence | C045.410.44.041.00 |
| Diamètre | 40,00 mm |
| Épaisseur | 8,35 mm |
| Corne à corne | 47,19 mm |
| Entrecorne | 20,00 mm |
| Boîtier | Titane |
| Verre | Saphir et traitement antireflet simple face |
| Étanchéité | Jusqu'à une pression de 10 bar (100 m) |
| Poids net | 80,00 g |
| Cadran | Bleu |
| Mouvement | Quartz |
| Calibre | F05.412 |
| Prix affiché | 590,00 € |

[Photo originale de cette référence](https://www.certina.com/sites/default/files/maps-medias/C045.410.44.041.00_SLD.png)

Les unités et valeurs originales sont conservées dans le formulaire (`40.00mm`, `8.35mm`, etc.). La réserve de marche n'est pas inventée pour ce modèle quartz.

## IA facultative

Cette fiche peut désormais être importée **sans IA**. Si vous demandez l'enrichissement IA, le modèle reçoit le texte ciblé de cette montre, sans les descriptions génériques des infobulles et les recommandations. Les contrôles des extraits restent actifs. Le prix lu directement dans les champs de la page, avec sa devise, est préservé comme le prix structuré : une suggestion IA ne peut pas le remplacer par une autre devise.

Il s'agit d'une petite adaptation de lecture HTML pour Certina, pas d'une garantie universelle sur toutes les marques ou toutes les mises en page Certina. L'analyse IA configurée reste générique et optionnelle.

## Mise à jour et utilisation

Depuis la version 0.6.1, **remplacez `server.cjs` et redémarrez votre serveur**. Le HTML n'a pas changé dans ce correctif. Conservez `.env` et votre dossier de données. Pour une installation plus ancienne, mettez à jour l'ensemble des fichiers applicatifs selon le guide homelab.

Relancez **Analyser cette fiche**, puis vérifiez l'aperçu et utilisez la proposition. Les imports ne remplacent que les champs vides du formulaire : une valeur incorrecte déjà remplie doit être effacée ou corrigée avant de reprendre la proposition. Aucune fiche existante n'est modifiée automatiquement. Le prix n'est pas mis à jour automatiquement après l'import.

## Validation

La fixture contient le vrai HTML public téléchargé. Les tests vérifient les 12 caractéristiques, la référence, la photo principale et les unités, les valeurs multiples du verre, les champs manquants, des libellés traduits, une référence discordante et un domaine ressemblant à Certina. Ils vérifient également que chaque extrait est retrouvé dans le texte ciblé et que les modèles recommandés et les infobulles sont exclus.

Le parcours navigateur complet est testé : aperçu sans sauvegarde ni appel IA, formulaire, enregistrement avec provenance et lecture depuis un second navigateur. Un fournisseur compatible simulé vérifie l'enrichissement optionnel, le rejet d'une caractéristique tirée d'une recommandation et la conservation du prix en euros. Aucun fournisseur IA réel n'a été appelé.

La page publique et la photo originale ont été consultées sur Internet, y compris avec les User-Agent du carnet, via le proxy du cloud de développement. Les tests automatisés utilisent la copie du HTML et un téléchargement simulé pour rester reproductibles. Le déploiement et l'accès HTTPS direct depuis votre homelab ne sont pas vérifiés ici.
