# Prison — étude de refonte entièrement en 3D (prototype CC0)

**État :** version autonome expérimentale. `prison-3d-lab.html` et `prison-3d-lab.js` ; jeu public de référence `jeu-yoyo.html` **inchangé dans son fonctionnement et ses scores**.

## Objectif narratif et contraintes

Conserver trois gestes et leur valeur symbolique : trouver la brosse, saisir la corde et récupérer un premier sac de tabac, puis un second de café. La cellule française est représentée comme un volume d'environ 9 m² avec **deux lits superposés**, une table, un tabouret, une armoire, un WC, un lavabo, une porte métallique avec trappe et une fenêtre munie de sept barreaux. Un bâtiment en face, la fenêtre d'un voisin et le « yo-yo » complètent la composition. L'agencement est une interprétation de jeu, pas une restitution dimensionnelle attestée.

## Ressource de personnage réellement intégrée

**Quaternius Universal Base Characters, Superhero Male** — personnage déjà présent dans le dépôt sous `danse-quaternius-hero.glb` ; **CC0 1.0**, licence et origine documentées par `danse-quaternius-LICENSE.txt`.
Source officielle : https://quaternius.com/packs/universalbasecharacters.html

L'étude charge ce vrai maillage humain avec **GLTFLoader** et anime ses os **upperarm_r**, **lowerarm_r**, **upperarm_l**, **lowerarm_l**, **Head**, **spine_02**. Une brosse 3D est attachée à l'os de la main droite si disponible. Il n'y a **aucune image 2D de main ou de bras** dans ce prototype.

## Décor déjà construit

La géométrie est originale et construite en Three.js : murs épais, ouverture de fenêtre réellement vide, barreaux en cylindres 3D, sommier et matelas à chaque couchette, textiles, table et pieds, armoire, porte et judas, sanitaires, voisin silhouetté et vrai sac pendu à un cintre sur une corde. Une caméra à deux positions montre la cellule en surplomb de l'épaule ou le geste à la fenêtre.

Le gameplay réutilise **`yoyo-core.js`** (donc les espaces entre barreaux, le surveillant, les 3 objectifs et le barème de 10 points par geste). Les points du prototype restent locaux : aucun événement n'est transmis pour créditer le compte joueur du site principal.

## Bibliothèques gratuites complémentaires, à intégrer à une future itération

- **Kenney Furniture Kit**, 140 modèles d'intérieur dont des lits, chaises et tables ; licence CC0. https://kenney.nl/assets/furniture-kit — *sources repérées, non importées dans cette version ; les objets présents sont des maillages originaux*.
- **Quaternius Universal Animation Library**, 120+ animations retargetables sur humanoïdes (se pencher, s'accroupir, marcher, etc.), licence CC0 : https://quaternius.com/packs/universalanimationlibrary.html — *source repérée, pas encore intégrée*. Le mouvement actuel utilise les os du personnage, sans animation téléchargée.
- **Poly Haven**, matériaux PBR et modèles CC0 pour le béton, le carrelage, le métal et les tissus : https://polyhaven.com/license — *source repérée, pas encore intégrée*.
- **Quaternius Modular Dungeons Pack**, 48 modules CC0 : https://quaternius.com/packs/modulardungeon.html. Adapter avec prudence leur vocabulaire médiéval ; ne pas présenter des barreaux de donjon comme une reproduction de prison contemporaine.

## Validation nécessaire avant remplacement du jeu officiel

1. Vérifier visuellement sur Android et ordinateur le corps entier et sa posture, sans membres tordus ni mains inversées.
2. Fixer une animation de préhension et de traction en **IK à deux os** ; conserver les cinq doigts réels du modèle et raccorder la position de la brosse à la paume.
3. Tester les collisions du sac et du bras avec les ouvertures réelles de 21 cm, et régler l'écart entre le modèle visuel et les positions normalisées du moteur.
4. Revoir l'éclairage, l'échelle humaine, les angles caméra et l'accessibilité des commandes tactiles.
5. Réduire les draw calls, plafonner le ratio de pixels mobile et préférer des matériaux PBR compressés avant d'enrichir le décor.
6. Garder l'original `jeu-yoyo.html` comme mode de repli jusqu'à validation de la v2, sans modifier ses récompenses ni les sauvegardes.

Les éléments 3D créés dans `prison-3d-world.js` sont originaux à ce projet. La réutilisation de l'humanoïde Quaternius est couverte par son fichier de licence CC0 existant.
