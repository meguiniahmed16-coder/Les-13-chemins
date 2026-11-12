# Les Treize Chemins — migration des cinématiques R2

État contrôlé le 12 novembre 2026.

## Fichiers et destinations vérifiés
- Le jeu de la rencontre référence 22 vidéos MP4 : 14 plans principaux et 8 plans alternatifs.
- Les 22 objets sont présents dans le bucket Cloudflare R2 `les-13-chemins-videos`, sous le préfixe `rencontre/`, avec leur véritable nom `hf_*.mp4`.
- Volume relevé par l'API R2 : **174 382 275 octets**, aucun objet vide.
- Le manifeste `migration/r2-videos-manifest.json` utilise désormais les **clés réellement présentes** ; auparavant il proposait à tort `videos/rencontre/...`.
- La scène C02 (garçon seul) et l'ancienne B07 doivent rester exclues. Les images et musiques ne font pas partie de cette migration.

## Lecture et vérification
- Un Worker Cloudflare de lecture, `treize-chemins-videos`, dispose d'une liaison `BUCKET` vers R2.
- Adresse de test : `https://treize-chemins-videos.meguiniahmed16.workers.dev/rencontre/<nom-fichier>.mp4`.
- Le Worker sert seulement les fichiers `rencontre/hf_*.mp4` et prend en charge HEAD et les requêtes HTTP Range.
- Le test `r2-delivery.test.mjs` et le workflow `.github/workflows/verify-r2-delivery.yml` doivent confirmer **depuis GitHub Actions** les 22 réponses HEAD et 206 Range, les types MIME, les tailles et l'en-tête MP4 avant le basculement.
- Une réponse 403 d'un environnement dont les requêtes internet sont bloquées ne constitue pas un test concluant du Worker ; utiliser le résultat de GitHub Actions et un contrôle de lecture sur mobile.

## Publication sécurisée
1. Ne pas changer les DNS Netlify pour cette étape. Le domaine `tectonique-des-ames.com` et le site restent inchangés.
2. Ne pas remplacer les URLs publiques du jeu avant la réussite du test HTTP et d'un essai réel de lecture.
3. Pour le changement du lecteur, conserver provisoirement les liens Higgsfield pour un retour automatique en cas d'erreur R2.
4. Vérifier l'ordre des scènes et leurs sons sur mobile, puis publier vers `main` uniquement une fois les contrôles acquis.
5. Ne supprimer ni les vidéos originales Higgsfield ni les objets R2 pendant le basculement.

## Ancien script de transfert
Le programme `scripts/migrate-videos-r2.mjs` et le workflow `migrate-r2-videos.yml` restent facultatifs pour une récupération/reprise. Ils utilisent le manifeste corrigé et des secrets privés, uniquement quand l'utilisateur demande une nouvelle copie. Les 22 objets déjà présents ne doivent pas être écrasés.

Références : https://developers.cloudflare.com/r2/api/workers/workers-api-usage/ ; https://developers.cloudflare.com/r2/buckets/public-buckets/
