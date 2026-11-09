# Méthode permanente — scènes et animations 3D

Version 2.0 — 8 novembre 2026. Cette méthode accompagne les fichiers du projet, pas un document stocké hors du site.

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

## C018 — Alignement physique, projection et geste complet

**Constat des tests :** une première simulation utilisait par erreur la tangente du quart de l'angle de champ au lieu de la tangente de sa moitié. Les coordonnées d'ouverture calculées pour le joueur ne correspondaient pas aux barreaux rendus par Three.js. Corrigé : `Math.tan(63*Math.PI/360)`, avec le rapport largeur/hauteur de la caméra de jeu.

**Règle :** une corde ne peut être accrochée que lorsqu'elle passe devant une **ouverture réelle**. Une fois accrochée, le joueur déplace le sac par la manette jusqu'à cette ouverture ; il est alors autorisé à tirer. Si le sac quitte l'ouverture, toute progression se fige jusqu'au réalignement. Les tests couvrent ce blocage et la réussite après correction.

**Geste 3D :** le bras passe derrière le plan des barreaux dès l'accrochage, entre deux cylindres, puis recule en ramenant le sac. Le cintre est plus large que l'ouverture : il tourne **de profil** lors du franchissement. Le sac est étroit et centré sur l'ouverture, avec des anses asymétriques qui remontent réellement jusqu'au crochet.

**Contrôles :** comparer les ouvertures projetées dans le gameplay et les espaces 3D depuis un téléphone et un écran large. Vérifier le même principe dans le rendu de secours 2D. Ne pas considérer une animation validée uniquement parce que le joueur a réussi l'épreuve.

## C018 — Flexion dorsale accidentelle : le signe n'est pas un détail

**Signalement utilisateur :** dans l'animation de la cigarette, les articulations des quatre doigts sont fléchies, **mais dans le mauvais sens**. Le pouce et les autres doigts ne doivent pas être traités avec un signe identique : leur anatomie diffère.

**Cause géométrique identifiée dans le GLB d'origine :** les doigts s'étendent selon le repère local -Y et la paume se trouve vers -X. Une rotation positive autour de +Z déplace l'extrémité des doigts vers +X, donc **vers le dos de la main**. Les anciens profils de brosse, gobelet et cigarette utilisaient ce signe erroné.

**Correction :** conserver la peau et le squelette anatomiques ; appliquer aux **quatre doigts longs** une flexion **négative autour de +Z** en coordonnées natives, et conserver une convention distincte pour le pouce. Pour fumer, réduire la flexion de l'index et du majeur, enrouler l'annulaire et l'auriculaire vers la paume, et placer la cigarette entre les phalanges intermédiaires de l'index et du majeur.

**Validation obligatoire :** calculer depuis les vrais nœuds du squelette 25 os la direction de déplacement des bouts de doigts après flexion. Elle doit aller vers -X. Comparer des rendus de profil (ancien signe et signe corrigé), avec l'objet présent. Les tests géométriques ne remplacent pas l'observation réelle dans le jeu.

**Réutilisation :** appliquer cette règle aux prises de brosse et de gobelet, ainsi qu'aux autres personnes, sans copier aveuglément la même flexion. Déplacer seulement la cigarette ne saurait réparer un doigt plié à l'envers.

**État :** « Yo-yo v7 — flexion palmaire » ; contrôle utilisateur encore requis.

## C019 — Deux images fixes du véritable geste, sans aucune articulation animée

**Décision utilisateur :** le personnage ne fléchit jamais les doigts devant la caméra pendant l'épreuve. L'action est composée de **deux états discrets** : la main ouverte qui approche de la brosse, puis la même main vue de dos qui tient fermement le manche. Après la saisie, le geste est **figé** ; la main entière peut se déplacer avec la manette, mais ses doigts ne sont plus animés.

**Sources retenues :** une illustration réaliste de la main ouverte et, pour la seconde image, la **vue de dos de la main tenant la vraie brosse**, explicitement choisie par l'auteur. Les deux silhouettes possèdent un canal alpha, sans décor : elles peuvent être superposées aux scènes du jeu.

**Intégration v9 :** conserver la visite de la cellule et les façades existantes ; remplacer uniquement les mains visibles dans les états interactifs search, pickup et window par deux WebP fixes. Remplacer l'image à la saisie, au moment précis où la brosse posée au sol disparaît. Dans toutes les étapes suivantes, la même image du dos et de la brosse suit la position horizontale du joueur. Les gestes de la fin (café et cigarette) appartiennent à la scène finale et ne doivent pas faire réapparaître la brosse.

**Interdictions :** plus de rotation de phalanges, pas de squelette 3D utilisé pour la brosse dans les phases interactives, pas de nouveau graphisme procédural qui s'éloigne de la prise approuvée, pas de remplacement du décor par une réécriture rudimentaire en 2D.

**Performance :** images de taille réduite (environ 16 Ko pour la main ouverte et 21 Ko pour le dos avec brosse), aucune texture 3D supplémentaire, même jeu et mêmes collisions avec les barreaux.

**Contrôle obligatoire :** inspecter le rendu réellement publié dans l'orientation du téléphone, confirmer la lisibilité du pouce et des quatre doigts, le positionnement de la tête de la brosse et l'absence de doublons. Les tests techniques sont nécessaires mais ne valent pas validation visuelle par l'auteur.


## C020 — Danseuse Quaternius : ne pas confondre squelette, compilation et danse

**Jeu :** L'Amitié retrouvée / Danse pour sauver Lionel, branche expérimentale prototype/danseur-humain-quaternius-v1 (8 novembre 2026). Modèle Superhero Female de Quaternius (CC0), avec peau articulée et 65 os. Un seul personnage est remplacé ; les autres silhouettes et la version publique restent intactes.

**Constat sur une vraie capture :** le GLB se charge, le visage est visible et les tests de structure passent, mais les bras restent presque horizontaux en **T-pose**. Ajouter de faibles oscillations aux quaternions de repos ne constitue pas une vraie chorégraphie. Une pose anatomiquement valide au repos peut être visuellement inacceptable dans la danse.

**Règle du rig :** à chaque trame, repartir des quaternions d'origine de TOUS les os. Déterminer dans le repère mondial le sens de descente de chaque bras, puis transformer cet axe dans le repère de l'os parent avant de tourner. Ne pas réutiliser aveuglément les axes locaux d'un autre personnage ; les signes des épaules droite et gauche diffèrent. Mesurer les articulations réelles dans la capture : en pose de danse de base, les coudes doivent descendre sous les épaules. Contrôler les coudes, mains, genoux, pieds et torsions sur plusieurs instants.

**Visage et vêtements :** le modèle Standard gratuit n'a pas de morph targets faciales. Le sourire léger doit suivre l'os Head ; un simple trait ne vaut pas validation visuelle de l'expression. La coloration par sommet ne doit pas créer de bande beige à la taille ; examiner les coutures de face, de profil et en mouvement.

**Vérification obligatoire :** capturer le personnage VRAIMENT chargé dans Chromium en largeur ordinateur et sur écran étroit, contrôler la présence des os, du sourire et les hauteurs réelles des deux coudes par rapport aux épaules. Produire les deux images en artefact. La CI verte n'est pas une validation graphique ; une dépendance Python de traitement d'image manquante n'est pas une défaillance du jeu. Distinguer chaque type d'erreur (build, chargement, navigateur, aspect, animation).

**Sécurité :** conserver l'ancien danseur tant que le modèle ne se charge pas. Ne jamais fusionner dans le jeu public sans inspection des captures et accord de l'auteur. Corriger et RECAPTURER chaque anomalie, plutôt qu'affirmer que le rendu est bon sans l'avoir vu.

**Statut :** correction des bras en cours sur branche d'essai ; validation graphique par l'auteur restant à faire.


## C021 — Fidélité au roman et sobriété du mini-jeu (8 novembre 2026)

**Instruction de l'auteur :** le personnage jouable principal est un **homme** tiré du roman *La Tectonique des âmes*. Quatre femmes dansent autour de lui : une femme noire avec sa coiffure afro déjà validée, une blonde aux cheveux longs lisses, une rousse avec queue-de-cheval et une brune au carré. Seules les coiffures et couleurs des trois personnages secondaires doivent être différenciées, sans rouvrir le travail sur les visages. Conserver la scène, les règles, les cinq personnages et le public existants. Il s'agit d'un petit jeu inséré dans une plateforme littéraire, pas d'un développement autonome coûteux. Tester rapidement une vraie vue complète et mobile ; rester sur branche d'essai jusqu'à validation.


## C022 — Panel des cinq candidats : mêmes corps 3D que le héros (8 novembre 2026)

Le panel au fond du mini-jeu ne doit plus présenter les anciens personnages en tubes et sphères quand le vrai danseur 3D fonctionne. Les cinq candidats utilisent des copies de **la même géométrie masculine Quaternius CC0, avec le vrai squelette 65 os**, chargée une seule fois pour le héros. Les copies possèdent des chemises, carnations, couleurs de cheveux et proportions légèrement différentes ; elles conservent les cinq emplacements, numéros et petites réactions en arrière-plan. Les silhouettes simplifiées ne servent que de secours si WebGL ou le chargement du modèle échoue. Ne pas toucher à la coiffure afro validée de la danseuse ni aux visages et règles du jeu. Ne pas télécharger d'assets supplémentaires, créer de sous-jeu ou publier avant contrôle visuel.


## C023 — Les quatre danseuses ont le même vrai corps Quaternius (8 novembre 2026)

**Erreur corrigée :** seule la première danseuse avait été dotée d'un véritable corps féminin articulé. Changer les couleurs et coiffures des trois autres sur leurs vieux corps procéduraux ne satisfaisait pas la demande. Désormais, le même GLB féminin CC0 est chargé **une seule fois**, puis cloné par SkeletonUtils pour les trois autres femmes, avec un maillage skinné de plus de 5 000 sommets et un squelette d'au moins 60 os chacune. Les anciennes silhouettes ne sont cachées qu'une fois les trois copies prêtes. L'originale noire conserve intégralement sa coiffure afro et son visage validés ; les copies ont respectivement les cheveux longs blonds, la queue-de-cheval rousse et le carré brun, avec les différentes couleurs de vêtements déjà choisies. Pas de nouveau téléchargement, ni de refonte du mini-jeu. Vérifier sur la capture de la piste que les quatre silhouettes articulées sont bien présentes ; l'ancien corps doit être caché pour chacune.


## C024 — Banderole littéraire haute résolution

Remplacer « QUI EST LE DANSEUR ? » par « Chapitre 3 — Le coup du bus » et « P 54-56 » (exactement : P majuscule, un espace, 54-56 avec trait d’union ; pas de « PAGE » en capitales ni de barre oblique). Texture Canvas 4096 × 512 avec fin cadre néon de plateau télé, sans nouvel asset ni modification des corps et règles du mini-jeu. Vérifier une capture du vrai rendu, conserver le travail dans la branche de test sans publier.


## C025 — Public de l’émission (novembre 2026)

Seize spectateurs restent installés sur deux rangées devant la piste : vêtements et carnations variés, coiffures courtes, carrés, chignons, boucles, quelques crânes dégarnis. Réactions discrètes et décalées (applaudir, encourager, hocher la tête), sans mouvement uniforme ni modification du gameplay. Les figurants demeurent volontairement simples et légers car ils sont au premier plan mais secondaires dans ce mini-jeu de la plateforme littéraire. Ne pas toucher au danseur principal masculin, aux quatre danseuses articulées ni à la banderole « Chapitre 3 — Le coup du bus » / « P 54-56 ». Validation nécessaire sur vue réelle, mobile et écran large.


## C026 — Les trois spectateurs visibles de l’autre côté

Les trois têtes au premier plan dans la capture d’ensemble (sièges 3, 4 et 5 de la rangée avant) avaient conservé un aspect ancien, en volumes primitifs. Remplacer **uniquement ces trois figurants** par trois copies du corps Quaternius 3D déjà chargé pour le personnage principal (squelette conservé, couleurs de peau, vêtements et cheveux adaptés), sans aucun nouvel asset à télécharger. Les anciens volumes sont cachés seulement après création des trois nouveaux. Conserver les treize autres spectateurs, les quatre danseuses, le héros, les cinq candidats, les règles et la banderole littéraire. Tester aussi le rendu général réel avant approbation.


## C027 — Les spectateurs ne sont pas des danseurs

Les trois figurants Quaternius au premier plan ont été incorrectement animés par la chorégraphie du héros, d'où les bras levés. Ils doivent simplement observer : bras le long du corps, légère inclinaison de tête, aucune danse ni célébration systématique. Garder leurs trois vrais corps 3D, leurs emplacements et tous les autres éléments. Vérifier dans le vrai navigateur que les coudes se situent sous les épaules avant de valider la capture.


**Correction C027, orientation des spectateurs :** les personnages sont retournés d’un demi-tour vers la scène. Les angles monde utilisés pour le héros abaissent les bras dans sa direction, mais les lèvent une fois réutilisés sur les figurants tournés. Adapter les signes des rotations d’épaules au repère de ces spectateurs et contrôler les coordonnées verticales des coudes depuis le navigateur (les coudes doivent être sous les épaules).


## C028 — Mini-jeu Bosnie : un compagnon autonome et le ciel ouvert (8 novembre 2026)

**Règle validée de l'auteur :** ajouter un second soldat qui fait chaque traversée avant le héros, en sécurité, rejoint le muret suivant et y attend. Lorsque le joueur réussit, il dépasse le compagnon ; celui-ci repart en éclaireur pour le passage suivant. Il ne peut jamais être touché, ne modifie pas les tirs ni les collisions, ne rapporte aucun point et n'a pas d'influence sur l'échec du personnage principal.

**Choix technique :** le personnage principal et le compagnon chargent une seule fois le modèle humain riggé CC0 « Superhero Male » de Quaternius déjà présent pour le jeu de danse (danse-quaternius-hero.glb) ; deux copies du rig reçoivent des tenues vert olive et un casque simple. Les animations sont reconstituées à partir des quaternions de repos pour éviter les articulations brisées. Pour garder le mini-jeu court, les objets sont intégrés par bosnie-addon-source.js, compilé dans bosnie-addon.js, sans modifier la logique des cinq passages du fichier existant. Si le modèle ne charge pas ou si WebGL n'est pas disponible, le personnage jouable original reste en place et un compagnon de secours apparaît.

**Ciel :** dôme panoramique 3D procédural, gris-bleu, nuages diffus et brouillard conservé pour l'ambiance. C'est une amélioration de décor sans nouvelle archive ni abonnement. Vérification obligatoire sur capture réelle desktop/mobile, d'une traversée et de l'apparition du soldat supplémentaire. Les autres scènes de la plateforme littéraire et les règles du jeu restent inchangées.

**Précaution :** s'appuyer sur la branche d'essai, jamais publier directement sans contrôle d'image et de comportement.


## C029 — Deux soldats en tenue militaire et non en tenue de danse

La première tentative affichait de simples corps humanoïdes Quaternius repeints en kaki : inadmissible, ils ressemblaient à des danseurs. Respecter le texte du chapitre « Même pas mal », Sarajevo après passage du mandat ONU au mandat OTAN : veste et pantalon treillis camouflage, gilet pare-balles, pochettes et ceinturon, rangers, paquetage, écusson « OTAN », casque lourd bleu recouvert de camouflage, jugulaire. Les accessoires sont attachés aux **vrais os** pour suivre course, flexion et tête ; ne pas coller un gros rectangle statique sur l'écran. Modèles Quaternius existants sous CC0, pas de nouvel achat ou téléchargement. Le compagnon reste invulnérable et part en premier. Contrôles : les deux modèles doivent posséder leurs équipements avant le rendu et la capture mobile doit montrer une silhouette militaire reconnaissable. Les éléments ne sont qu'une évocation visuelle, pas une reproduction certifiée au millimètre.


**Ajustement de rendu (casque/rangers) :** comparer le gros plan des deux soldats. Le bas du casque couvrait le haut des yeux et les chaussures avaient un volume carré excessif. Rehausser légèrement le couvre-casque sur l'os de la tête et réduire les volumes des rangers, sans modifier le squelette, la vitesse du compagnon ni les cinq passages. Nouvelle capture ordinateur et téléphone obligatoire.


## C030 — Bosnie : lecture plus claire, destructions crédibles et tireur visible aux jumelles

Sur la branche expérimentale du mini-jeu « Entre les rafales », éclaircir modérément la colorimétrie et réduire la dominante verte ainsi que l'opacité du brouillard, sans supprimer l'ambiance nuageuse. Compléter les immeubles existants par des ouvertures aux bords fracturés, des impacts dans les façades, des armatures et des gravats ; ces ajouts sont purement visuels et ne changent ni collisions ni trajet. Rendre les deux fusils en bandoulière distincts et visibles sur les soldats français, sans ajouter de mécanique de tir au joueur. Le tireur opposé est identifiable dans la fenêtre active à laquelle les jumelles sont déjà orientées : casque, buste et arme en silhouette, visible seulement pendant l'observation, sans ajout de tirs ni modification des fenêtres de sécurité. Test impératif dans un navigateur réel, y compris une capture avec les jumelles activées ; les captures classiques de build ne suffisent pas.


**Contrôle visuel C030 :** la première capture des jumelles plaçait effectivement le tireur au centre d'une fenêtre, mais sa silhouette trop petite était difficile à reconnaître sur téléphone. Réduire le champ optique des jumelles à 15,5°, renforcer légèrement la silhouette et ajouter une courte identification « TIREUR REPÉRÉ À LA FENÊTRE » dans le masque existant, sans toucher à la cadence des tirs ni au déplacement du joueur. Retester une capture de la véritable fenêtre visée.


## C031 — Tireur à la fenêtre : même véritable corps humain 3D

Le tireur découvert aux jumelles doit réutiliser le **même modèle Quaternius humanoïde articulé** que les deux soldats du joueur, chargé une seule fois depuis le dépôt. Le vieux buste cylindrique et la tête sphérique restent uniquement comme repli jusqu'au chargement de l'asset. Une fois le rig prêt, ils sont cachés ; l'arme en travers de la fenêtre reste visible, mais le tireur conserve sa peau humaine continue, son casque et sa tenue discrète sans écussons français ou OTAN. Les jambes de la figurine sont masquées par le seuil grâce à un plan de coupe, pour qu'elle ne traverse pas le mur. Aucun changement dans les tirs, les jumelles, les scores ou les cinq fenêtres. Tests obligatoires dans le vrai navigateur : présence d'au moins 60 os, ancienne silhouette masquée et capture avec jumelles activées.


**Ajustement C031 :** les rotations d'épaules du tireur doivent correspondre à son orientation face aux jumelles, et non aux angles des soldats courant latéralement dans l'avenue. Valider dans Chromium que les deux coudes descendent sous les épaules (pas de T-pose), que le maillage original est un SkinnedMesh dense et que les corps en primitives sont cachés.


**Correction d'orientation C031 :** un premier signe appliqué au squelette importé levait les coudes de 0,18 m malgré un calcul intuitif fondé sur l'axe géométrique. Se fier à la hauteur mesurée des os réels dans Chromium (épaule moins coude doit être positive) et non à l'impression qu'un signe de rotation devrait être correct. Revenir aux signes natifs de l'armature et recapturer.


**Amélioration de lisibilité C031 :** dans la capture des jumelles, le tireur humanoïde 65 os était présent mais sa tenue trop petite pour être reconnaissable. Utiliser un champ optique de 10° lors de l'observation (au lieu de 15,5°), et une échelle du même modèle de 0,86. Conserver l'orientation des coudes validée et revérifier la présence du tireur dans les deux optiques. Aucun changement aux tirs ou à la sécurité des cinq traversées.


## C032 — Trois armes réellement visibles et scène diurne lisible (9 novembre 2026)

L'auteur a confirmé que la scène demeurait trop sombre et que les armes étaient invisibles ou non utilisées. Ne plus se satisfaire de vérifications sur les seuls noms d'objets 3D : inspecter les captures. Les deux soldats français portent chacun un fusil en bandoulière clairement reconnaissable, au-devant du gilet, sans capacité de tir ajoutée. Le tireur à la fenêtre possède une arme identifiable : flash lumineux et très léger recul synchronisés **exclusivement** avec les rafales déjà présentes dans la mécanique des cinq fenêtres ; aucun nouveau tir ni blessure. Une capture en vraie vue jumelles pendant un coup de feu est obligatoire. Sur la scène entière, exposition 1,68, palette de post-traitement gris-clair, brouillard moins dense, éclairage supérieur et vignettage du cadre réduit : ne pas transformer l'ambiance de guerre en journée ensoleillée, mais rendre les bâtiments, abris et soldats nettement visibles sur téléphone. Conserver le compagnon invulnérable, les contrôles, scores et continuités précédentes.


## C033 — Graffiti littéraire sur les murs de Bosnie (9 novembre 2026)

Demande exacte de l'auteur : écrire sur les murs existants, comme un graffiti à la bombe de peinture, « Chapitre 2 — « Même pas mal », p 25–26. » La version visible est répartie sur trois lignes pour rester lisible et respecte les majuscules, le tiret cadratin, les guillemets français et le tiret demi-cadratin de pagination. Deux inscriptions sont peintes sur des parties intactes des murets de couverture existants, au début et plus loin dans la traversée. Une texture Canvas transparente 2048 × 512 à bords imparfaits, avec grain de pulvérisation et petites coulures, est partagée entre les deux surfaces 3D : pas de panneau rectangulaire ajouté ni de nouvelle ressource externe. Ne toucher ni aux cinq passages, ni aux dégâts, ni aux personnages, armes ou tirs. Vérifier la lisibilité sur des captures réelles ordinateur et téléphone avant validation.


**Contrôle de taille C033 :** la première vraie capture montrait le graffiti entre les personnages avec une largeur projetée trop petite. Rapprocher l'inscription du point de vue d'entrée en la plaçant sur la partie intacte du premier muret (x = −0,4, à gauche du joueur), et placer la seconde sur un muret intact du troisième tronçon (x = 32,5). Le texte est ainsi lisible sans occuper un bandeau d'interface ni masquer les soldats. Refaire une capture du vrai navigateur.


**Deuxième inspection C033 :** le premier repositionnement à x = −0,4 rendait l'inscription grande sur ordinateur mais coupait presque toute la phrase hors de l'écran mobile. Recentrer la première inscription à x = 3,1 sur le muret pour conserver l'ensemble des trois lignes dans les deux formats. Contrôler aussi la capture mobile et pas seulement la vue grand écran.

### 2026-11-09 — Marmousets : personnages et cheval 2D articulés (v2.1)
- **Principe :** conserver intégralement les 13 étapes, le plateau, les règles, les boutons et les points existants ; remplacer seulement les dessins 2D du mini-jeu Marmousets.
- **Cheval :** nouveau dessin Canvas vectoriel original (corps, encolure, tête, oreilles, queue, quatre membres) avec mouvements distincts marche, cabré, saut et cavalier / descente. Pas de déformation de maillage 3D.
- **Humains :** adultes et enfants vectoriels, visage / cheveux / vêtements / proportions par âge, silhouettes complètes, personnages variés et animations de course.
- **Licence :** ressources originales créées pour le jeu, sans reprendre ni publier les feuilles de sprites d'Onfe ou de tiers sur ce dépôt public.
- **Tests :** images indépendantes, gestes, changements de direction, saut et cabré, rattachement au mini-jeu, pipeline de déploiement. Vérification visuelle des silhouettes de face / profil, membres et contact avec le sol avant publication.

### 2026-11-09 — Marmousets : inscription du chapitre dans le ciel
- **Texte exact :** « Chapitre 1 — « La salle d’attente », p 17–19. »
- **Mise en scène :** une écriture d'écolier (police Schoolbell avec secours cursif) dessinée directement en haut du ciel, centrée et dotée d'un léger contour clair pour le contraste, sans toucher aux obstacles, personnages ni score.
- **Technique :** chargement de Schoolbell via Google Fonts, puis dessin Canvas renouvelé après chargement de la fonte ; largeur mesurée pour tenir dans la scène 960×540 et dans le cadrage mobile.
- **Contrôle :** test de non-régression du libellé, de l'ordre de dessin et de l'intégration des gestes précédents.

### 2026-11-09 — Marmousets : bandeau de localisation en bas
- Déplacer « FERNEY → PRÉVESSIN » du haut vers le bas gauche de l'image, en dehors de l'inscription scolaire dans le ciel.
- Sur petits écrans, préserver une marge de 8 px. Le bandeau reste masqué uniquement pendant la victoire, comme auparavant.
- Aucun changement au gameplay, aux points, au cheval ni aux autres scènes.

### 2026-11-09 — Marmousets : cavalier vraiment à califourchon, vu de profil
- En vue de profil sur le cheval, **une seule jambe** de l'enfant est dessinée du côté visible. La seconde reste entièrement masquée de l'autre côté du cheval.
- Supprimer le second contour de jambe et la seconde chaussure dans le bloc `mounted>0` de `marmousets-art-v2.js` ; ne pas modifier les quatre jambes du cheval.
- Conserver les animations de montée, cabré, saut, descente, les personnages à pied et le score. Vérifier avec un test ciblé la silhouette montée.

### 2026-11-09 — Marmousets : deux jambes à terre / une jambe pleine en selle
- **Erreur corrigée :** l'ancienne jambe unique du cavalier était un simple contour (`fill=null`) et apparaissait même lors des premières images où l'enfant était encore à terre.
- **Nouvelle règle d'animation :** immobile à terre et au début de la montée (`mount<=0.32`) : un personnage entier avec **deux jambes et deux chaussures** ; lorsque l'enfant est sur le cheval : **une seule jambe du côté visible** et une seule botte, toutes deux avec remplissage opaque. Après la descente, dessin complet à deux jambes.
- **Tests graphiques :** contrôle des poses au sol, au début / à la fin de la montée, à la marche, au cabré, au saut et à la descente. Test automatisé des contours fermés, du remplissage du pantalon, de la botte et du nombre de jambes selon la pose.
- **Portée :** dessin seul ; aucune modification des parcours, des commandes, des points, des cartes ou du chapitre.

### 2026-11-09 — Marmousets : courte marche d'approche et montée accélérée
- Au lancement, l'enfant reste **à pied avec ses deux jambes**, marche pendant **1,05 s** de 62 unités visuelles jusqu'au cheval, puis monte sur la selle.
- La montée, auparavant de **1,25 s**, dure désormais **0,45 s** (environ 2,8 fois plus rapide). La phase de transition ne modifie pas le parcours du cheval, le score, les obstacles ni les points de sauvegarde.
- Pendant la marche, les deux jambes sont animées ; sur le cheval, une seule jambe pleine et sa chaussure restent visibles de profil.
- Le bouton pause, l'accessibilité et la musique préservent l'état « approaching » pour éviter toute apparition prématurée du cavalier sur la selle.
- Contrôler les états ready → approaching → mounting → running, le temps de chacun, la conservation des points, puis toutes les poses (cabré, saut, descente).

### 2026-11-09 — Lycée A410 : personnages lisibles, nature et autoroute en pixel art
- **Style :** conserver le Canvas basse définition 384 × 216 et son rendu pixelisé. Dessins originaux sans sprites tiers redistribués ; l'ancienne scène reste en `legacyDraw` / `legacyRunner` pour retour arrière si nécessaire.
- **Personnages :** agrandir et différencier le narrateur (veste terracotta, baladeur et casque), le directeur (costume sombre) et le responsable de cycle (chemise claire), avec deux jambes animées, bras, visages, nez, yeux et cheveux distincts.
- **Nature :** lycée au toit de tuiles, fenêtres, entrée, fleurs, parterres, clôture et range-vélos ; montagne de Haute-Savoie, sapins et arbres feuillus à plusieurs profondeurs, buissons, herbes et fleurs.
- **Transition :** départ dans la cour arborée, chemin plus boisé, disparition graduelle des haies au profit des glissières et signalétique de l'A410 ; biome piloté uniquement par la distance (0–400).
- **Invariants :** ne modifier ni `newRun`, ni `advance`, ni `FINISH`, ni le chronométrage, les dialogues/voix, les boutons, le score, les bonus ou la communication avec le plateau.
- **Tests :** respect des quatre décors, des trois personnages, des repères « LYCÉE » et « A410 », moteur intact, fichier public inclus au build.

### 2026-11-09 — A410 : trois panneaux du chapitre regroupés au milieu
- Texte intégral et identique sur les trois panneaux : **« Chapitre 1 — « La salle d’attente », pages 7–9 »**. Le texte est coupé en quatre lignes pour rester lisible en pixels, ponctuation préservée.
- Trois panneaux de dimensions différentes (**60×38, 72×46, 84×54 pixels**) mais proches les uns des autres, visibles ensemble aux alentours de **205 m sur les 400 m** de course.
- Intégration au décor de route, avec deux poteaux, bordure ivoire et bleu routier, avant les personnages pour conserver leur lisibilité.
- Défilement uniquement selon `distance`, sans modifier le gameplay. Tests de regroupement au milieu, dimensions, non-chevauchement, texte exact et absence au départ / à l'arrivée.

### 2026-11-09 — A410 : ne garder que le dernier panneau du chapitre
- À la demande de l'auteur, supprimer les deux premiers panneaux routiers du groupe et **ne conserver que le troisième**, le plus grand (84×54 pixels), à sa place au milieu du chemin (autour de 205 m).
- Conserver son inscription « Chapitre 1 — « La salle d’attente », pages 7–9 » et les mêmes couleurs, poteaux, position et défilement.
- Ne pas toucher aux autres panneaux (notamment le panneau A410), aux personnages, au paysage ni au gameplay.
- Test de non-régression : un seul panneau chapitre, aux dimensions et coordonnées précédentes, absent au début et à la fin du parcours.

### 2026-11-09 — Catalogne : grand parc 2D à allées multiples et foule
- Rendu 2D **en perspective trois-quarts**, plus vaste et moins linéaire que l’ancien couloir, avec trois grandes allées reliées par des cheminements transversaux, des jardins fleuris, plusieurs fontaines, arbres de hauteurs différentes, palmiers, bancs, réverbères et oiseaux.
- Ajout d’une véritable latitude de déplacement (`run.lane`, −112 à +112) par boutons tactiles ▲/▼ et flèches du clavier, sans modifier le parcours horizontal ni la mécanique des cinq ventes (+2 par client, +10 maximum).
- Clients situés sur plusieurs allées ; contrôle de proximité en X **et** en profondeur. La hauteur du saut `run.y` reste distincte de l’allée `run.lane`.
- Quatre policiers possèdent une patrouille et peuvent poursuivre le narrateur sur les deux axes lorsqu’il approche ; l’interpellation exige désormais proximité en X et en profondeur, ou le saut permet d’échapper à leur contact.
- Personnages modernes pixelisés originaux (corps plus lisibles, deux jambes, bottes, visages, costumes différenciés) et environ 16 groupes plus 30 personnes seules, avec profondeur et superposition cohérente.
- Ressources **CC0** réellement intégrées : Kenney Tiny Town pour textures de feuillage, Pixel-Boy & AAA Ninja Adventure pour quelques figurants spéciaux. Source et licence détaillées dans `CATALOGNE_ASSETS_CC0.md`.
- Conservation de la précédente mise en scène dans `ParkScene.legacyDraw` pour retour arrière ; changement de l’affichage principal uniquement.
- Ne jamais modifier `score`, `catalogne:sale`, `catalogne:credited`, l’identité des cinq clients, les voix et musiques déjà en place. Tests structurels, déplacement, police, ressources et intégrité de l’arcade.

### 2026-11-09 — Catalogne : aire de jeu plus lisible et difficulté réduite
- Affichage : la borne et le jeu prennent désormais **toute la largeur disponible**, le panneau de score passant en dessous, avec une largeur maximale de **1 280 px**. Le format de l’image reste 16:9 (pas de déformation des personnages).
- Bouton facultatif **« ⛶ AGRANDIR »** : plein écran englobant la zone de jeu et ses commandes, avec mode de repli sans l’API plein écran ; le mobile conserve sa mise en page adaptative.
- Police : **2 patrouilles espacées** (positions x=560 et 1 490, allées −85 et +75) au lieu des quatre ; vitesse de poursuite réduite (64 sur X, 45 entre les allées), détection réduite. Les policiers restent mobiles et peuvent toujours intercepter.
- Caméra : davantage de visibilité devant le joueur (décalage 255 px à droite, 435 px lorsqu’il retourne à gauche), sans réduire la taille des personnages ni changer les limites du monde.
- Invariants : conserver les cinq clients, l’accès aux allées, les interactions, les musiques, la question, les ventes +2, les sauvegardes et les messages vers le plateau.
- Tests : police et positionnement, compatibilité des objectifs, plein écran et commandes, construction publique, autres mini-jeux.

### 2026-11-09 — Barcelone : pelouse, panneaux clients et patrouilles aller-retour
- Sur la pelouse du parc, inscrire en blanc exactement « chapitre 1 — « La salle d’attente », p 9-10 », réparti en trois lignes, avec une petite ombre contrastante et une position fixe dans le monde.
- Agrandir le panneau client de 34×21 à 48×28 px, le losange et la mention « CLIENT » ; conserver les cinq ventes et le score (+2 points chacune).
- Ajouter un panneau permanent « GUARDIA CIVIL » au-dessus de chacun des deux policiers, distinct des indications « CLIENT ».
- Les policiers ne poursuivent plus le joueur. Chacun patrouille horizontalement à vitesse constante (52 unités/s), fait demi-tour à ±120 unités de son poste et reste dans son allée.
- Une interpellation reste possible uniquement en cas de contact sur la même allée quand le personnage ne saute pas. Orientation des silhouettes et avertissements liés à la position actuelle des patrouilles.
- Les scripts de musique et les messages « catalogne:sale » / « catalogne:credited » ainsi que les points déjà obtenus sont préservés. Ajouter des tests de non-régression sur le mouvement, les panneaux et les objectifs.
