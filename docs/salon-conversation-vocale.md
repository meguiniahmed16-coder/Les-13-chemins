# Conversation vocale du Salon — première version

État du code documenté le 25 novembre 2026.

La première version ajoute une conversation vocale dans le Salon depuis le navigateur du téléphone. Elle est réservée au propriétaire connecté avec sa session auteur. Le serveur refuse ces routes aux visiteurs et aux autres membres.

Le bouton **Conversation vocale** accompagne le dialogue avec un personnage invité. La discussion écrite, la dictée éditable et le bouton de lecture vocale existants restent disponibles. La dictée habituelle continue à remplir le champ de texte sans envoyer le message automatiquement.

Cette note décrit l’implémentation et sa validation technique. Elle ne constitue pas une attestation de connexion des comptes fournisseurs ni d’un essai sur un téléphone physique.

## Parcours et tours de parole

1. Le propriétaire ouvre le Salon, invite un personnage et ouvre **Conversation vocale**.
2. Le panneau vérifie les connexions et propose les voix françaises accessibles dans le compte ElevenLabs. La voix du même genre que le personnage est proposée lorsque les métadonnées le permettent ; le choix reste modifiable avant le démarrage.
3. **Commencer** déverrouille le son, vérifie la disponibilité et demande l’accès au micro.
4. Le navigateur enregistre une phrase. Une pause d’environ 1,2 seconde termine le tour après une durée minimale de parole détectée. Le bouton **J’ai terminé** permet de conclure le tour manuellement.
5. OpenAI transcrit l’enregistrement en français. Le texte reconnu apparaît dans le dialogue.
6. OpenAI produit une réponse courte avec la fiche de continuité du personnage et les échanges récents.
7. ElevenLabs produit la voix choisie. Le navigateur reçoit et décode le fichier audio, puis le lit. Les lèvres suivent le temps et l’énergie réelle de cet audio ; le surlignage des mots reste une approximation fondée sur la durée de la réplique.
8. Après la fin réelle de la lecture, le micro se rouvre pour le tour suivant.

Le micro est arrêté pendant la transcription, la préparation de la réponse et la lecture. Cette V1 fonctionne par tours successifs. **Prendre la parole** interrompt une réponse en attente ou sa lecture et ouvre un nouveau tour ; la parole de l’utilisateur seule ne déclenche pas encore cette interruption.

Le flux audio ElevenLabs est transmis sans chargement intégral dans le proxy et le Worker. Le navigateur attend néanmoins la réception du fichier borné avant de le décoder. La latence de la chaîne complète reste à mesurer avec les comptes et le téléphone réels.

## Commandes et arrêts

| Commande ou événement | Comportement |
| --- | --- |
| Commencer | Lance une session après vérification des connexions et du choix de voix. |
| J’ai terminé | Finalise la phrase courante et démarre sa transcription. |
| Prendre la parole | Annule le tour précédent, coupe sa lecture éventuelle et ouvre le micro. |
| Couper le micro | Met la conversation en pause et annule le travail du tour courant. |
| Reprendre | Relance explicitement la conversation avec la voix sélectionnée. |
| Fermer le panneau ou terminer le dialogue | Arrête la conversation et efface les éventuels champs de clé encore remplis. |
| Réduire le dialogue ou ouvrir la personnalisation | Met la conversation vocale en pause avant de masquer ses commandes. |
| Masquer la page, quitter l’écran ou changer d’application | Coupe le micro et annule le tour. Le retour sur la page ne redémarre rien automatiquement. |
| Erreur réseau, refus du micro, silence prolongé ou quota atteint | Affiche un message et met la conversation en pause, sans boucle de réessai automatique. |

Une session est mise en pause au bout de dix minutes. Une nouvelle pression sur **Reprendre** est nécessaire pour continuer. Les identifiants de session et de tour empêchent une ancienne transcription, une réponse tardive ou un ancien événement audio de reprendre la conversation après un arrêt.

## Connexion privée des comptes

Le panneau **Relier mes comptes** contient deux champs masqués : OpenAI et ElevenLabs. Il appartient au parcours administrateur et appelle uniquement les routes privées du site.

La vérification d’une clé utilise une opération de lecture : `GET /v1/models` chez OpenAI et `GET /v1/user/subscription` chez ElevenLabs. Aucune transcription, réponse ou synthèse n’est générée pendant cette vérification. L’accès aux modèles effectivement utilisés devra être confirmé lors du premier essai complet.

Une clé n’est remplacée qu’après réussite de cette vérification. Les champs sont vidés après la tentative ou à la fermeture du panneau. Une réponse de sauvegarde arrivant après la fermeture ou un changement de personnage ne rouvre pas le panneau.

Le formulaire reste accessible si la liste des voix échoue, si une connexion doit être remplacée ou si une ancienne entrée du coffre est illisible. La présence de clés configurées ne prouve ni le solde de crédits ni la disponibilité commerciale des services.

La configuration ne crée aucun abonnement et n’active aucun dépassement automatique. Les dépenses d’utilisation relèvent des comptes auxquels appartiennent les clés fournies. Les plafonds du Salon sont des limites d’activité ; ils ne constituent pas un suivi monétaire du solde fournisseur.

## Fournisseurs et routes

| Étape | Implémentation |
| --- | --- |
| Transcription | OpenAI `POST /v1/audio/transcriptions`, modèle `gpt-transcribe`, langue française transmise dans `languages[]`. |
| Dialogue | OpenAI `POST /v1/responses`, modèle par défaut `gpt-6-luna`, `reasoning.effort: none`, réponse limitée à 320 tokens et `store: false`. Le modèle peut être changé exclusivement par la configuration serveur `OPENAI_VOICE_MODEL`. |
| Voix disponibles | ElevenLabs `GET /v2/voices`, filtre `language=fr`, pagination bornée à trois pages et 200 voix retenues au maximum. |
| Synthèse | ElevenLabs `POST /v1/text-to-speech/{voice_id}/stream`, modèle `eleven_flash_v2_5`, français et format `mp3_44100_128`. L’identifiant doit appartenir à la liste accessible au compte. |

Les routes du site sont toutes sous `/api/membres/voice/` : `status`, `voices`, `settings`, `transcribe`, `reply` et `speech`. Les clés permanentes restent au serveur ; aucune route ne les renvoie au navigateur. Le client ne choisit ni URL de fournisseur, ni modèle, ni consignes système.

Les sources de référence des personnages restent celles du Salon. Le serveur récupère la fiche dans le catalogue publié et réutilise `conversationPrompt()`. Le texte et l’historique du client sont limités à des messages de conversation, sans rôles système ni champs supplémentaires.

## Limites exactes de cette version

Les réservations quotidiennes sont propres au propriétaire et changent avec le jour civil de **Paris**. Elles sont atomiques dans `member_limits`. Une réservation n’est pas rendue après une erreur ou une annulation, car le fournisseur peut avoir commencé à facturer la requête.

| Ressource | Limite |
| --- | --- |
| Requêtes de transcription | 60 par jour |
| Requêtes de réponse OpenAI | 60 par jour |
| Requêtes de synthèse ElevenLabs | 60 par jour |
| Consultations explicites de la liste des voix | 40 par jour |
| Texte envoyé à la synthèse | 6 000 caractères par jour |
| Volume audio réservé pour la transcription | 24 Mio par jour |
| Actions vocales, hors statut et configuration | 100 par fenêtre de quinze minutes |
| Tentatives de vérification de clé | 8 par fenêtre de quinze minutes |
| Enregistrement d’un tour | 45 secondes au maximum dans le navigateur ; 2 Mio au maximum dans le navigateur, le proxy et le Worker |
| Silence avant une première phrase | Pause après 15 secondes sans parole suffisante |
| Détection minimale de parole | 240 ms avant finalisation d’un tour |
| Réponse audio reçue par le navigateur | 4 Mio au maximum |
| Message, texte de synthèse ou élément d’historique | 1 600 caractères au maximum |
| Historique transmis au modèle | 8 derniers échanges question/réponse |
| Réponse OpenAI | 320 tokens de sortie au maximum |
| Corps JSON des routes vocales | 48 Kio au maximum ; 4 Kio pour la route de configuration côté Worker |
| Session dans le navigateur | Pause automatique après 10 minutes |

La durée de 45 secondes est imposée par l’enregistreur du navigateur. Le serveur borne les octets et les requêtes ; il n’effectue pas une analyse universelle de durée des formats WebM/MP4 reçus.

Les contrôles de volume lisent aussi les corps transmis en plusieurs fragments. L’absence ou l’inexactitude de `Content-Length` ne supprime pas la limite.

## Sécurité, conservation et publication

La session auteur et l’origine des requêtes `POST` sont vérifiées côté serveur. La discussion publique existante ne donne pas accès à ces routes payantes. Les réponses privées utilisent notamment `Cache-Control: private, no-store`.

Les clés sont conservées chiffrées en AES-GCM dans `member_admin_settings`, sous les noms distincts `voice:openai` et `voice:elevenlabs`. Chaque sauvegarde emploie un IV aléatoire ; les données authentifiées lient l’entrée à son fournisseur. La clé du coffre provient du secret serveur existant `OAUTH_SETTINGS_KEY`. Les entrées sauvegardées ont priorité sur les secrets d’environnement `OPENAI_API_KEY` et `ELEVENLABS_API_KEY`. Une entrée illisible bloque l’usage au lieu de réactiver silencieusement une ancienne clé.

Les enregistrements et réponses audio de cette V1 sont traités temporairement en mémoire. Les nouvelles routes ne les archivent pas dans la base du Salon. L’historique affiché reste en mémoire dans le navigateur, avec un maximum de 40 échanges par personnage ; il ne constitue pas une sauvegarde durable et disparaît lors d’un rechargement ou d’une réinitialisation du Salon.

`store: false` désactive le stockage de la réponse dans l’API Responses. Cela ne constitue pas une promesse d’absence de toute conservation technique chez les fournisseurs. Aucun mode de rétention particulier ElevenLabs n’est activé par cette intégration.

La publication exige trois éléments cohérents : les fichiers publics du Salon, le Worker membres et le proxy réellement chargé pour `/api/membres/*`. Le proxy conserve les corps audio et transmet les annulations. Avant le déploiement du Worker, vérifier la prise en charge de `request.signal` dans sa date de compatibilité ou dans ses flags existants, afin que la déconnexion du téléphone se propage aux requêtes fournisseurs.

## Vérifications et essai restant

Le chantier dispose de **54 tests ciblés réussis**, exécutés avec fournisseurs et périphériques simulés, ainsi que d’un `npm run build` terminé avec succès avant cette note. Les tests couvrent les quotas, l’authentification, le chiffrement, les bornes de corps, les refus du micro, le silence, les permissions accordées tardivement, les interruptions, l’arrivée de résultats périmés, la reprise explicite et la récupération du formulaire après une connexion défectueuse.

Ces contrôles n’ont généré aucune conversation facturée. Il reste à connecter les comptes souhaités, puis à réaliser un échange complet sur un téléphone réel : autorisation du micro, reconnaissance du français, écoute de la voix retenue, délai entre les tours, interruption, passage à une autre application et reprise. La qualité de la voix, la latence effective et l’accès aux modèles du compte ne sont pas attestés par les tests simulés.

Cette première version ouvre la conversation dans le navigateur du téléphone. Elle ne provisionne pas de numéro téléphonique, de service opérateur ou de raccordement SIP.

## Fichiers et références

Les principaux fichiers sont `membres/salon-conversation.js`, `membres/salon-conversation-audio.js`, `membres/salon-chat.js`, `membres/salon-dialogue.js`, `membres/voice-conversation.mjs`, `membres/voice-settings.mjs` et `membres/proxy.mjs`. Leurs tests sont intégrés à la construction publique.

Documentation officielle consultée pour l’intégration :

- [OpenAI — transcription de fichiers](https://developers.openai.com/api/docs/guides/speech-to-text).
- [OpenAI — modèle GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna).
- [ElevenLabs — recherche de voix](https://elevenlabs.io/docs/api-reference/voices/search).
- [ElevenLabs — synthèse en flux](https://elevenlabs.io/docs/api-reference/text-to-speech/stream).
- [ElevenLabs — lecture de l’abonnement du compte](https://elevenlabs.io/docs/api-reference/user/subscription/get/).
