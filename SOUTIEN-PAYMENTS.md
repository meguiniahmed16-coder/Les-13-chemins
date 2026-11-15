# Activation des soutiens et préachats

La page `soutien.html` est publiée sans encaissement tant que les liens réels du compte de l’auteur ne sont pas configurés. Les mentions d’ouverture sont explicites, sans faux bouton de paiement. L’interface et le fournisseur sont distincts : les paiements et virements se suivent dans le Dashboard privé Stripe.

## Soutien aux créations

Créer un Payment Link ponctuel en EUR dont le client choisit le montant : minimum **5 €**, aucun plafond volontaire ajouté par le projet (les limites du prestataire restent applicables). Décrire le paiement comme un soutien facultatif aux contenus déjà proposés sur Les Treize Chemins. Stripe distingue ce soutien d’un don caritatif ; ne pas prétendre délivrer un reçu fiscal.

## Préachat

Créer un produit distinct « La tectonique des âmes — Préachat », paiement ponctuel de **30 €**. Avant d’activer le lien, faire préciser par l’auteur : format du livre, frais et zones de livraison, délai de livraison, conditions de remboursement/annulation et informations du vendeur. Mi-décembre 2026 désigne seulement la fin du manuscrit avant travail éditorial, pas la parution ni l’expédition.

Renseigner ces informations sur la page et dans le parcours de paiement, collecter l’adresse e-mail pour le suivi et, pour une livraison postale, l’adresse de livraison. Ne pas inventer de date ni de promesse commerciale. Le lien de préachat reste masqué tant que `bookTermsConfirmed` n’est pas `true` et `bookDetails` n’est pas renseigné.

Le 15 novembre 2026, l’auteur a confirmé ne pas facturer de TVA. Ne pas activer la collecte automatique Stripe Tax sans nouvelle consigne.

## Compte et versements

Le titulaire active et vérifie son compte Stripe et renseigne son compte bancaire directement chez Stripe. Activer carte, Apple Pay, Google Pay, puis PayPal si le compte est éligible. Vérifier le compte bénéficiaire, la devise et le prix de chacun des liens. Les moyens réellement affichés dépendent aussi de l’appareil et du contexte du payeur. Configurer les reçus et les versements dans le Dashboard. Aucune clé secrète ni donnée bancaire ne doit être copiée dans le dépôt ou demandée dans la conversation.

Renseigner ensuite `soutien-config.json` :

- `supportPaymentLink` : URL de production Stripe créée pour le soutien au projet.
- `bookPaymentLink` : URL de production Stripe du livre, prix vérifié à 30 €.
- `bookTermsConfirmed` et `bookDetails` : activer uniquement après validation des éléments ci-dessus.
- `paymentMethods` : uniquement les moyens effectivement activés et vérifiés.

Le site ne considère jamais un paramètre d’URL de retour comme une preuve de paiement et ne gère aucun statut de commande. Les paiements confirmés et la liste des acheteurs font foi chez le prestataire. Avant activation publique, vérifier les parcours en mode test chez Stripe, notamment minimum du soutien, montant du préachat, annulation, reçu, livraison et portefeuille mobile éligible.

Sources officielles consultées le 15 novembre 2026 :
- https://support.stripe.com/questions/requirements-for-accepting-tips-or-donations
- https://support.stripe.com/questions/how-to-accept-donations-through-stripe?locale=fr-FR
- https://docs.stripe.com/payments/paypal
- https://stripe.com/en-fr/payments/payment-links
