# Introduction film: the salon, game board and butterfly garden

The public reel is `assets/membres/intro-montage-reel23.mp4`, with a matching WebP poster. It lasts 21 seconds at 800 × 450 and 20 frames per second, without audio or embedded interface controls.

The first eight seconds move the camera through the current salon's original geometry, furnishings and textures. See `SALON.md` for the source extraction, exact fidelity boundary and reproducible render commands. The next seven seconds show two animated dice rolling and settling on the current first chapter's game artwork. The board uses the three original sprite crops in `chapitre1-plateau.js`, its current labels and color scheme, and the six pip arrangements and final face orientations from `jeu.html` and `voyage.js`. It does not use the obsolete full-board illustration. The final six seconds show the existing garden and house with the original butterflies, animated using the site's own flight and wing-motion functions. See `GARDEN.md` for that segment's reproduction and source details.

The board shot is a cinematic arrangement of these existing game elements, not a recording of an active player's progress. The salon shot is an offline render of the actual room, with its original layout; lighting is translated to the offline renderer. No AI images or invented replacement room are used.

## Reproduce the board shot

From the repository root, with Python Pillow, fontconfig, Blender and FFmpeg installed:

```sh
python scripts/render-intro-dice.py --out /tmp/les13-dice-film
```

The generator reads the current source crop coordinates, labels, dice faces and rotation endpoints, saves its source hashes in `provenance.json`, and writes `intro-des-plateau.mp4` in that temporary directory. The intermediate board texture and numbered frames stay outside the repository.

## Assemble the public reel

After rendering the salon and garden with the commands in `SALON.md` and `GARDEN.md`:

```sh
python scripts/compose-intro-reel.py --salon /tmp/les13-salon-film/salon-v27-8s.mp4 --dice /tmp/les13-dice-film/intro-des-plateau.mp4 --garden /tmp/les13-garden-film/garden-6s.mp4
```

The composition script verifies the three source durations, joins them in that order, writes a streaming-friendly H.264 file and derives its poster from the encoded first frame.

The introduction preloads this single video. It plays from 0 to 7 seconds on the original TV display, then continues from 7 seconds into the full-frame montage. Character dialogue uses actual speech bubbles inside the scene, with the body fixed for each reply and a small pointer toward its speaker. The whole camera path is considered to keep both faces clear; tight framing reserves space above the actors without adding a footer caption. Reporting an error pauses it; closing the report resumes it. Skipping the introduction stops it and enters the garden.

The source hashes and media metadata used for this published reel are recorded beside these instructions. The build copies the verified encoded assets; it does not re-render them on every deployment.
