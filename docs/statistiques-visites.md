# Statistiques de fréquentation

Installées le 15 novembre 2026 avec Cloudflare Web Analytics sur le compte Cloudflare existant de l’auteur.

- Site : `tectonique-des-ames.com`.
- Identifiant Web Analytics : `f8596f6ed0bb4d51b9988e90b096b54c`.
- Installation manuelle, sans changement DNS ni changement d’hébergement.
- Tableau de bord privé : https://dash.cloudflare.com/?to=/:account/web-analytics puis choisir `tectonique-des-ames.com`.
- Le jeton présent dans le script est l’identifiant public de collecte, pas une clé d’accès au compte.

Les pages publiques compilées reçoivent le chargeur à la construction. Celui-ci charge le beacon Cloudflare uniquement sur le domaine principal et son alias www, en HTTPS. Les aperçus locaux, l’alias technique Netlify, les jeux intégrés dans une iframe, les pages de redirection ainsi que contact, administration et espace éditeurs sont exclus. Les jeux ouverts directement restent mesurés. Les changements internes de plateau ne génèrent pas de pages vues supplémentaires (`spa: false`).

Le compteur porte sur les visites et pages vues à partir de l’installation. Il ne reconstitue pas l’historique. Les bloqueurs et les navigateurs sans JavaScript peuvent limiter les mesures ; une visite n’est pas un décompte certain de personnes uniques. Aucun identifiant personnel ou événement de formulaire n’est ajouté par notre code. Le script ne modifie ni les sauvegardes ni les commandes des jeux.

Documentation :
- https://developers.cloudflare.com/web-analytics/get-started/
- https://developers.cloudflare.com/web-analytics/faq/
- https://developers.cloudflare.com/web-analytics/data-metrics/

Validation : tests du chargement conditionnel et de l’injection, puis construction et contrôles existants du site. La publication doit être vérifiée sur le domaine principal et le beacon chargé dans un navigateur réel.
