# Camarades — Paris, 14 novembre 2026

Le récit garde ses trois épreuves et ses trente points. Après la réunion des
cortèges à mi-chemin, le joueur choisit une rue et poursuit la promenade. Le
plateau reçoit toujours les mêmes événements et reste seul responsable du score.
Une promenade indépendante, sans points, est aussi accessible depuis l'accueil.

- 44 manifestants proches, puis 16 du second cortège ; 144 silhouettes lointaines.
  Les proches emploient le squelette adulte des Marmousets et de Plaza Catalunya.
  Les poses partagées évitent de recalculer soixante marches par cinématique inverse.
- République, Temple, Filles-du-Calvaire, Beaumarchais et Bastille ; embranchements
  Pont-aux-Choux, Saint-Claude, Saint-Gilles, Turenne et Saint-Antoine. Vingt et un nœuds,
  vingt-six tronçons, distances adaptées et boucles rejouables sans fin imposée.
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

`npm run build` : 335 tests réussis, dont 57 pour Camarades et la promenade.
Les nouveaux tests couvrent boucles, retours, limites latérales, sauvegardes,
absence de points supplémentaires, véritable squelette et poses, géométrie du
monument et réseau de rues. Vérifications dans le navigateur : prise du drapeau,
montée, appel et commande de descente ; choix et déplacement dans les rues,
reprise, plan et joystick en cadre de 390 × 844 px.

Le navigateur de contrôle désactive WebGL ; les contrôles visuels ont utilisé
le rendu logiciel compatible sur les mêmes scènes. Aucune mesure de performance
sur un téléphone physique n'est revendiquée. La statue et les quartiers sont des
interprétations stylisées, pas une reconstitution photogrammétrique de Paris.


## Suite validée le 14 novembre : un cortège vivant

- La banderole porte « Résister, c’est créer ». Deux manifestants tiennent ses
  deux hampes. Chaque drapeau et pancarte suit la paume de son porteur, y compris
  après la réunion des cortèges et lors des virages. Les textes se lisent sur les
  deux faces ; aucune enseigne portée n'est positionnée seule dans le décor.
- Démo interactive facultative avant la première partie : sélectionner une fleur,
  jaune pour la récupérer, sélectionner un CRS, rouge pour l'envoyer. Rejouable
  par « Démo », accessible au clavier et tactile, sans événement de score.
- Têtes et torses bougent au repos, poings réellement fermés par rotation des
  doigts, gestes décalés entre voisins. Slogans visuels réguliers ; voix française
  de synthèse si « Son ON ». Arrêt de la voix en pause, sortie ou désactivation.
- Trois voitures originales en géométrie légère, inspirées des Clio II, 206 et
  Xsara, avec plaques de l'époque ; stationnement hors du couloir de déplacement.
  Dix-huit passants animés sont répartis sur les trottoirs proches.
- La promenade rejoint Francs-Bourgeois, Rambuteau, Beaubourg, Renard, Rivoli,
  Fourcy, Nonnains-d’Hyères, Lobau et le quai de l’Hôtel-de-Ville. Pompidou,
  Hôtel de Ville et Seine ont leurs volumes distinctifs. Le réseau reste une
  adaptation de jeu, aux distances comprimées. Les boucles n'ont pas de fin imposée.
- Les sauvegardes couvrent tout le nouveau réseau. Une ancienne sauvegarde sur
  le tronçon Turenne désormais coupé par Francs-Bourgeois reprend au carrefour
  de départ de ce tronçon, en conservant les lieux visités et la distance cumulée.

Sources cartographiques consultées (topologie, aucune donnée chargée par le jeu) :
- Ville de Paris, plan de circulation du bas Marais :
  https://cdn.paris.fr/paris/2021/01/20/fcd805fcae5d7659087b1f4a1fd9328a.pdf
- Ville de Paris, rapport du secteur sauvegardé du Marais, axes Renard–Beaubourg :
  https://cdn.paris.fr/paris/2020/02/26/a4878f9d14006d1dcb7c244500153fa5.pdf
- Ville de Paris, rapport du secteur sauvegardé, connexion Rambuteau–Francs-Bourgeois :
  https://cdn.paris.fr/paris/2020/02/26/2036630923f689f0c704a7d9522c82a9.pdf

Vérifications de cette suite : démonstration complète au bureau et dans un cadre
390 × 844, aucun point de démonstration, joystick tactile sur Pont-aux-Choux jusqu'au
carrefour Turenne, choix suivant et plan, drapeaux portés et slogans à l'écran.
Les tests parcourent toute la boucle Beaubourg–Hôtel de Ville–quais et contrôlent
la reprise au-delà des anciennes limites, ainsi que l'ancrage des hampes sur des
parents tournés. Le budget de lots statiques augmente avec la superficie ; le
rendu conserve son découpage spatial pour ignorer les quartiers hors champ.
