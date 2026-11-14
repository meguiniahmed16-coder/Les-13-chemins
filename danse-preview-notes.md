# Essai local du Danseur — 14 novembre 2026

Les cinq danseurs conservent leurs modèles, couleurs, coiffures et visages de la base 9d5711d. Le nouveau mouvement utilise une phrase originale de 32 temps inspirée du jerk, du twist et des pas liés, avec un pied d'appui et des transitions interpolées des mains. Les 21 personnages du public et du fond du plateau utilisent les sept modèles du pack POLYGON City Characters déjà acheté, avec son atlas 01_A. L'éclairage principal est adouci.

`node build-danse-preview.mjs /chemin/Le-Danseur-Apercu.html` produit un fichier autonome : Three.js, deux modèles de danseurs, le public et la musique sont incorporés. Aucun appel à un générateur payant. Ce prototype ne modifie aucun site publié.

Le lecteur propose lecture/pause, quatre phrases, trois vues, son et ralenti. La musique est Funky Chunk de Kevin MacLeod, CC BY 4.0, à 115 BPM ; attribution et références chorégraphiques dans le fichier HTML.

Validation : 21 tests de danse et d'articulation passent ; les commandes du lecteur ont été exercées avec des dépendances simulées. Les pieds restent à leur hauteur cible à moins de 3 mm sur les rigs masculin et féminin, et les longueurs des membres sont conservées. Huit poses et le public ont été inspectés avec un rendu CPU des maillages déformés. Ce contrôle ne reproduit pas les ombres WebGL. L'ouverture interactive dans le navigateur de vérification n'a pas été possible : localhost inaccessible et ouverture file:// interdite. Un contrôle WebGL sur l'appareil du lecteur reste nécessaire.

Sources d'inspiration :
- https://www.libraryofdance.org/dances/jerk/
- https://www.pecentral.org/lessonideas/ViewLesson.asp?ID=9638
