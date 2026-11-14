# Prison — visite, démonstration et détails personnels

## Comportement

- Un appui bref lance l’approche automatique du balai dans l’allée, puis la fermeture de la main et la prise. Le doigt peut être relâché immédiatement. La géométrie validée du manche et de la main reste utilisée.
- La corde oscille sur 12 cm d’une extrémité à l’autre, avec un léger ballant du sac. Le cercle vert indique le passage qui permet d’accrocher. Maintenir Saisir accompagne la tentative et la traction ; relâcher ne perd pas la corde déjà prise. La pause et la cachette suspendent la traction.
- Visite de 24 secondes, avec possibilité de pause et de passage direct à la démonstration.
- Démonstration illustrée en trois séquences : prendre le balai, accrocher puis tirer, se cacher. Revoir et Passer restent accessibles ; la fin attend « À toi de jouer ». Aucun point et aucune patrouille pendant cette démonstration.
- Images de paysage inventées, dessins, lettres, enveloppes et trois livres fermés : L’Étranger, Les Misérables et Le Petit Prince. Aucun appareil à café ni café préparé ajouté. Les images du décor sont dessinées localement, sans portraits familiaux attribués au narrateur.

## Vérification

339 tests passent avec `npm run build`. Le parcours réel sous simulation utilise le vrai squelette et les commandes : visite/pause/démo, appui bref, récupération des deux sacs, garde, bonus unique et retour au plateau. Un test supplémentaire marche d’abord loin du balai puis vérifie qu’un appui bref suffit à revenir le prendre. Les fenêtres de capture sont vérifiées en portrait et paysage : l’attente continue maximale reste inférieure à 2,1 secondes dans les phases testées. La géométrie du sac passe entre les barreaux jusqu’aux limites de capture (29 mm de décalage).

Le contrôle visuel à 390 × 800 utilise temporairement le moteur logiciel existant, car le navigateur de contrôle ne propose pas WebGL. Cet aperçu est exclu de la publication. Les ombres WebGL et les performances réelles du téléphone ne sont pas mesurées par cet aperçu.
