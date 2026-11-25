# Coiffures et barbes MakeHuman pour le Salon

Collection publique de 25 coiffures Hair01 et 5 barbes Bodyparts05. Les meshes
et textures proviennent des archives CC0 officielles, adaptées aux deux corps
natifs du Salon. Aucun portrait individuel ni archive source volumineuse n’est
inclus dans ce dossier.

`assets.json` décrit un inventaire fermé : chaque fragment, chaque fichier de
provenance et chaque ressource publique possède une taille et un SHA256. Les
fragments `grooms-*.pack` font au maximum 600 000 octets. Leur concaténation
contient les 30 ressources gzip du Salon, `credits.txt` et `credits.json`.

`source-hair01.json` et `source-bodyparts05.json` conservent les catalogues
originaux inclus dans les archives. Ils indiquent CC0 pour chacune des trente
ressources. Les anciennes notices MHCLO différentes sont conservées dans
`catalog.json`, `licensing-evidence.json` et les crédits publics. L’inventaire
des fichiers source et les empreintes des archives officielles sont conservés
dans `source-inventory.json`.

Le build public appelle `buildMakehuman(root, output)` depuis
`scripts/build-makehuman.mjs`. Le contrôle de tous les fichiers, des catalogues
et des crédits précède toute écriture dans `output/assets/makehuman/`.

Vérification : `node --test assets-source/makehuman/verify.test.mjs`.
Mise à jour depuis une préparation validée :
`node assets-source/makehuman/package.mjs /chemin/vers/makehuman-integration`.

Le paquet suit un contrôle local documenté. Le binaire `game-dev` n’était pas
disponible lors de sa préparation ; il ne s’agit pas d’un reçu d’admission
généré par cet outil. Voir `docs/makehuman-integration.md` pour le contrat de
rendu, l’adaptation géométrique et les limites de validation.
