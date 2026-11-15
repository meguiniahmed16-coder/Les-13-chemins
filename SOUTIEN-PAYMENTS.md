# Soutiens et préachats

Configuration mise en service le 15 novembre 2026, sur demande de l’auteur, sur le compte Stripe de production « Tectoniques des âmes ».

## Liens actifs

- Soutien ponctuel aux créations des Treize Chemins : https://buy.stripe.com/00w6oJ7Kg16V3UOfmq1sQ02 — montant libre, minimum 5 €, aucun plafond ajouté par le projet (les limites de Stripe restent applicables).
- Préachat de La tectonique des âmes : https://buy.stripe.com/fZu14p9So16V3UOcae1sQ01 — paiement ponctuel de 30 €.

L’ancien lien « Don 5€ » à montant fixe a été désactivé et indique l’adresse de la page de soutien.

L’auteur a confirmé ne pas facturer de TVA. Le calcul automatique des taxes est désactivé sur les deux liens actifs et sur l’ancien lien. Carte, Apple Pay et Google Pay sont activés ; PayPal ne l’est pas. Les moyens affichés dans Stripe dépendent de l’appareil et de l’éligibilité du paiement.

## Préachat et suivi

Mi-décembre 2026 désigne la fin prévue du manuscrit avant travail éditorial, pas la parution ni l’expédition. La date de parution et de livraison reste à déterminer ; cette précision figure sur le site et avant le paiement Stripe. Le format et les modalités d’expédition n’ont pas été renseignés par l’auteur : aucune promesse à leur sujet n’est ajoutée.

Les paiements, coordonnées des acheteurs, remboursements et versements sont suivis dans le Dashboard Stripe. La page statique n’attribue aucun accès et ne crée aucune commande à partir d’un retour d’URL. Aucun prélèvement de test ni virement réel n’a été effectué pour vérifier le parcours.

Si une livraison ou un autre traitement automatisé est ajouté, il devra s’appuyer sur les événements Stripe vérifiés et le statut du paiement, jamais sur la page de retour.

## Configuration du site

`soutien-config.json` ne contient que les liens publics et les textes affichés. `bookPreorderEnabled` active le préachat demandé par l’auteur ; ce drapeau ne certifie pas des modalités de livraison inconnues. Aucun secret ni renseignement bancaire ne doit être placé dans le dépôt.

Le suivi du compte bancaire et le calendrier des virements restent dans le Dashboard privé de l’auteur.
