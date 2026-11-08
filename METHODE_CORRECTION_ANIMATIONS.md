# Méthode permanente — scènes et animations 3D

Version 1.6 — 8 novembre 2026. Cette méthode accompagne les fichiers du projet, pas un document stocké hors du site.

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

## C012 — Vérifier le véritable modèle affiché AVANT toute modification

**Preuve :** capture du 8 novembre 2026, étape « 1 / 3 — Trouver la brosse », marqueur « Brosse v3 ». Les doigts tordus visibles appartiennent à `searching = props.openHand()`, et non à `held = props.heldBrush()`. Les essais v1–v3 ont traité, entre autres, la mauvaise pose.

**Erreur de méthode :** valider une correction de `heldBrush` en s'appuyant sur les tests de maillage alors que l'utilisateur regarde encore `openHand` pendant l'approche.

**Nouvelle règle absolue :** lier chaque capture réelle à l'état du jeu, au modèle actif et à sa condition d'affichage dans `yoyo-scene.js`. Ne jamais corriger « la main de la brosse » sans distinguer `searching` (avant la saisie) de `held` (après la saisie). Vérifier l'expression de visibilité et les coordonnées de la caméra.

**Nouvelle pose « Main ouverte v4 » :** cinq doigts complets, trajectoires articulaires progressives, index/majeur/annulaire/auriculaire de longueurs naturelles, pouce déployé sans torsion inverse. Ongles réduits et mieux placés contre la peau. Un rendu hors jeu est inspecté de face, dos, profil et trois quarts. Tests spécifiques sur l'état `search`, la longueur de chaque doigt, les angles et le pouce. **Validation visuelle dans le jeu à confirmer par l'utilisateur.**

**Statut :** les corrections v3 ne sont pas considérées comme une validation de la main ouverte ; le correctif ciblé v4 doit être observé sur le site.

## C013 — Interdiction de simuler une vraie main par des tubes et une boule

**Retour de référence du 8 novembre 2026 :** l'utilisateur a fourni la photographie d'une main réelle et comparé le rendu précédent « Main ouverte v4 » à une déformation anatomique. Il a raison : malgré les ajustements, le volume procédural était trop rond, les doigts ressemblaient à quatre cylindres et la paume était gonflée, sans une naissance naturelle des articulations.

**Cause technique :** les capsules lissées de `build-yoyo-hands.mjs` ne possèdent ni topologie de peau articulée, ni vraie forme des métacarpes, ni zones d'insertion interdigitale. Ajuster les seules coordonnées ne corrige pas cette erreur de représentation.

**Changement de méthode :** pour une main visible en gros plan, employer un **maillage humain anatomique continu**, issu d'un asset publié sous une licence compatible, avec un squelette réel. Le modèle générique WebXR de main droite (25 articulations, MIT, 2019 Amazon) remplace la peau de `openHand()` seulement, en conservant la mécanique du jeu. Le fichier `hand-right.glb` est stocké dans le dépôt et copié localement sur Netlify avec `hand-right-LICENSE.txt`. Le raccord avec l'avant-bras doit être contrôlé depuis la caméra du jeu.

**Tests obligatoires :** le modèle doit être réellement chargé dans la scène visible avant la saisie ; vérifier qu'il contient un maillage anatomique dense et les articulations, pas simplement cinq ongles ou cinq doigts au nombre correct. Une compilation verte ne remplace pas l'examen photographique du rendu et la validation utilisateur.

**Réutilisation :** appliquer la même logique aux mains d'autres personnages, mais **ne pas remplacer leurs poses sans les contrôler une par une**. Les gestes du gobelet, de la cigarette et de la brosse restent à traiter séparément.

**État :** première main ouverte « Main anatomique v5 » — contrôles automatisés et rendu 3D de référence en cours ; contrôle dans le vrai jeu requis avant validation.

## C014 — Même anatomie pour tous les gestes et toutes les personnes

Réutiliser la géométrie WebXR anatomique `hand-right.glb` pour la prise de la brosse, du gobelet, de la cigarette, la main ouverte et les petites mains des détenus visibles. Une **même géométrie de peau ne signifie pas une pose identique** : les articulations sont animées selon l'objet. Chaque main requiert une inspection de la paume, du poignet, de ses cinq doigts et de ses contacts réels. Ne pas remplacer une main par un modèle primitif simplement parce qu'un geste est difficile.

## C015 — La collision avec les barreaux fait partie de la règle du jeu

Les barreaux sont des cylindres fixes, espacés de 21 cm dans la scène. Le sac plastique est replié pour passer entre les deux cylindres (largeur comprimée ≈ 11,6 cm), pas à travers eux. Après accroche, la manette déplace horizontalement le sac. Si son centre n'est pas dans l'ouverture calculée depuis la caméra, `advance()` interdit de progresser : **aucune livraison ne doit être validée en traversant le métal**. Les tests doivent simuler un choc sur un barreau, un réalignement, une nouvelle collision pendant la remontée et la réussite dans l'intervalle.

Le bras portant la brosse avance ensuite à travers cette même ouverture pendant la remontée ; dans la phase de recherche, il reste à l'intérieur. Les repères visuels du HUD doivent montrer les ouvertures, pas seulement un cercle de cible.

## C016 — Réalisme des détenus et du sac

Dans la prison française représentée, ne pas inventer un uniforme de détenu. Donner aux personnes des vêtements civils de formes et de couleurs différentes, des silhouettes plus fines, des visages moins simplifiés et des gestes moins identiques. Employer le même maillage anatomique pour les mains visibles.

Le sac transporté par le cintre retourné doit avoir une **géométrie de plastique souple**, deux anses, des bords thermosoudés, des plis et du volume concentré au fond. Sa transparence doit laisser deviner le contenu : tabac, puis café dans la version ludique à deux livraisons. Un ellipsoïde blanc et opaque ne constitue pas une représentation satisfaisante.

## C017 — Les deux livraisons changent visiblement la couleur

Aucun gain de couleur lorsque seule la brosse est trouvée. Après le premier sac, le bâtiment gris commence à se colorer ; après le second, les murs, les vêtements civils, les fenêtres et l'environnement sont beaucoup plus vifs. L'intensité doit dépendre de **deux livraisons réussies** (`bags=1`, puis `bags=2`), pas du seul lancement d'une cinématique. En cas de recommencement, repartir du gris.

## Vérifications restantes

- Contrôler le geste complet dans la scène sur mobile, les collisions visibles et la progression des teintes sur les deux livraisons.
- Inspecter séparément les poses de la brosse, du café et de la cigarette : compilation verte ne signifie pas validation anatomique.
- Vérifier également le rendu en mode logiciel, la lisibilité des indicateurs et la difficulté des espaces sur un écran étroit.
