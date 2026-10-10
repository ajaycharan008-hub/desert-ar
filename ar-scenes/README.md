# AR scene modules

`desert-scene.js` registers the `desert-miniature` A-Frame component. It creates the page-0 miniature with Three.js meshes and loads the local illustrated cutouts as texture planes.

The target index is controlled in `index.html` and must match the image order inside `targets.mind`. New pages should each receive a dedicated scene component and target anchor after the full printed page images have been compiled together.
