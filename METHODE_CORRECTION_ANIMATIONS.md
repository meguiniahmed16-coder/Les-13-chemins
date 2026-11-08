# Méthode permanente — scènes et animations 3D

Version 1.3 — 8 novembre 2026. Cette méthode accompagne les fichiers du projet, pas un document stocké hors du site.

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
| C002 | Main et gobelet fusionnés | Garder les doigts à l'extérieur de la paroi. Vérifier les intersections depuis plusieurs angles. | Ancienne correction refusée par le test utilisateur ; nouvelle pose à vérifier |
| C003 | Pouce sans relief | Placer le pouce sur la face proche du gobelet, opposé aux autres doigts, et vérifier ombres et silhouette. | Coordonnées ajustées ; contrôle visuel requis |
| C004 | Cigarette tenue à l'envers | Placer le filtre vers la bouche et la braise vers l'extérieur, avec la cigarette entre index et majeur. | Ancienne correction refusée : dos de la main vers le visage ; nouvelle pose à vérifier |
| C005 | Geste sans contact avec l'objet | Contrôler main, objet et prise dans une même scène, pas seulement la main isolée. | Contrôle à effectuer |
| C006 | Mise à jour de la source invisible en ligne | Regénérer automatiquement `yoyo-hands-data.js` puis `yoyo-runtime.js` avant la publication Netlify. | Prévu dans le build |
| C007 | Validation trop précoce | Les tests numériques protègent contre les régressions, mais ne remplacent jamais une inspection visuelle des volumes et mouvements. | Règle établie |
| C008 | Doigts tordus malgré les tests | Mesurer la **longueur complète des phalanges** et les angles entre segments ; vérifier les points intermédiaires, pas seulement les ongles. Une main autour du gobelet ne doit pas inventer des doigts de 12 cm. | Correctif anatomique v2 ; contrôle visuel requis |
| C009 | Main fumant à l'envers malgré filtre correct | Contrôler séparément **la paume**, la direction du filtre et le point de pincement. Faire tourner la peau autour du point de prise sans retourner la cigarette. | Rotation de paume corrigée ; contrôle visuel requis |
| C010 | Corrections invisibles après la publication | Sur chaque nouvelle pose, changer la signature visible de version et l'URL du script pour invalider le cache du navigateur. | Signature « Mains v2 » ajoutée |

## Vérifications spécifiques

- **Gobelet :** quatre doigts visibles selon l'angle, pouce séparé et opposé, aucun doigt traversant la paroi, tenue crédible durant le mouvement vers la bouche.
- **Cigarette :** index et majeur forment une pince, filtre dirigé vers la bouche ; ni paume inversée ni objet collé aux doigts.
- **Brosse :** doigts entourant réellement le manche, sans traversée ; vérifier les images de transition vers la prise.
- **Cintre et tissu :** crochet engagé dans la poignée, corde enroulée autour de la bonne partie, stabilité lors de la traction.
- **Cellules opposées :** bâtiments et détenus lisibles depuis la caméra de jeu.

## Publication

Les modifications doivent passer dans `main` pour être reprises par le déploiement de production défini dans `netlify.toml`. Le script public régénère désormais les éléments 3D et bloque la compilation si les tests échouent. Le succès des tests ne prouve pas à lui seul qu'une animation est visuellement parfaite.

**À inspecter ensuite :** prise du gobelet, tenue de la cigarette, brosse, corde et cintre, puis toutes les animations adjacentes.

## Retour du contrôle utilisateur du 8 novembre 2026

Les essais précédents ont été rejetés : « les doigts sont toujours tordus et la main qui fume la cigarette est inversée ». Cette observation fait foi malgré la réussite des tests automatiques. Ne pas annoncer « corrigé » ou « validé » avant un nouveau contrôle sur le **site public**.

Dans la pose v2, la cigarette est tenue entre les phalanges de l'index et du majeur, et les extrémités des doigts se prolongent naturellement au-delà. La géométrie de la main est pivotée autour de ce point de contact pour présenter la **paume** au personnage ; le filtre reste tourné vers le visage. La prise du gobelet utilise des longueurs de doigts plausibles, sans traverser la paroi. Vérifier en priorité les silhouettes lors des derniers instants de la scène de victoire.

## C011 — Première prise de la brosse à toilette (« heldBrush »)

**Observation utilisateur :** lors de la première prise de la brosse, la main entière apparaît, mais les quatre doigts sont tordus. Les corrections précédentes du gobelet et de la cigarette ne résolvent pas ce problème.

**Cause constatée dans la source :** les quatre doigts de `build-yoyo-hands.mjs` empruntaient un trajet quasiment identique à différentes hauteurs. Les articulations décrivaient des retournements brutaux, sans contrainte géométrique autour du manche.

**Règle permanente :** construire la pose de préhension **autour de l'objet réel** et de son rayon (ici manche vertical, rayon ≈ 13 mm). Contrôler chacune des quatre chaînes digitales, leurs longueurs, l'angle de toutes les articulations et le contact des pulpes avec le cylindre. Le pouce doit être du côté opposé. Ne jamais considérer qu'une main seule en image démontre une prise fonctionnelle.

**Révision « Brosse v3 » :** quatre doigts dessinés séparément avec une courbure progressive, des longueurs différenciées et un pouce qui s'oppose au manche. La nouvelle méthode de vérification mesure la distance de chaque doigt au manche, la flexion des articulations et le croisement éventuel. Un rendu de diagnostic multi-vues de la prise entière a été examiné *hors du jeu*, mais la version publique n'est pas validée visuellement avant contrôle réel sur le téléphone.

**État :** correction reconstruite en cours de déploiement / validation utilisateur à venir. Conserver la distinction entre tests automatiques verts et résultat jugé anatomiquement correct.
