# Refonte du jeu de prison — prototype 3D isolé (v0.2)

## Objectif
Ne pas remplacer le jeu officiel avant la validation du prototype.
Conserver les mêmes étapes : 1. saisir la brosse, 2. récupérer le tabac,
3. récupérer le café. Une véritable ouverture entre deux barreaux permet
de faire passer le sac ; les fers doivent arrêter le sac. Le surveillant
revient et le prisonnier peut se cacher. Score : 3 × 10 = 30.

## Fichiers
- prison-3d-prototype.html : prévisualisation jouable autonome ;
- prison-3d-prototype-app.js : maquette 3D, acteur, mobilier et commandes ;
- build-prison-3d-prototype.mjs : compilation de Three.js ;
- prison-3d-prototype-runtime.js : code généré pendant le build ;
- prison-3d-prototype.test.mjs : vérifications du corps, décor et règles.
- prison-3d-loader.js : téléchargement interrompable et contrôle du modèle complet ;
- prison-3d-loading.test.mjs : démarrage, progression, erreurs et relance ;
- prison-3d-visibility.test.mjs : visibilité de la scène en portrait et paysage.

## Correction du chargement — 9 novembre 2026
Le bouton affichait encore « Chargement du personnage 3D… » après réussite.
La porte fermée, restée devant la caméra extérieure, masquait aussi le centre
de la cellule : environ 23 % des rayons en paysage et 46 % en portrait.
La paroi avant est désormais traitée entièrement en coupe (porte, guichet
et poignée compris) lorsque la caméra est dehors. La porte conserve sa
position fermée et reste visible depuis une caméra située dans la cellule.

Le bouton « Entrer dans la cellule » n'est activé qu'après le chargement
du corps et une première image rendue. L'écran de préparation est indépendant
du programme 3D : script manquant, fichier GLB incomplet, délai dépassé ou
perte du contexte graphique donnent un message et « Réessayer le chargement ».
Le téléchargement du corps est interrompu au bout de 30 secondes ; le démarrage
complet dispose de 45 secondes. Le profil mobile limite la résolution à 1×,
désactive l'anticrénelage et les ombres dynamiques pour alléger la mémoire GPU.

Vérification : transfert et analyse du véritable GLB, états de chargement
et erreurs, géométrie et lignes de vue avec Three.js en portrait/paysage,
puis construction publique. Le navigateur cloud disponible ne fournit pas
de contexte WebGL : il permet de contrôler la page et sa reprise après erreur,
mais pas de valider le rendu animé sur le téléphone de l'auteur.

Le prototype ne remplace pas jeu-yoyo.html et ne touche ni aux points,
ni aux données de progression, ni aux messages de crédit du jeu officiel.

## Scénographie
- Cellule 3 × 3 mètres (9 m²), murs, plafond, porte ;
- lits superposés avec cadre, matelas, couverture et échelle ;
- table, tabouret, armoire, quelques affaires ;
- WC, réservoir et lavabo en relief ;
- vraie ouverture de fenêtre avec sept barreaux ;
- corde de drap, cintre, sac plastique translucide et brosse ;
- caméra à l'épaule : le personnage, les bras et les objets sont en volume ;
- lumière de fenêtre, ombres et changement discret de lumière au fil du récit.

## Actifs et licences
- [Quaternius Universal Base Characters](https://quaternius.com/packs/universalbasecharacters.html) : CC0, intégré dans v0.1 via le modèle masculin déjà présent dans le dépôt.
- [Quaternius Universal Animation Library](https://quaternius.com/packs/universalanimationlibrary.html) : CC0, amélioration à envisager ; pas encore intégrée.
- [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit) : CC0, source proposée pour un futur mobilier plus détaillé ; pas encore téléchargée.
- [Quaternius Modular Dungeons](https://quaternius.com/packs/modulardungeon.html) : CC0, source possible pour les murs modulaires ; pas encore téléchargée.
- [Poly Haven](https://polyhaven.com/license) : CC0, source possible de textures de béton et métal ; pas encore intégrée.

Le mobilier de v0.1 est modélisé en Three.js ; il ne serait pas exact de le
présenter comme des modèles Kenney déjà téléchargés.

## Interactions
Flèches gauche et droite (ou A/D) pour se déplacer, flèche basse (ou S)
pour se cacher, Espace ou maintien du bouton Saisir pour attraper et tirer.
Le squelette Quaternius fournit une anatomie articulée ; épaules, coudes,
colonne, hanches, genoux et tête sont réellement animés. La brosse est
rattachée à l'avant-bras articulé, pas à un sprite fixe. Le gameplay,
les points, les fenêtres entre les barreaux et le surveillant viennent
directement du moteur yoyo-core.js, sans duplication de règles.

## Prochaines validations avant tout remplacement
1. Examiner le rendu dans un vrai navigateur sur mobile et ordinateur.
2. Corriger l'orientation des paumes et la prise anatomique du manche,
   et empêcher toute pénétration d'un objet à travers un barreau.
3. Importer les accessoires CC0 documentés, améliorer les matériaux PBR.
4. Vérifier la stabilité et les performances sur Android, avec résolution
   et ombres adaptatives et sans fuite mémoire.
5. Essayer les trois épreuves, la pose accroupie et les avertissements.
6. Ne remplacer le jeu actuel qu'après validation des gestes et de la scène.

## Invariants
Aucune modification des points du jeu actuel, des scènes de lecture,
des autres mini-jeux, des fichiers historiques du manuscrit et du plateau.
