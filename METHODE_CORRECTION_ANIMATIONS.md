# Méthode permanente — scènes et animations 3D

Version 1.1 — 8 novembre 2026. Cette méthode accompagne les fichiers du projet, pas un document stocké hors du site.

## Cycle obligatoire de correction

1. Identifier précisément le défaut visible en situation de jeu.
2. Corriger la **source** 3D, pas seulement un rendu isolé ou le fichier déjà compilé.
3. Recalculer les maillages anatomiques, exécuter les tests de géométrie puis reconstruire le jeu.
4. Inspecter le résultat en situation, depuis la caméra réelle **et** de face, profil et trois quarts, à plusieurs moments du mouvement.
5. N'annoncer une correction « validée » qu'après inspection visuelle et vérification du geste complet.
6. Reporter chaque erreur et sa prévention dans la présente méthode pour toutes les animations suivantes.

## Défauts mémorisés et règles applicables

| ID | Défaut observé | Correction / prévention | État |
| --- | --- | --- | --- |
| C001 | Doigts trop courts | Préserver la longueur des phalanges dans toute la pose, y compris lorsqu'elles sont repliées. | Règle établie |
| C002 | Main et gobelet fusionnés | Garder les doigts à l'extérieur de la paroi. Vérifier les intersections depuis plusieurs angles. | Coordonnées ajustées ; contrôle visuel requis |
| C003 | Pouce sans relief | Placer le pouce sur la face proche du gobelet, opposé aux autres doigts, et vérifier ombres et silhouette. | Coordonnées ajustées ; contrôle visuel requis |
| C004 | Cigarette tenue à l'envers | Placer le filtre vers la bouche et la braise vers l'extérieur, avec la cigarette entre index et majeur. | Modèle ajusté ; contrôle visuel requis |
| C005 | Geste sans contact avec l'objet | Contrôler main, objet et prise dans une même scène, pas seulement la main isolée. | Contrôle à effectuer |
| C006 | Mise à jour de la source invisible en ligne | Regénérer automatiquement `yoyo-hands-data.js` puis `yoyo-runtime.js` avant la publication Netlify. | Prévu dans le build |
| C007 | Validation trop précoce | Les tests numériques protègent contre les régressions, mais ne remplacent jamais une inspection visuelle des volumes et mouvements. | Règle établie |

## Vérifications spécifiques

- **Gobelet :** quatre doigts visibles selon l'angle, pouce séparé et opposé, aucun doigt traversant la paroi, tenue crédible durant le mouvement vers la bouche.
- **Cigarette :** index et majeur forment une pince, filtre dirigé vers la bouche ; ni paume inversée ni objet collé aux doigts.
- **Brosse :** doigts entourant réellement le manche, sans traversée ; vérifier les images de transition vers la prise.
- **Cintre et tissu :** crochet engagé dans la poignée, corde enroulée autour de la bonne partie, stabilité lors de la traction.
- **Cellules opposées :** bâtiments et détenus lisibles depuis la caméra de jeu.

## Publication

Les modifications doivent passer dans `main` pour être reprises par le déploiement de production défini dans `netlify.toml`. Le script public régénère désormais les éléments 3D et bloque la compilation si les tests échouent. Le succès des tests ne prouve pas à lui seul qu'une animation est visuellement parfaite.

**À inspecter ensuite :** prise du gobelet, tenue de la cigarette, brosse, corde et cintre, puis toutes les animations adjacentes.
