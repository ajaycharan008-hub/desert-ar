/* Procedural miniature for the one target currently compiled in targets.mind.
   It combines genuine A-Frame geometry with the supplied transparent cutouts. */
(function () {
  const AFRAME = window.AFRAME;
  if (!AFRAME) return;

  AFRAME.registerComponent('desert-miniature', {
    init() {
      this.materials = {};
      const root = this.el.object3D;
      const THREE = AFRAME.THREE;

      const mat = (name, color, roughness = 0.92) => {
        if (!this.materials[name]) this.materials[name] = new THREE.MeshStandardMaterial({ color, roughness });
        return this.materials[name];
      };
      const mesh = (geometry, material, x, y, z, parent = root) => {
        const item = new THREE.Mesh(geometry, material);
        item.position.set(x, y, z);
        item.castShadow = true;
        item.receiveShadow = true;
        parent.add(item);
        return item;
      };
      const box = (w, h, d, color, x, y, z, parent = root) => mesh(new THREE.BoxGeometry(w, h, d), mat(`box-${color}`, color), x, y, z, parent);
      const sphere = (sx, sy, sz, color, x, y, z, parent = root, detail = 1) => {
        const item = mesh(new THREE.IcosahedronGeometry(1, detail), mat(`sphere-${color}`, color), x, y, z, parent);
        item.scale.set(sx, sy, sz);
        return item;
      };
      const cylinder = (rt, rb, h, color, x, y, z, parent = root, sides = 9) => mesh(new THREE.CylinderGeometry(rt, rb, h, sides), mat(`cyl-${color}`, color), x, y, z, parent);
      const texturePlane = (src, w, h, x, y, z, rotation = -Math.PI / 2, opacity = 1) => {
        const texture = new THREE.TextureLoader().load(src);
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
        const plane = mesh(new THREE.PlaneGeometry(w, h), material, x, y, z);
        plane.rotation.x = rotation;
        return plane;
      };

      // The page plane is X/Z; local Y is the miniature's real height.
      root.rotation.x = Math.PI / 2;
      root.scale.setScalar(0.72);
      this.el.object3D.position.y = -0.14;

      // Illustrated horizon panel, floating slightly behind the modeled relief.
      texturePlane('./Images/2_Background_Desert_Village.png', 1.65, 0.70, 0, 0.012, 0.03, -Math.PI / 2, 0.96);
      box(1.68, 0.035, 0.73, '#84502f', 0, 0.006, 0.03);
      box(1.62, 0.022, 0.67, '#d7a95d', 0, 0.027, 0.03);

      // Layered, faceted dunes create real volume in front of the illustrated back panel.
      sphere(0.77, 0.13, 0.26, '#c9873c', 0, 0.105, -0.10, root, 2);
      sphere(0.46, 0.10, 0.22, '#e0a24e', -0.38, 0.14, -0.17, root, 1);
      sphere(0.49, 0.12, 0.22, '#bd7437', 0.40, 0.12, -0.12, root, 1);
      for (let i = 0; i < 17; i++) {
        const x = -0.73 + (i % 9) * 0.18;
        const z = -0.22 + Math.floor(i / 9) * 0.16;
        sphere(0.028 + (i % 3) * 0.009, 0.018, 0.026, i % 2 ? '#8b6336' : '#f0bf68', x, 0.18, z, root, 0);
      }

      // Two hand-shaped village homes: thick walls, inset dark door, lintel and rounded roof.
      const home = (x, z, scale = 1) => {
        const g = new THREE.Group();
        g.position.set(x, 0.10, z);
        g.scale.setScalar(scale);
        root.add(g);
        box(0.27, 0.20, 0.22, '#d8aa68', 0, 0.10, 0, g);
        box(0.075, 0.14, 0.012, '#52352a', 0.015, 0.075, 0.117, g);
        box(0.12, 0.025, 0.16, '#965238', 0, 0.225, 0, g);
        const roof = mesh(new THREE.ConeGeometry(0.19, 0.14, 8), mat('thatch', '#a86f37'), 0, 0.29, 0, g);
        roof.rotation.y = Math.PI / 8;
        for (let i = -2; i <= 2; i++) box(0.014, 0.012, 0.18, '#f0d394', i * 0.045, 0.18, 0.116, g);
      };
      home(-0.52, -0.03, 0.72);
      home(0.56, -0.01, 0.78);

      // Khejri tree, modeled from trunk, forked branches and clustered foliage.
      const tree = new THREE.Group();
      tree.position.set(-0.27, 0.09, 0.12);
      root.add(tree);
      cylinder(0.042, 0.075, 0.42, '#68402c', 0, 0.22, 0, tree, 10);
      const branch = (x1, y1, z1, x2, y2, z2, radius) => {
        const a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2);
        const d = new THREE.Vector3().subVectors(b, a);
        const limb = mesh(new THREE.CylinderGeometry(radius * 0.58, radius, d.length(), 7), mat('bark', '#75452c'), (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, tree);
        limb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      };
      [[-0.22,0.47,-0.01],[-0.13,0.56,0.015],[0.03,0.48,0],[0.18,0.58,-0.01],[0.23,0.45,0.01]].forEach(([x,y,z]) => branch(0,0.34,0,x,y,z,0.026));
      const canopy = new THREE.Group();
      canopy.position.y = 0.58;
      tree.add(canopy);
      [[0,0,0],[.12,.02,0],[-.13,.01,0],[.03,.1,.035],[-.08,.11,-.02],[.2,.08,0],[-.21,.08,.01]].forEach(([x,y,z], i) =>
        sphere(0.15,0.105,0.105,i%3===0?'#657331':'#77823a',x,y,z,canopy,1));
      canopy.userData.rest = canopy.rotation.z;
      this.canopy = canopy;

      // A readable pop-up flower with layered petals, not a billboard image.
      const flower = new THREE.Group();
      flower.position.set(-0.60, 0.07, 0.03);
      root.add(flower);
      cylinder(0.012, 0.018, 0.22, '#4e6b38', 0, 0.11, 0, flower, 7);
      for (let i = 0; i < 9; i++) {
        const angle = i * Math.PI * 2 / 9;
        const petal = sphere(0.045,0.018,0.085,i%2?'#db6f78':'#ed8c87',Math.sin(angle)*0.055,0.245,Math.cos(angle)*0.055,flower,1);
        petal.rotation.y = angle;
      }
      sphere(0.04,0.026,0.04,'#e8c15b',0,0.245,0,flower,1);
      flower.userData.rest = flower.rotation.z;
      this.flower = flower;

      // Camel is assembled as a rig so the walk and head motion animate independently.
      const camel = new THREE.Group();
      camel.position.set(0.40, 0.09, 0.11);
      root.add(camel);
      sphere(0.20,0.105,0.085,'#a86535',0,0.18,0,camel,2);
      sphere(0.07,0.09,0.064,'#96552f',-0.035,0.28,0,camel,1);
      const neck = cylinder(0.035,0.055,0.22,'#b57843',0.14,0.32,0,camel,9);
      neck.rotation.z = -0.30;
      sphere(0.07,0.05,0.052,'#b57843',0.23,0.43,0,camel,1);
      sphere(0.04,0.026,0.03,'#d19a61',0.28,0.41,0.005,camel,1);
      box(0.17,0.035,0.14,'#8f3430',-0.02,0.29,0,camel);
      box(0.14,0.018,0.15,'#d7ae4d',-0.02,0.315,0,camel);
      this.legs = [];
      [[-.12,0.08,.045],[-.04,.08,-.045],[.09,.08,.045],[.15,.08,-.045]].forEach(([x,y,z],i) => {
        const leg = cylinder(0.014,0.019,0.17,'#75482e',x,y,z,camel,7);
        leg.rotation.z = 0.04;
        this.legs.push({ mesh: leg, phase: i % 2 ? Math.PI : 0 });
      });

      // The supplied transparent cutouts are kept as art layers behind the modeled forms.
      texturePlane('./Images/1_Khejri_Tree.png', 0.58, 0.49, -0.30, 0.035, 0.08, -Math.PI / 2, 0.48);
      texturePlane('./Images/5_Animals.png', 0.43, 0.21, 0.51, 0.035, 0.06, -Math.PI / 2, 0.92);
      texturePlane('./Images/5_Mounted_Ruler.png', 0.26, 0.28, 0.55, 0.04, -0.12, -Math.PI / 2, 0.62);

      // Small ambient glints in the sunlit air.
      this.dust = [];
      for (let i = 0; i < 12; i++) {
        const mote = sphere(0.006,0.006,0.006,'#ffe1a1',-0.72 + (i*0.131)%1.44,0.25+(i%4)*0.035,-0.26+(i%5)*0.11,root,0);
        this.dust.push({ mesh: mote, phase: i * 0.7, baseY: mote.position.y });
      }

      this.startedAt = null;
      this.risePending = false;
      this.rising = false;
      this.riseStart = 0;
      this.onFound = () => { this.risePending = true; this.rising = true; };
      const targetEntity = this.el.parentEl;
      if (targetEntity) targetEntity.addEventListener('targetFound', this.onFound);
    },
    tick(time) {
      if (this.startedAt === null) this.startedAt = time;
      const t = (time - this.startedAt) / 1000;
      if (this.risePending) { this.riseStart = time; this.risePending = false; }
      if (this.rising) {
        const progress = Math.min((time - this.riseStart) / 1200, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        this.el.object3D.position.y = -0.14 * (1 - eased);
        if (progress >= 1) this.rising = false;
      }
      this.el.object3D.rotation.y = Math.sin(t * 0.36) * 0.012;
      if (this.canopy) this.canopy.rotation.z = Math.sin(t * 0.72) * 0.035;
      if (this.flower) this.flower.rotation.z = Math.sin(t * 0.55 + 1.4) * 0.045;
      if (this.legs) this.legs.forEach(({mesh, phase}) => { mesh.rotation.z = Math.sin(t * 3.0 + phase) * 0.18; });
      if (this.dust) this.dust.forEach(({mesh, phase, baseY}) => { mesh.position.y = baseY + Math.sin(t * 0.7 + phase) * 0.022; });
    },
    remove() {
      const targetEntity = this.el.parentEl;
      if (targetEntity && this.onFound) targetEntity.removeEventListener('targetFound', this.onFound);
      Object.values(this.materials || {}).forEach(material => material.dispose());
    }
  });
})();
