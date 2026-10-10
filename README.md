# Jharokha — Living Rajasthan AR

Scan any prepared illustration in the book to show its matching procedural 3D miniature. The current target set contains the desert panorama plus the 18 PNG illustrations under `Images/`.

## How it works

- `tools/prepare-targets.py` crops empty transparent/white margins into new files under `Images/targets/`. It never changes the original artwork.
- `Images/targets/target-manifest.json` records the exact target-index order and the 3D scene kind for each image.
- `tools/compile-targets.html` compiles those local target copies into one `targets.mind` file in the browser. The images stay on the local project server; the compiler JavaScript is fetched from jsDelivr.
- `index.html` creates one MindAR image anchor per manifest entry.
- `ar-scenes/desert-scene.js` builds the desert village miniature; `ar-scenes/art-models.js` builds matching tree, flower, village, panel, story, animal, horse, instrument, attendant, and foliage scenes.

## Build or refresh the target set

1. Keep the original image files in `Images/`. Add a complete printed-page scan there too if you want to recognize that page as a target.
2. Run `python tools/prepare-targets.py` (requires Pillow) to refresh the cropped copies and ordered manifest.
3. Serve the repository over localhost or HTTPS. Open `tools/compile-targets.html`, press **Compile target set**, and save the downloaded `targets.mind` at the repository root, replacing the old one.
4. Publish the updated project to GitHub Pages. On a phone, open the HTTPS site, tap **Start camera**, and scan any target artwork.

The target order is deliberate: index 0 is `desert-original.png`; indexes 1–18 follow the case-insensitive filename order of `Images/*.png`. Keep the manifest and compiled `targets.mind` together. The compiler page lists feature counts after compilation; targets with little visual detail may not track reliably. Full-page scans are usually the strongest targets, especially for mostly white assembly sheets or simple petal/leaf shapes.

The models are stylized, hand-built geometry in JavaScript, with small animations. A single flat image cannot automatically provide a photorealistic 3D reconstruction; the scene for each illustration is a matching 3D interpretation. Additional full-page artwork can be added to `Images/` and will be included by the preparation script.
