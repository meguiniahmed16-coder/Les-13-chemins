# Film de présentation — La Croisée des Âmes

Les personnages, poses, tenues, ailes et décors proviennent de l’application. `prepare.mjs` et `render.py` produisent les plans ; `cards.py` compose les cartons typographiques ; `compose.mjs` assemble les médias et incruste les sous-titres.

## Exporter et rendre les scènes originales

Le GLB privé d’Ahmed est fourni séparément. Son empreinte SHA-256 est contrôlée contre celle du modèle utilisé par l’application ; le script ne le télécharge pas et ne le copie pas dans le dépôt. La tête de Marianne, les vêtements, le dojo, les poses et les ailes sont lus dans les ressources et fonctions de production.

```sh
node cinematics/promotion/prepare.mjs /chemin/promotion-output --ahmed /chemin/Ahmed-original-deployed.glb
```

L’export écrit les positions réellement déformées, les textures originales et leurs couleurs finales, les caméras, ainsi que 13 secondes des 76 papillons du jardin. `--preview` limite l’export à un témoin par plan. Le dojo utilise une ancienne déclaration de matériau : le script traduit sa couleur diffuse et sa rugosité vers le format accepté par le lecteur, en conservant ses images et triangles.

```sh
blender -b -t 8 --python cinematics/promotion/render.py -- /chemin/promotion-output --shot duo --samples 16
blender -b -t 8 --python cinematics/promotion/render.py -- /chemin/promotion-output --shot walk --samples 16
blender -b -t 8 --python cinematics/promotion/render.py -- /chemin/promotion-output --shot turn --samples 16
blender -b -t 8 --python cinematics/promotion/render.py -- /chemin/promotion-output --shot wardrobe --samples 16
blender -b -t 8 --python cinematics/promotion/render.py -- /chemin/promotion-output --shot finale --samples 16 --garden-directory /chemin/garden-footage
```

Le décor préparé du jardin contient `scene.json` et son répertoire `textures/`. Il provient des scripts existants de `cinematics/intro/`. `--frame 239` rend une image particulière ; `--frame-start 0 --frame-end 120` rend une plage dont la borne finale est exclusive. Des plages disjointes peuvent être calculées en parallèle. `--resume` convient uniquement à une reprise avec les mêmes sources et réglages ; il faut recalculer les témoins après un changement d’éclairage.

Le rendu CPU utilise un éclairage direct et 16 échantillons ; le débruitage intégré n’est pas requis. Le montage applique ensuite un filtre léger aux seuls plans Blender. Ne pas versionner le GLB privé, les textures extraites, les poses binaires, les PNG de rendu ou le MP4 dans ce dossier de scripts.

## Préparer les cartons et le montage

Le texte est importé directement depuis `PROMOTION` dans `membres/intro-arrival.js`. Il n’est pas nécessaire de recopier le site, l’adresse de contact ou la phrase d’Ahmed.

```sh
node cinematics/promotion/compose.mjs /chemin/promotion-output --cards-only
```

Cette commande écrit les deux cartons dans `cards/`, les sous-titres ASS/SRT et le plan de montage dans `provenance/montage.json`.

Pendant le calcul des images Blender, préparer aussi les séquences existantes :

```sh
node cinematics/promotion/compose.mjs /chemin/promotion-output --prepare --archive=/chemin/verification
```

Le répertoire d’archives doit contenir :

- `salon-footage/salon-v27-8s.mp4` ;
- `dice-footage/intro-des-plateau.mp4` ;
- `garden-footage/garden-6s.mp4`.

## Produire le MP4

Quand les images sont toutes présentes, lancer :

```sh
node cinematics/promotion/compose.mjs /chemin/promotion-output --archive=/chemin/verification
```

Les séries attendues commencent à `0000.png`, à 20 images par seconde, dans `rendered/` :

L’option `--wait` permet de lancer la composition pendant le rendu. Elle attend les 660 PNG complets (marqueur PNG `IEND`) et `PROMOTION_RENDER_COMPLETE` dans les six journaux `render-duo.log`, `render-walk.log`, `render-turn.log`, `render-wardrobe.log`, `render-finale-first.log` et `render-finale.log`. Un témoin déjà présent ne peut ainsi déclencher prématurément le montage. L’attente s’arrête après deux heures si un lot n’est pas terminé.

| Plan | Durée | Dernière image |
|---|---:|---:|
| `duo` | 4 s | `0079.png` |
| `walk` | 5 s | `0099.png` |
| `turn` | 4 s | `0079.png` |
| `wardrobe` | 8 s | `0159.png` |
| `finale` | 12 s | `0239.png` |

Le script refuse un lot incomplet. Le résultat est `La-Croisee-des-Ames-promotion.mp4` : H.264, 960 × 540, 20 i/s, silencieux, sous-titres incrustés, durée prévue de 50,75 s. Les fondus croisés durent 250 ms. La phrase d’Ahmed suit les secondes 1,8–8,1 de la finale ; « Mode ange » apparaît aux secondes 5–7.

Les plans Blender reçoivent le filtre léger `nlmeans=s=3:p=5:pc=5:r=9:rc=9` avant compression. Les cartons, textes et trois vidéos préexistantes ne sont pas débruités.

La vérification finale contrôle dimensions, durée et absence de piste audio, puis extrait quatre témoins dans `proof/`. Les attributions figurent dans les métadonnées `comment` du MP4 et dans `provenance/credits.txt`. La provenance conserve les empreintes des modèles originaux sans publier le chemin du GLB privé.

## Dépendances

Node avec les dépendances du dépôt, Python 3 avec Pillow et NumPy, FFmpeg avec `libx264` et `libass`, et les polices système P052/DejaVu Sans. Le dossier de rendu est fourni comme argument ; `PROMOTION_ARCHIVE` peut remplacer l’option `--archive=`.
