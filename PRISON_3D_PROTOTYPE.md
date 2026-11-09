# Prototype jouable — « Un fil entre les barreaux » entièrement en 3D

**Statut :** prototype isolé — le jeu de prison actuellement publié n'est ni supprimé ni remplacé.

## Démonstration
- Ouvrir la page prison-3d.html après construction.
- La scène est rendue en Three.js/WebGL avec un corps humanoïde Quaternius riggé (pas de main 2D).
- Deux vues : par-dessus l'épaule et latérale.
- Cellule d'environ 9 m², deux lits superposés avec matelas, table, tabouret, armoire, toilettes, lavabo, miroir, fenêtre et sept barreaux, brosse 3D, cintre, corde et sacs.
- Le bâtiment d'en face gagne de la couleur pendant la récupération des objets.

## Règles conservées
Le pilote importe les règles originales directement depuis yoyo-core.js, sans modifier ce fichier.
1. **Trouver la brosse** (10 points) : viser le manche et appuyer sur Attraper.
2. **Récupérer le tabac** (10 points) : crocheter la corde et passer le sac par un espace libre.
3. **Récupérer le café** (10 points) : recommencer ; le métal bloque physiquement les sacs dans le calcul.
Les pas du surveillant obligent à se cacher ; les commandes fonctionnent au clavier, à la souris et au tactile.
Le score du prototype reste local à la session, sans aucune récompense accordée au plateau.

## Modèle humanoïde réellement intégré
**Quaternius — Universal Base Characters, Superhero Male, pack Standard**
- https://quaternius.com/packs/universalbasecharacters.html
- Fichier déjà présent dans le dépôt : danse-quaternius-hero.glb
- Notice actuelle : danse-quaternius-LICENSE.txt
- Licence : Creative Commons Zero (CC0 1.0 Universal)
- Vraie géométrie skinnée et vrai squelette humanoïde ; coloration de la tenue sans modifier le modèle d'origine.
- Bibliothèque d'animations compatible : https://quaternius.com/packs/universalanimationlibrary.html — CC0, à intégrer après la phase de validation du pilote.

## Mobilier et environnement
Le décor, les murs, les lits, les barreaux, la plomberie, la brosse, les sacs et la corde sont construits par notre code en vrais maillages 3D avec matériaux 3D. Ce sont des géométries originales ; ce ne sont ni des images plates ni des modèles externes sous licence inconnue.

### Ressources CC0 déjà vérifiées pour la prochaine itération
- **Kenney Furniture Kit** : https://kenney.nl/assets/furniture-kit — CC0, 140 éléments, dont lits, tables et sanitaires.
- **Quaternius Modular Dungeons Pack** : https://quaternius.com/packs/modulardungeon.html — CC0, éléments modulaires.
- **Poly Haven** : https://polyhaven.com/ — textures PBR, HDRI et modèles sous CC0.
- **Kenney Prototype Kit** : https://kenney.nl/assets/prototype-kit — CC0, éléments de construction.
Ces packs ne sont pas encore importés : le prototype utilise le mobilier généré par notre code afin d'éviter tout faux crédit et toute dépendance cachée.

## Conditions de validation avant remplacement du jeu publié
1. Corps complet chargé et correctement animé, sans pose en T pendant le jeu.
2. Cellule crédible de 9 m², proportions correctes du lit, lavabo, barreaux et table.
3. Brosse tenue et manipulée sans disparaître dans les doigts.
4. Sac, corde et cintre visibles, aucune traversée des barres métalliques.
5. Trois épreuves réellement jouables sur ordinateur et Android ; maintien du bouton Attraper et cacher sous la surveillance.
6. Le jeu classique reste inchangé et tous ses tests passent.

## Fichiers
- prison-3d.html : prototype jouable.
- prison-3d-scene.js : décor, corps animé et caméra.
- prison-3d-app.js : commandes et règles du jeu.
- build-prison-3d.mjs : assemblage du runtime.
- prison-3d.test.mjs : vérifications.
