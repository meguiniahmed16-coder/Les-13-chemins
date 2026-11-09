# Synchronisation éditoriale privée depuis GitHub

Ce plugin ne modifie ni la connexion, ni les codes, ni les droits des lecteurs.
Il ne s'exécute que dans le contexte de production sur `main`.

La première publication conserve une clé RSA privée exclusivement dans un store privé et publie uniquement sa clé publique dans `editorial-sync-key.json`. Un lot contient exactement les sept documents déjà présents au catalogue : V16/V17 Word/PDF, continuités Word/PDF, journal Excel. Le lot est scellé (AES-256-GCM, clé enveloppée RSA-OAEP-SHA256) avant d'être enregistré dans `editorial-sync.envelope.json`. Les URL temporaires et les documents ne sont jamais publics.

À la publication suivante, les octets sources sont contrôlés par taille et empreinte MD5 du fichier Drive, stockés par nouveaux identifiants et relus avec SHA-256. Un unique remplacement conditionnel du catalogue préserve les autres documents et refuse un changement concurrent. Les anciens octets sont conservés. Un reçu sans URL, nom de fichier ni contenu privé est publié dans `editorial-sync-receipt.json`. Un lot terminé n'est jamais rejoué.

L'ajout de ce plugin seul n'est PAS une synchronisation des documents : seul un reçu `state: complete` portant le bon identifiant de lot le confirme.
