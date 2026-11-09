# Cellule immersive — jeu officiel v0.5

## Version officielle v0.5

La cellule en vue subjective remplace désormais l’ancien jeu sur **`jeu-yoyo.html`**.
Le plateau ouvre directement cette page ; il ne propose plus une seconde version
immersive en dessous. L’ancienne adresse `prison-3d-prototype.html` redirige vers
la même cellule en conservant les paramètres et l’ancre. L’ancien HTML est conservé
pour historique dans `archive/jeu-yoyo-v10.html`, hors de la publication.

Le pouce se replie maintenant vers la paume et contre l’index. Son axe de flexion
et sa cible d’opposition ont été corrigés sans modifier la paume, les quatre autres
doigts, le point d’attache ou les dimensions de la prise. Un test anatomique contrôle
le sens de la dernière phalange sur un manche vertical et incliné, en complément
du contrôle de contact sur les triangles du vrai maillage.

Le module `prison-3d-session.js` raccorde les trois épreuves au protocole existant
du plateau : chargement prêt, initialisation de session, victoire de 30 points,
confirmation et nouvelle session pour rejouer. Seul le parent de même origine
peut initialiser la partie et seul `plateaux-core.js` crédite la sauvegarde.
Le premier succès donne 30 points ; un doublon ou une nouvelle partie ne donne
aucun crédit supplémentaire. Le bouton « Continuer le voyage » revient au plateau.
L’accès direct reste jouable sans modifier une progression de parcours.

## Ajustements de confort v0.4 conservés

Le manche est placé sous les têtes des métacarpiens pour que les quatre doigts
l'entourent. Chaque doigt dispose d'une fermeture adaptée à sa longueur ; le pouce
se referme contre l’index autour du manche. Les dimensions de la main et du manche restent
identiques. Les contacts sont vérifiés sur les triangles réellement déformés du GLB.

Pour récupérer les sacs, il suffit maintenant de **maintenir Saisir** à la fenêtre.
L'assistance suit le fil visible, accroche automatiquement et garde l'axe de l'ouverture
pendant le tirage. Le fil se balance doucement de 1,2 cm à l'intérieur de cette ouverture,
quelle que soit la proportion de l'écran. Le tirage dure deux secondes, contre environ
5,3 secondes auparavant. Relâcher ou se cacher suspend le geste ; maintenir de nouveau
reprend le même sac. Le test de partie complète réalise chaque récupération en moins
de 3,5 secondes hors cachette, depuis le centre et sans anticipation du mouvement du fil.

Le premier passage du surveillant intervient après 28 secondes de jeu actif. Après
chaque étape, le joueur dispose également de 28 secondes de répit. Les pas avertissent
pendant quatre secondes ; le joueur dispose encore de deux secondes de réaction quand
le surveillant regarde. Après son départ, le calme dure 32 secondes avant l'approche suivante.

Ces valeurs sont explicites dans `prison-3d-balance.js`. Le moteur partagé accepte cette
configuration optionnelle ; le jeu de yo-yo précédent continue d'utiliser ses réglages
historiques. Les points et les règles géométriques de passage restent les mêmes.

## Vue immersive et visite

La caméra se trouve désormais **dans la cellule, à la hauteur des yeux du prisonnier**.
Une visite de neuf secondes présente les lits, le coin lavabo, la porte fermée et
la fenêtre. « Passer la visite » conduit au même point de départ que la visite complète.
Pendant le jeu, seuls les vrais bras et les mains articulées sont rendus.
Le regard accompagne le geste vers la brosse ou le fil, puis reste dans cette direction.

L'interface tactile utilise un joystick analogique à gauche et deux boutons maintenus
à droite : « Saisir / tirer » et « Se cacher ». Glisser sur la scène oriente le regard.
Plusieurs doigts peuvent déplacer le personnage, orienter la vue et saisir simultanément.
Le plein écran et la pause sont accessibles. Au clavier : ZQSD / WASD / flèches,
Espace pour saisir, C ou Ctrl pour se cacher, P pour suspendre et reprendre.

## Rendu et décor

L'ancien réglage mobile de v0.2 (résolution 1× et anticrénelage désactivé) a été retiré.
L'anticrénelage est actif sur tous les appareils. Le rendu utilise jusqu'à 2× la résolution
CSS, dans un budget de 3,2 millions de pixels pour les écrans haute densité.
Les textures de plâtre, bois et tissu sont filtrées avec mipmaps et anisotropie.
Les ombres du décor utilisent une carte 2048² cadrée sur la petite pièce, recalculée
au chargement et à la prise de la brosse, plutôt que chaque image.

La pièce mesure 3 × 3 m, avec quatre murs complets, un plafond et une **porte toujours
fermée**. La vue en coupe de v0.2 n'est plus utilisée. Le mobilier comprend les lits
superposés et leur échelle, une table, un tabouret, une armoire, des affaires, un WC,
un lavabo et un miroir. Les matelas et arêtes sont arrondis ; les sanitaires utilisent
des profils lisses avec de vrais creux. La fenêtre donne sur une cour en volume.

Le tabouret est un modèle texturé effectivement importé de Poly Haven. Le reste du
mobilier est construit pour cette pièce en Three.js. Les sanitaires du pack Kenney ont
été examinés mais ne sont pas inclus : leurs silhouettes stylisées ne répondaient pas
à la correction visuelle recherchée.

## Bras et prise du manche

Le GLB Quaternius existant fournit le squelette et la géométrie réels. Le maillage visible
est filtré par les poids des os : bras et mains uniquement, sans tête ni torse à travers
la caméra. Les bras conservent les longueurs d'origine, avec résolution des deux segments
épaule–coude et coude–poignet. Chaque doigt se ferme et le pouce s'oppose autour du manche.
L'axe du manche oriente la paume ; le point d'attache se trouve au centre de la prise,
et non sur l'avant-bras. Le manche reste à la même échelle et ne glisse pas dans la main
fermée pendant le transfert. La brosse initiale est à portée depuis le point de départ.

La caméra tourne vers l'objet avant la prise. Après la brosse, le personnage rejoint
la fenêtre par l'allée centrale. Les collisions utilisent les emprises réelles du lit,
de l'échelle, du tabouret, de l'armoire, de la table et des sanitaires.

## Épreuves conservées

Les règles proviennent toujours de `yoyo-core.js` : saisir la brosse, récupérer le tabac,
puis le café ; surveillant et possibilité de se cacher ; total de 30 points.
Le sac de 116 mm passe dans les 174 mm libres entre deux barreaux de 36 mm de diamètre,
espacés de 210 mm. La progression du tirage est bloquée hors d'une ouverture. L'assistance
conserve l'axe du sac dans son ouverture après l'accroche, même si le joueur déplace la caméra.
Le cintre est présenté de profil et la tête de brosse tournée pour présenter son épaisseur.

La réussite est transmise au plateau par la session courante et termine le jeu 3/3
du chemin II, consacré au chapitre 4 « Le drapeau rouge ». Ce chemin regroupe
Sarajevo (chapitre 2), le danseur (chapitre 3) et la prison (chapitre 4). Le jeu ne lit ni n’écrit directement les sauvegardes de progression.

## Ressources et licences

- Bras : [Quaternius — Universal Base Characters](https://quaternius.com/packs/universalbasecharacters.html), CC0 ; `danse-quaternius-hero.glb` et sa licence existante.
- Tabouret : [Metal Stool 02](https://polyhaven.com/a/metal_stool_02), Ulan Cabanilla / Poly Haven, [CC0](https://polyhaven.com/license).
- Modèle livré : `assets/prison/metal-stool-02.glb`, 1 100 864 octets, textures 1024² intégrées, 6 532 triangles. Les fichiers source ont été contrôlés avec les empreintes de l'API officielle ; les textures ont été recompressées sans changer leur résolution.
- Licence et provenance : `assets/prison/metal-stool-02-LICENSE.txt` et `metal-stool-02.provenance.json`.

Aucun téléchargement de modèle depuis un service tiers n'est requis pendant une partie.
Les modèles sont servis par le même site que le jeu.

## Organisation et vérification

- `prison-3d-prototype-app.js` : orchestration, progression et liaison entre les modules.
- `prison-3d-room.js` : géométrie, éclairage, matériaux et accessoires.
- `prison-3d-camera.js` : visite, vue subjective, regard, déplacement et collisions.
- `prison-3d-arms.js` : géométrie des bras, squelette, préhension et attache du manche.
- `prison-3d-controls.js` : joystick, doigts indépendants, clavier et remise à zéro.
- `prison-3d-session.js` : intégration au plateau, victoire unique, nouvelle session et retour.
- `prison-3d-balance.js` : rythme doux de la cellule, sans modifier les valeurs par défaut du yo-yo.
- `prison-3d-spatial.js` : conversion des ouvertures physiques et collision latérale du sac.
- `prison-3d-loader.js` et le bootstrap HTML : transfert interrompable, modèle complet,
  progression, première image et écran de reprise après erreur.

`npm run test:prison3d` construit le programme et exécute les tests ciblés. Ils analysent
les vrais GLB, les bras déformés, la fermeture des doigts, la caméra portrait/paysage,
les commandes multi-touch, les dimensions des ouvertures et les erreurs de chargement.
Un parcours d'intégration exécute l'application, ses contrôles et ses règles jusqu'à
30/30 par simple maintien, y compris visite, pause, surveillant, brosse, tabac et café.
Il utilise le vrai moteur de progression du plateau pour vérifier les 30 points et
l’ouverture du niveau suivant ; les tests de session couvrent aussi les doublons et replays.
Les durées du surveillant, le tirage en deux secondes et les réglages historiques du
jeu précédent font l'objet de vérifications distinctes. Seuls DOM, renderer
WebGL et parsing des textures du tabouret sont simulés dans ce parcours CPU.

`npm run build` reconstruit et vérifie également les autres jeux avant de copier la
liste fermée des fichiers publics dans `dist/`. La publication reste GitHub → build
et déploiement automatiques ; aucune connexion interactive à Netlify n'est requise.

Des captures Blender de la géométrie et des poses réelles complètent les vérifications
de cadrage. Elles ne remplacent pas un essai WebGL : l'éclairage est approximé et
les textures procédurales ne sont pas reproduites dans ce contrôle. Le navigateur
cloud disponible ne possède pas de contexte WebGL. Le rendu animé, la fluidité et
le confort tactile sur le téléphone de l'auteur restent à apprécier avec le lien publié.
