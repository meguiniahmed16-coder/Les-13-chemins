# Prison — gestes et matières, 14 novembre 2026

- Fermeture progressive des doigts puis du pouce avant le levage du balai. La pose finale et les proportions du personnage existant sont conservées.
- Corde de drap courbe, torsadée et nouée, avec point de suspension fixe au-dessus de la fenêtre.
- Sac composé de deux films translucides plissés, deux anses ouvertes et un paquet visible. Le sac se replie légèrement pendant la traction.
- Amplitude de la corde doublée de 12 à 24 mm ; oscillation plus lente. Le ballant du sac s'amortit avant de franchir les barreaux, sans modifier l'assistance à la saisie.
- Visite de neuf secondes conservée, lumière de la fenêtre légèrement réchauffée ; sons procéduraux discrets désactivables.

## Validation

`npm run build` : 338 tests passent, dont 65 dans le groupe prison/plateau. Vérification des maillages articulés réels, fermeture avant prise, récupération des trois objets, pauses, garde, bonus unique et poursuite du voyage. Les nouvelles vérifications géométriques balaient la traction avec les positions extrêmes de la corde pour contrôler le passage du sac entre les barreaux et la fixation supérieure.

Le navigateur de contrôle ne dispose pas de WebGL. Un aperçu temporaire avec le moteur logiciel existant a permis de contrôler le décor, la prise du balai, la corde et le sac, ainsi que le passage à la fenêtre et la détection du garde. Cet aperçu n'est pas publié ; il ne valide ni les ombres WebGL finales ni les performances d'un téléphone. Les modèles, commandes et règles sont ceux du jeu. La géométrie des doigts reste vérifiée séparément par les tests du vrai squelette.

Contrôle supplémentaire à 390 × 800 : les commandes tactiles sont lisibles ; le bouton « Passer la visite » est décalé sous les trois commandes d’affichage pour éviter leur chevauchement.
