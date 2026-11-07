Les Treize Chemins — La Tectonique des âmes

Site : https://tectonique-des-ames.netlify.app/
Production : branche main, déploiement automatique Netlify.
Construction : npm ci puis npm run build. Le dossier dist contient uniquement les fichiers autorisés par build-public.mjs.

Lecture : treize extraits du livre, avec titres de chapitre et pagination du PDF de lecture du 7 novembre 2026. Les titres de scènes sont propres au jeu.

Espace éditeur : editeurs.html et editeurs.js appellent une fonction serveur construite depuis editor-api.mjs. Le catalogue et les documents sont dans le stockage privé Netlify Blobs, jamais dans ce dépôt ni dans dist. Les téléchargements sont découpés en parties et vérifiés par SHA-256. La copie du dossier est datée ; aucune synchronisation automatique avec Google Drive n’est programmée.

La variable secrète EDITOR_CONFIG est définie uniquement dans le contexte de production Netlify. Elle contient les empreintes SHA-256 accessHash et adminHash de codes aléatoires de forte entropie. Aucun code ni jeton ne doit être ajouté au dépôt. Les sessions sont côté serveur, expirent après quatre heures et sont révoquées à la déconnexion ; modifier accessHash invalide les sessions existantes. Les tentatives de connexion sont limitées par adresse IP et par fenêtre de quinze minutes.

Tests de protection : npm test.
Pour actualiser le dossier, importer les documents choisis par l’API administrateur puis publier le catalogue après vérification de toutes les parties. Les dossiers personnels étrangers au manuscrit sont exclus.
