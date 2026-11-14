# Camarades — Paris, 14 novembre 2026

Le récit garde ses trois épreuves et ses trente points. Après la réunion des
cortèges à mi-chemin, le joueur choisit une rue et poursuit la promenade. Le
plateau reçoit toujours les mêmes événements et reste seul responsable du score.
Une promenade indépendante, sans points, est aussi accessible depuis l'accueil.

- 44 manifestants proches, puis 16 du second cortège ; 144 silhouettes lointaines.
  Les proches emploient le squelette adulte des Marmousets et de Plaza Catalunya.
  Les poses partagées évitent de recalculer soixante marches par cinématique inverse.
- République, Temple, Filles-du-Calvaire, Beaumarchais et Bastille ; embranchements
  Pont-aux-Choux, Saint-Claude, Saint-Gilles, Turenne et Saint-Antoine. Onze nœuds,
  quatorze tronçons, distances adaptées et boucles rejouables sans fin imposée.
  La jonction à Saint-Sébastien–Froissart est une adaptation, pas une localisation
  exacte fournie par le manuscrit. Boutiques et échanges secondaires sont fictifs.
- Monument original en géométrie 3D : Marianne, rameau, tablette, allégories,
  lion et reliefs. 18 112 triangles. L'image générée évoquée par l'auteur n'a pas
  été retrouvée avec certitude ; ne pas présenter ce modèle comme sa reproduction.
- Sauvegarde locale versionnée de la promenade et des dernières positions du
  cortège. État limité, contrôlé à la reprise ; aucune attribution de points.

## Invariants à conserver

La transition statue → boulevard conserve la scène, le héros et les commandes.
La plateforme reste à y=3,32 et la sortie à x=2,4 ; chaque axe glisse le long du
socle. Le collider du monument ne s'applique pas dans la première rue, où il
n'existe pas. Le jaune peut déclencher la descente ; le rouge appelle puis lance.
Les trois objets restent accessibles avant l'arrivée de leur vague de CRS. Les
projectiles des compagnons ne donnent pas de points. Les scènes quittées libèrent
leurs ressources, mais aucune destruction de scène n'a lieu pendant la descente.

## Validation

`npm run build` : 331 tests réussis, dont 53 pour Camarades et la promenade.
Les nouveaux tests couvrent boucles, retours, limites latérales, sauvegardes,
absence de points supplémentaires, véritable squelette et poses, géométrie du
monument et réseau de rues. Vérifications dans le navigateur : prise du drapeau,
montée, appel et commande de descente ; choix et déplacement dans les rues,
reprise, plan et joystick en cadre de 390 × 844 px.

Le navigateur de contrôle désactive WebGL ; les contrôles visuels ont utilisé
le rendu logiciel compatible sur les mêmes scènes. Aucune mesure de performance
sur un téléphone physique n'est revendiquée. La statue et les quartiers sont des
interprétations stylisées, pas une reconstitution photogrammétrique de Paris.
