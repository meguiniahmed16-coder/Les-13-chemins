# Migration des cinématiques vers Cloudflare R2 — phase 1

Projet : Les Treize Chemins — préparation du 12 novembre 2026.

## Périmètre vérifié
- 22 MP4 référencés par le site, tous dans jeu-rencontre.html : 14 plans principaux (C et B), 8 alternatives (A).
- Pas de vidéo C02 solitaire, ni de scène B07. Ne jamais les réintroduire automatiquement.
- Les MP4 ne sont pas dans GitHub : ils sont servis directement depuis le CDN externe déjà associé au jeu.
- Les 22 URL existantes sont conservées tant que R2 n'a pas été alimenté, vérifié et validé visuellement.
- Les trois images du bloc ART, et les deux musiques sous licence CC BY, ne sont pas incluses dans cette migration vidéo.

## Pourquoi la production ne change pas encore
Aucun compte ni bucket R2 n'est actuellement accessible par l'outil de migration. Cette branche ajoute un manifeste, un programme de copie et des tests uniquement. Elle n'active aucune substitution de CDN.

## Préparation dans Cloudflare
1. Dans le tableau de bord Cloudflare, activer R2 si nécessaire. Créer un bucket privé (par exemple « treize-chemins-videos »), classe Standard.
2. Dans R2 > API Tokens, créer une clé S3 limitée à ce bucket et aux seules permissions Object Read & Write. **Ne jamais mettre la clé dans le dépôt, un ticket, un chat ou le code du site.**
3. Installer rclone (v1.59+) sur le poste qui fera le transfert. Configurer un remote nommé r2, type S3, fournisseur Cloudflare, avec l'endpoint https://ACCOUNT_ID.r2.cloudflarestorage.com et les clés stockées localement.
4. Dans un terminal à la racine du dépôt, définir R2_BUCKET avec le vrai nom du bucket. R2_REMOTE est facultatif (défaut « r2 »).
5. Vérifier d'abord le manifeste puis copier une **seule vidéo pilote**, avant les 21 autres :

~~~bash
node --test r2-migration.test.mjs
node scripts/migrate-videos-r2.mjs --plan
R2_BUCKET=treize-chemins-videos node scripts/migrate-videos-r2.mjs --upload --only=C01
R2_BUCKET=treize-chemins-videos node scripts/migrate-videos-r2.mjs --verify --only=C01
# Après contrôle visuel du pilote :
R2_BUCKET=treize-chemins-videos node scripts/migrate-videos-r2.mjs --upload
R2_BUCKET=treize-chemins-videos node scripts/migrate-videos-r2.mjs --verify
~~~

La copie utilise « rclone copyurl » (transfert de l'URL HTTP vers R2 sans sauvegarde locale) et « --no-clobber » (ne pas écraser un objet existant). Le programme vérifie ensuite présence et taille non nulle des objets. Une vérification visuelle dans le lecteur reste indispensable.

## Publication — phase 2, NON effectuée
- Ne pas activer R2.dev comme URL de production : son trafic est limité et sa fonction est réservée aux essais.
- Utiliser plutôt un domaine personnalisé contrôlé par le propriétaire, rattaché à R2 depuis Cloudflare. Le sous-domaine netlify.app n'est pas un domaine que le propriétaire peut rattacher à son compte Cloudflare.
- Une fois les 22 fichiers réellement copiés : ouvrir chaque URL publique, contrôler démarrage, son, ordre des plans, mobile, politique CORS si besoin et taille des fichiers.
- Modifier alors les 22 références de jeu-rencontre.html sur une branche distincte, idéalement via un préfixe R2 unique. Conserver un repli temporaire vers le CDN d'origine.
- Mettre à jour les tests, déployer, valider les 22 scènes, puis seulement envisager de retirer les anciennes références. **Aucun objet ne doit être effacé du CDN d'origine par ce processus.**

Documentation :
- Cloudflare : https://developers.cloudflare.com/r2/get-started/s3/
- Domaines publics : https://developers.cloudflare.com/r2/buckets/public-buckets/
- rclone copyurl : https://rclone.org/commands/rclone_copyurl/
