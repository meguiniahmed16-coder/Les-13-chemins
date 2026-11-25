# Contrat ergonomique du Salon — version validée

## Principes obligatoires

Ce document formalise les corrections répétées et validées pour « La Croisée des Âmes ».

- Le décor et les personnages restent visibles et manipulables pendant toute personnalisation. Le moteur 3D ne doit pas être remplacé ou redimensionné par un menu.
- Les commandes natives et les commandes de l'Atelier sont conservées et accessibles, sans boutons qui se chevauchent.
- Sur téléphone en portrait, le tiroir Atelier ne dépasse pas 42 % de la largeur du Salon en portrait (29 % en paysage compact) ; le rail d'icônes reste fin, 45 px au repos et 52 px avec libellés.
- Le panneau Atelier, le panneau des fonctions et leur rail vert sont **translucides** (opacité ivoire d'environ 65 %, vert d'environ 74 %), avec un contraste suffisant. Ne pas revenir à un fond opaque sans accord.
- Les libellés du rail vert utilisent une police comprise entre 8,5 et 9 px lorsque les noms sont visibles. Aucun libellé ne déborde de son bouton ; les cibles tactiles conservent une hauteur d'au moins 48 px.
- À l'ouverture du Salon, **un seul bouton Menu** est visible dans la navigation supérieure. Le premier appui déploie toutes les icônes, le deuxième replie l'ensemble. Les fonctions demeurent présentes dans les sous-menus sans être supprimées.
- La navigation des catégories conserve : appui = ouvrir et voir le nom, second appui = replier, passage direct d'une catégorie à l'autre, sans perdre l'état.
- L'affichage initial ne doit jamais montrer les icônes en très grand avant le chargement des feuilles CSS : le menu replié est présent dans le HTML dès sa création, avec un style critique intégré avant les feuilles distantes.
- Le **joystick caméra** affiche seulement le pictogramme d'appareil photo. Le texte visible « Caméra » est supprimé, mais le bouton conserve un libellé accessible et toutes ses actions.
- Vérifier les fichiers et les tests de publication, puis valider le résultat sur des captures réelles Android en portrait et paysage avant de déclarer le rendu irréprochable.

## Préservation

La bibliothèque, les modes de déplacement et de caméra, les interactions, les options propriétaires et les fonctions V27 ne sont pas retirés pour faire de la place. Ils sont organisés dans les catégories correspondantes.

## Invités et conversation — décisions validées

- Tous les invités utilisent le même système de squelette V27 qu’Ahmed et Marianne. L’appui calibré sur l’accoudoir du fauteuil est favorisé pour les invités sans modifier les poses originales d’Ahmed et de Marianne.
- La génération d'un invité doit respecter les informations documentées, employer une apparence sobre et ne jamais lui attribuer au hasard des lunettes à l'intérieur. Le portrait d'Abdelouahab est explicitement sobre, avec cheveux courts.
- La recherche de personnages et **Inviter au hasard** sont fixes en haut de leur volet ; seule la liste défile. Ces contrôles restent disponibles après une invitation.
- La voix est attribuée automatiquement selon le genre renseigné dans le répertoire : masculine pour un homme, féminine pour une femme. Le menu déroulant « Marianne » n'est plus affiché.
- L'appel doit privilégier trois actions compréhensibles : Appeler, Micro (pause/interruption de la réponse) et Raccrocher ; le statut reste lisible et les réglages techniques secondaires sont repliés.
- L'envoi d'une phrase peut se déclencher après une pause naturelle plus courte pour réduire la latence. La voix OpenAI doit être demandée directement, sans refaire la liste des voix ni déclencher systématiquement une erreur ElevenLabs avant de répondre.
- Ne pas présenter cette chaîne de transcription / réponse / synthèse comme une session WebRTC temps réel : il s'agit de l'amélioration de l'architecture actuelle.
