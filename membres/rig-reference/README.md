# Armature native MakeHuman — chantier de l'atelier privé

Source : MakeHuman Community, données CC0, révisions des trois blobs indiquées dans la référence JSON. Le maillage de base comprend 19 158 sommets (dont repères auxiliaires), 163 os et les poids natifs. La fonction referenceArmature assemble la hiérarchie à partir des repères du maillage, calcule les matrices de repos/inverses et normalise les quatre influences GLB principales. Les poids complets restent archivés. Les 15 os historiques et leurs animations doivent rester la source de mouvement pendant le retargeting ; les 163 os ne sont pas encore branchés aux modèles Ahmed/Marianne. Aucun déploiement de cet essai.

## Étapes de migration
- Conserver le corps et le cou MakeHuman continus jusque sous la base du crâne ; conserver la tête native comme support d'animation et de repérage. Le plan de coupe est à contrôler sur chaque scan, au-dessus de la gorge.
- Remailler ou transférer les poids par correspondances de surface vers les corps et les visages importés (jamais par index sur les scans). Préserver les visages actuels et les morphs ; éviter la double déformation des lèvres et des paupières.
- Retargeting des mouvements V22 vers la hiérarchie complète, articulations des doigts et orteils indépendantes, contrôles de regard et synchronisation labiale.
- Textures : même atlas ou reprojection de transition, mêmes normales de part et d'autre de la couture ; validation front/profil/dos et en mouvement.
- Vêtements : transfert robuste par surface avec interpolation, validation des collisions et simulation textile indépendante du rig. Préserver coupe et textures d'origine.
- Ne fusionner qu'après vérification visuelle sur les vrais personnages ; aucune modification de la cinématique publique. Les tests de la référence ne valident pas le retargeting ni l'anatomie des scans.
