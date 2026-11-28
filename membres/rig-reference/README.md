# Armature native MakeHuman — chantier de l'atelier privé

Source : MakeHuman Community, données CC0, révisions des trois blobs indiquées dans la référence JSON. Le maillage de base comprend 19 158 sommets (dont repères auxiliaires), 163 os et les poids natifs. La fonction referenceArmature assemble la hiérarchie à partir des repères du maillage, calcule les matrices de repos/inverses et normalise les quatre influences GLB principales. Les poids complets restent archivés. Les 15 os historiques et leurs animations doivent rester la source de mouvement pendant le retargeting ; les 163 os ne sont pas encore branchés aux modèles Ahmed/Marianne. Aucun déploiement de cet essai.

## Étapes de migration
- Conserver le corps et le cou MakeHuman continus jusque sous la base du crâne ; conserver la tête native comme support d'animation et de repérage. Le plan de coupe est à contrôler sur chaque scan, au-dessus de la gorge.
- Remailler ou transférer les poids par correspondances de surface vers les corps et les visages importés (jamais par index sur les scans). Préserver les visages actuels et les morphs ; éviter la double déformation des lèvres et des paupières.
- Retargeting des mouvements V22 vers la hiérarchie complète, articulations des doigts et orteils indépendantes, contrôles de regard et synchronisation labiale.
- Textures : même atlas ou reprojection de transition, mêmes normales de part et d'autre de la couture ; validation front/profil/dos et en mouvement.
- Vêtements : transfert robuste par surface avec interpolation, validation des collisions et simulation textile indépendante du rig. Préserver coupe et textures d'origine.
- Ne fusionner qu'après vérification visuelle sur les vrais personnages ; aucune modification de la cinématique publique. Les tests de la référence ne valident pas le retargeting ni l'anatomie des scans.


## Point de reprise — recalage individuel
- `atelier-rig-retarget.js` adapte les rotations mondiales de la source V22 à la hiérarchie MakeHuman. Les longueurs au repos sont préservées. Le mouvement des doigts, des orteils et du visage n'est pas encore migré.
- `atelier-rig-registration.js` recale la référence native sur les repères du personnage, contrôle la latéralité, échantillonne le jacobien et mesure les erreurs résiduelles. Le transfert n'est accepté que lorsque tous les sommets cibles disposent d'une correspondance. Cette étape ne garantit pas encore l'absence de collisions ni la qualité du raccord visible.
- `atelier-rig-private-preview.js` capture les repères des véritables acteurs privés dès leur chargement. Le bouton « Contrôler le recalage · 163 os » de la branche calcule un diagnostic local pour le personnage sélectionné. Il ne remplace ni le modèle ni ses poids ; il n'enregistre et ne transmet aucune donnée. Le calcul n'a pas encore été mesuré sur Android.
- Prochaine étape : exécuter les tests du dépôt et relever séparément les diagnostics Marianne/Ahmed dans une session auteur. Corriger les repères mal alignés ou les zones non couvertes avant de brancher la nouvelle armature, notamment aux doigts, au cou et aux pieds. Ne pas modifier la V7 publique ni la cinématique.
- Les tests synthétiques ont été ajoutés, mais leur exécution et le build de la branche ne sont pas confirmés. Aucun déploiement effectué.
