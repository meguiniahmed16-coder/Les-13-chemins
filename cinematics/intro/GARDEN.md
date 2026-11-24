# Actual V27 garden and butterfly footage

This six-second segment uses the existing garden and house from `membres/v27/scene.js` and `assets/depart-duo/scene.bin`. It follows the salon and dice segments in the introduction film.

`prepare-garden.mjs` executes the original static room and garden construction code. The exported scene contains 215 objects, 607,251 vertices and 322,543 triangles, including 20 camera-facing planting sprites. The house, path, planting positions, mesh instances, colors, UV coordinates and texture maps come from the source scene. The original procedural Canvas texture commands are rasterized through SVG; no replacement garden is designed or generated.

`export-butterflies.mjs` separately executes the original butterfly constructor and `flutter(dt)` function. It exports the original Body, Wing_Left and Wing_Right meshes, the `papillon-blanc.webp` texture, and transforms for all 76 original butterfly instances. The simulation runs at its original 60 Hz and is sampled at 20 frames per second. It preserves the original deterministic seed, watcher anchors, instance sizes, flight paths and wing beats. `garden-butterflies.py` imports these sampled matrices into Blender without adding a different flight animation or enlarging the insects.

`render-garden.py` renders the exported geometry with Blender's CPU Cycles renderer. Its material translation retains the source colors, base-color and occlusion maps, alpha cutouts, opacity and roughness. The original sun and fill directions and colors are translated to offline lights, with a constant material ambient contribution approximating the browser's hemisphere illumination. This is an offline render of the actual project geometry and animation, not a pixel-identical browser recording.

The camera advances along the existing path from `(1.40, 1.35, -3.00)` to `(0.50, 1.25, -0.50)` in the original Three.js coordinate system, looking toward `(0.10, 2.00, 8.30)`. It uses an eased continuous movement and a 21 mm Blender lens. The approved framing keeps the house, planting beds and moving butterflies visible throughout the shot.

## Reproduce

Run these commands from the repository root. Keep geometry, textures, frames and the individual clip in a temporary directory outside the repository.

Requirements: project Node dependencies, Inkscape for the source Canvas textures, Blender 4.3 with its bundled Python/numpy, and FFmpeg with H.264 support. No browser or network access is required.

```sh
npm ci
node cinematics/intro/prepare-garden.mjs /tmp/les13-garden-film
node cinematics/intro/export-butterflies.mjs /tmp/les13-garden-film 6 20
blender -b --threads 8 --python cinematics/intro/render-garden.py -- /tmp/les13-garden-film --resume
ffmpeg -framerate 20 -i /tmp/les13-garden-film/frames/%04d.png -vf hqdn3d=6:6:8:8 -r 20 -fps_mode cfr -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart -an /tmp/les13-garden-film/garden-6s.mp4
```

Add `--preview` to the Blender command to render only the first and last frames. The default output is 120 frames at 800 × 450 pixels, 20 frames per second. `--resume` keeps completed PNG frames after an interruption. `--seconds`, `--fps` and `--samples` are optional overrides; changes to the duration or frame rate also require a corresponding butterfly export.

The exporter records the source hashes in the temporary `provenance.json` and `butterflies.json`. The compact `garden-provenance.json` beside these instructions preserves the exact source and encoded clip information used by the combined reel. The public deliverable is the combined salon, dice and garden film; the separate garden clip is a build intermediate.
