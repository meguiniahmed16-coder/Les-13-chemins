# Chemins IV et V

Six scènes sont publiées en préparation. Leurs textes, personnages et cartes sont
consultables sans débloquer les anciens jeux. Elles n’accordent ni points ni
trésors et n’écrivent pas dans la sauvegarde des treize niveaux historiques.

| Chemin | Chapitre | ID stable | Page réservée | Réalisation prévue |
| --- | --- | --- | --- | --- |
| IV | 7 | stoppub | jeu-stoppub.html | Décor 2D fixe, trois affiches, tracés prédéfinis et patrouille cyclique |
| IV | 8 | demenagement | jeu-demenagement.html | Vue de rue 2D, quatre objets, trois étapes et jauge de stabilité |
| IV | 10 | frontiere | jeu-frontiere.html | Défilement latéral, deux compagnons scriptés, course puis chute narrative |
| V | 11 | rire | jeu-faire-rire.html | Décor fixe, trois gestes, réactions et deux interruptions du téléphone |
| V | 12 | traitre | jeu-le-traitre.html | Six dialogues successifs, trois réponses, deux jauges, trois bilans |
| V | 13 | peguy | jeu-chemin-peguy.html | Marche sur un axe, trois haltes et choix courts |

Ces choix bornent la production : aucun monde ouvert, navigation 3D, combat,
reconnaissance libre de dessin ou arbre de dialogue exponentiel. Les répliques,
animations et règles détaillées seront validées pendant la réalisation des jeux.

## Fichiers et branchement

- `chemins-en-cours-data.js` : registre des chemins, extraits, voix, cartes,
  ressources visuelles et futures entrées de jeux.
- `chemins-en-cours.js` : vignettes, lecteur, navigation, personnages et mini-cartes.
- `chemins-atlas.js` : sélection des six scènes sur la carte principale.
- `futurs-jeux.js` : hôte commun des six pages réservées ; module chargé après clic.
- `chemins-en-cours-core.js` : recherche, ordre, cadrage des images et cycle de vie.

Pour activer un jeu, créer `games/<id>/index.js`, l’ajouter à l’allowlist de
`build-public.mjs`, puis renseigner `game.module: './games/<id>/index.js'` et
`game.status: 'ready'`. Ne pas changer seulement le statut : un module valide
est obligatoire. Les six jeux sont actuellement `preparation`, sans module.

Le module exporte `createGame({container, scene, reducedMotion, complete})` et
retourne un adaptateur optionnel `{start, pause, resume, destroy}`. L’hôte gère
l’erreur de chargement, la mise en pause hors de l’onglet, le nettoyage à la
sortie et le rejet des terminaisons tardives, répétées ou pendant une pause.
Les événements de clavier et d’animation doivent être retirés dans `destroy`.
`complete()` termine uniquement cette scène. L’intégration au score constitue
une étape future distincte ; aucun succès n’est simulé dans cette préparation.

Les liens `jeu.html?scene=<id>&vue=text|people|map|game` ouvrent le lecteur ;
`carte.html?scene=<id>` sélectionne les lieux. Les feuilles de style sont
communes aux lecteurs et aux pages de jeux, avec commandes d’au moins 44 px.

## Sources et images

Extraits des chapitres 7, 8, 10, 11, 12 et 13 de la V17, lecture du 13 novembre
2026. Sélections des ateliers 00, 67, 84 et 85. Les noms Samer et Fadi restent
des pseudonymes d’atelier. Les six invitées sont explicitement des personnages
de l’adaptation. Aucune biographie n’a été créée pour combler une fiche absente.
Les documents de travail ne sont pas liés depuis le site public.

La planche de vignettes et le portrait final du Traître sont convertis en WebP
sans perte, sans redessin ni agrandissement artificiel. Les cinq autres scènes
utilisent les cadres d’origine par positionnement de l’image.

Les repères parisiens utilisent les adresses du manuscrit et le géocodage IGN.
Les autres coordonnées sont des centres de localités. Les traits restent
schématiques. Le passage frontalier et les maisons de la marche ne sont pas
localisés sans source. Chartres est marqué comme destination, et le mouvement
s’arrête au dernier repère raconté. Les mini-cartes ne tournent pas en boucle.

## Validation

`node --test chemins-en-cours.test.mjs journey.test.mjs`

`npm run build` vérifie aussi tous les anciens jeux et le contenu public.
