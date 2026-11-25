# Intégration Hair01 et Bodyparts05 au Salon

## Contenu public

Le dépôt contient les ressources adaptées de **25 coiffures Hair01** et de
**5 barbes ou moustaches Bodyparts05**, téléchargées depuis les archives
officielles CC0 de MakeHuman Community. Les choix existants du Salon sont
conservés ; les nouvelles coiffures commencent à l’indice 12 et les nouvelles
barbes à l’indice 5. Les ressources utilisent des identifiants stables `mh-*`.

Sources officielles :

- https://static.makehumancommunity.org/assets/assetpacks/hair01.html
- https://static.makehumancommunity.org/assets/assetpacks/bodyparts05.html

Les fichiers source volumineux et les portraits individuels ne sont pas
embarqués dans ce paquet public. Les deux archives d’origine restent
identifiables par leur URL, taille et SHA256 dans `source-inventory.json`.

## Build et intégrité

Importer `buildMakehuman` depuis `scripts/build-makehuman.mjs`, puis appeler
`await buildMakehuman(root, output)`. La fonction génère exclusivement les
30 `.bin`, `credits.txt` et `credits.json` dans `output/assets/makehuman/`.
Elle renvoie les nombres de ressources, fichiers et fragments, le volume
total et le SHA256 de l’archive concaténée.

`assets-source/makehuman/assets.json` constitue l’inventaire fermé. Chaque
fragment fait au maximum 600 000 octets, pour permettre sa publication via
l’API du dépôt. Le build vérifie l’inventaire source complet, les tailles et
SHA256 des fragments et des documents de provenance, le hash de l’archive,
les plages contiguës et SHA256 des fichiers publics, les trente identités et
leurs licences dans les catalogues officiels, la structure des modèles et
la présence de tous les auteurs dans les crédits publics. Tous ces contrôles
précèdent la création du dossier de sortie. Un fichier public supplémentaire
déjà présent dans ce dossier provoque également un refus du build.

Test ciblé :

```sh
node --test assets-source/makehuman/verify.test.mjs
```

Il vérifie l’extraction complète, puis le refus d’un fragment corrompu, d’un
fichier source non répertorié et d’une déclaration de licence altérée. Aucune
des variantes rejetées ne doit créer de sortie publique.

Pour actualiser ce paquet à partir d’un nouveau dossier de préparation
validé ayant la même structure, utiliser :

```sh
node assets-source/makehuman/package.mjs /chemin/vers/makehuman-integration
```

## Contrat du format natif

Chaque `.bin` est un flux gzip contenant un en-tête JSON avec sa longueur sur
32 bits little-endian, puis les tableaux typés alignés. Les positions sont
des `Int16` en unités de 0,0001 mètre ; les normales sont des `Int8` divisés
par 127. Les UV sont des `Uint16` divisés par 65535, avec origine en bas à
gauche, conformément au retournement V de `displayMesh`. Faces et indices
de soudure sont tous des `Uint16`. Le maximum est de 49 728 sommets.

Les tableaux `position`, `normal`, `binding` décrivent le corps masculin.
Le corps féminin sélectionne `femalePosition`, `femaleNormal`,
`femaleBinding`. Les liaisons suivent le format natif à huit valeurs par
sommet. `bindingSignedGap: true` demande d’interpréter le décalage normal,
champ 5, comme un `Int16` signé, à l’image des deux décalages tangents. Cela
conserve les racines partiellement enfouies. Les cheveux et barbes sont
reliés au corps après les expressions du visage et l’articulation ; ils ne
participent pas aux masques de couverture des vêtements.

Utiliser les textures WebP RGBA avec matériau double face, alpha MASK et
seuil 0,33, opacité 1. L’ancien matériau Sigmund contient une opacité nulle
qui n’est pas appliquée. Les couleurs originales sont conservées et peuvent
être recolorées par le Salon. Les textures sont limitées à 1536 pixels de
côté ; les UV répétés hors 0–1 sont conservés dans un atlas préparé pour
chaque ressource concernée.

## Adaptation et vérification géométrique

Les UV permettent de retrouver exactement les 13 380 sommets de peau hm08
dans le corps natif du Salon. Les références barycentriques MHCLO et leurs
décalages ajustés reconstruisent le modèle sur chacun des deux corps. Les
références auxiliaires de Culturalibre 01, Faydaen et Jungle utilisent un
transfert local de déformation depuis la peau voisine. Chaque sommet est
ensuite exprimé dans le repère normal et tangent d’un triangle du corps.

Les 60 adaptations ont été vérifiées. L’erreur maximale de reconstruction
après quantification est de 0,159 mm. Un décodage indépendant vérifie les
tableaux, dimensions, valeurs finies, indices et barycentres. Les rapports
complets sont `geometry-validation.json` et `binary-validation.json`.

Le contrôle visuel initial comporte 57 vues en couleur : sept coiffures sur
les deux corps et les cinq barbes sur le corps masculin, de face, de profil
et de trois quarts. Il utilise les corps natifs ; la vérification du Salon
dans le navigateur, des expressions et des têtes de référence appartient
à l’intégration. La coupe « Courte décoiffée » conserve les espaces entre
mèches du modèle original, qui ne possède pas de calotte pleine.

## Licences et traçabilité

Les deux pages officielles et les catalogues JSON inclus dans les archives
déclarent CC0 individuellement pour les trente ressources. Certains en-têtes
MHCLO historiques indiquent AGPL3 ou CC-BY. Ces mentions sont conservées
dans le catalogue, la preuve de licence et les crédits publics ; aucune
notice source n’est réécrite et elles ne sont pas présentées comme uniformes.

La documentation officielle historique explique que MakeClothes proposait
une mention AGPL3 configurable par défaut et permettait à l’auteur original
de choisir la licence de ses vêtements. Cette explication ne prétend pas
établir l’origine de chaque notice divergente :
https://static.makehumancommunity.org/oldsite/documentation/big_dump_from_drupal.html

Les auteurs, URL d’origine, archives exactes et transformations effectuées
sont publiés dans les crédits. `source-inventory.json` conserve le SHA256
de chaque fichier source extrait. Ce dossier documente une préparation et
des contrôles locaux ; le CLI `game-dev` n’étant pas installé lors de la
préparation, il ne prétend pas contenir un reçu d’admission de cet outil.
