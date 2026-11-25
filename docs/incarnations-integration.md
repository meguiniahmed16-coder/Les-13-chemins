# L’Atelier des Incarnations dans le Salon

La première version intégrée conserve le moteur de création de personnages
de l’application privée et ses exports GLB et HTML autonome. Elle s’ouvre
depuis **Personnaliser → L’Atelier des Incarnations**, dans le Salon existant.
Le bouton **Retour au Salon** ferme le cadre et libère la caméra.

## Accès et photographie

Le serveur détermine les droits à partir de la session existante :

- Ahmed, propriétaire : import d’une photographie depuis les fichiers.
- Membre connecté : caméra frontale, aperçu, prise du selfie et validation.
- Visiteur ou aperçu de démonstration : atelier indisponible.

Le HTML livré à un membre ne contient aucun champ d’import de fichier.
L’atelier revalide le rôle et le compte au démarrage, avant la prise d’image,
la création et l’export. Un changement de compte ou une session expirée
bloquent l’atelier. Aucun paramètre d’URL ne peut accorder le rôle propriétaire.

Les photos sont traitées sur l’appareil. Le selfie et la recette d’un membre
restent en mémoire et disparaissent à la fermeture. Les sauvegardes locales
du propriétaire sont séparées par compte. La caméra s’arrête après la prise,
à l’annulation, au masquage du document et à la fermeture.

La prise directe supprime l’import depuis la galerie dans ce parcours.
Elle ne constitue pas une preuve d’identité et ne détecte pas une photographie
présentée devant la caméra.

## Livraison privée

Le document est servi par `/api/membres/incarnations` ; le contrôle de session
utilise `/api/membres/incarnations/access`. Les 39 modules, fragments et icônes
sont conservés dans R2 privé et servis derrière la même session. Le manifeste
fermé dans `assets-source/incarnations/assets.json` décrit leurs chemins,
tailles et SHA256. Les modèles et portraits ne sont pas copiés dans le dépôt
GitHub public ou dans le dossier public du site.

Le transfert interrompu a été repris le 25 novembre 2026 : 21 objets présents
ont été vérifiés et les 18 objets manquants ont été ajoutés. Les tailles et
empreintes MD5 des 39 objets correspondent aux fichiers locaux, pour un total
de 36 707 358 octets. Le plus grand module mesure 1 796 655 octets.

Le proxy transmet les politiques de caméra de même origine, de non-cache
et d’intégration dans le seul site. Ce build ne contient ni service worker,
ni manifeste d’installation, ni stockage hors connexion des pages privées.

## Construction et validation

Le code de l’application autonome correspond au commit source indiqué dans
le manifeste. Son build Salon doit utiliser :

```sh
node build.mjs --mode salon --base /api/membres/incarnations/ --out /chemin/sortie
```

Le site prépare ensuite le manifeste privé avec
`scripts/package-incarnations.mjs`. `build-public.mjs` valide ce manifeste
sans copier les ressources privées. Le backend est construit avec
`node membres/build-worker.mjs /chemin/worker.mjs`.

Les tests vérifient les accès propriétaire/membre/visiteur, les routes privées,
les attributs du cadre, le retour au Salon et l’isolation des messages entre
fenêtres. Les tests de création et d’export du projet source vérifient aussi
la capture, l’arrêt des pistes et la reconstruction exacte des fragments.
Ils ne remplacent pas un essai avec une caméra Android physique.

La V1 produit des fichiers GLB et HTML téléchargeables. Elle n’applique pas
automatiquement le personnage créé à l’avatar actif du Salon.
