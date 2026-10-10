/* Shared procedural 3D interpretations for the supplied book illustrations. */
(function () {
  const AFRAME = window.AFRAME;
  if (!AFRAME) return;

  AFRAME.registerComponent('jharokha-art-model', {
    schema: { kind: { default: 'diorama' } },
    init() {
      const THREE = AFRAME.THREE;
      const root = this.el.object3D;
      this.materials = {};
      const material = (color, roughness = .9) => {
        if (!this.materials[color]) this.materials[color] = new THREE.MeshStandardMaterial({ color, roughness });
        return this.materials[color];
      };
      const add = (geometry, color, x, y, z, parent = root) => {
        const m = new THREE.Mesh(geometry, material(color));
        m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
        parent.add(m); return m;
      };
      const box = (w,h,d,c,x,y,z,p=root) => add(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);
      const ball = (x,y,z,sx,sy,sz,c,p=root) => { const m=add(new THREE.IcosahedronGeometry(1,1),c,x,y,z,p); m.scale.set(sx,sy,sz); return m; };
      const cyl = (a,b,h,c,x,y,z,p=root,n=9) => add(new THREE.CylinderGeometry(a,b,h,n),c,x,y,z,p);
      const group = (x=0,y=0,z=0,p=root) => { const g=new THREE.Group(); g.position.set(x,y,z); p.add(g); return g; };
      const stick = (x1,y1,z1,x2,y2,z2,r,c,p=root) => {
        const a=new THREE.Vector3(x1,y1,z1), b=new THREE.Vector3(x2,y2,z2), d=b.clone().sub(a);
        const m=add(new THREE.CylinderGeometry(r*.7,r,d.length(),7),c,(x1+x2)/2,(y1+y2)/2,(z1+z2)/2,p);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); return m;
      };
      const tree = (x,z,scale=1) => {
        const g=group(x,.04,z); g.scale.setScalar(scale);
        cyl(.045,.075,.44,'#75482e',0,.22,0,g,10);
        [[-.2,.48,0],[-.13,.55,.01],[.04,.49,0],[.18,.57,0],[.24,.46,0]].forEach(([bx,by,bz])=>stick(0,.34,0,bx,by,bz,.027,'#75482e',g));
        const crown=group(0,.6,0,g);
        [[0,0,0],[.13,.02,0],[-.14,.02,.01],[.03,.1,.04],[-.08,.12,-.03],[.21,.08,0],[-.22,.08,0]].forEach(([lx,ly,lz],i)=>ball(lx,ly,lz,.15,.105,.12,i%2?'#78833c':'#626f32',crown));
        this.sway.push({object:crown,phase:x*3});
      };
      const person = (x,z,coat='#a64437',pose='stand') => {
        const g=group(x,.06,z);
        cyl(.04,.045,.22,'#eee0c5',-.045,.11,0,g,7).rotation.z=-.08;
        cyl(.04,.045,.22,'#eee0c5',.045,.11,0,g,7).rotation.z=.08;
        ball(0,.37,0,.095,.11,.09,'#bf815d',g);
        const torso=add(new THREE.ConeGeometry(.13,.28,7),coat,0,.25,0,g);
        torso.scale.z=.75;
        ball(0,.46,0,.105,.055,.10,'#9c3530',g);
        stick(-.10,.32,0,pose==='reach'?.03:.0,.27,.03,.027,coat,g);
        stick(.10,.32,0,.12,.18,.03,.027,coat,g);
        if(pose==='staff') stick(.16,.02,.05,.16,.68,.05,.018,'#6b442d',g);
        if(pose==='axe') { stick(.18,.34,.02,.28,.57,.02,.015,'#68472e',g); box(.08,.11,.035,'#b2b6b3',.31,.58,.02,g); }
      };
      const hut = (x,z,s=1) => {
        const g=group(x,.055,z); g.scale.setScalar(s);
        box(.32,.20,.25,'#d1a263',0,.1,0,g);
        box(.07,.015,.14,'#50382c',0,.07,.132,g);
        const roof=add(new THREE.ConeGeometry(.25,.18,8),'#a96938',0,.29,0,g); roof.rotation.x=Math.PI/2;
        box(.36,.025,.29,'#864934',0,.205,0,g);
      };
      const bloom = (x,z,s=1) => {
        const g=group(x,.08,z); g.scale.setScalar(s);
        cyl(.012,.021,.25,'#526e39',0,.125,0,g,7);
        const petals=group(0,.27,0,g);
        for(let i=0;i<10;i++) { const a=i*Math.PI/5; const p=ball(Math.cos(a)*.075,Math.sin(a)*.035,Math.sin(a)*.075,.07,.022,.115,i%2?'#d55b68':'#e8837b',petals); p.rotation.y=a; }
        ball(0,0,0,.052,.034,.052,'#e4b34a',petals); this.sway.push({object:g,phase:x*2});
      };
      const animal = (x,z,color='#a77545',horns=false) => {
        const g=group(x,.06,z);
        ball(0,.17,0,.18,.09,.075,color,g);
        stick(.10,.2,0,.18,.34,0,.035,color,g);
        ball(.2,.37,0,.075,.065,.06,color,g);
        for(let i=0;i<4;i++) cyl(.012,.017,.15,'#654c37',-.11+(i%2)*.18,.075,(i<2?-.045:.045),g,6);
        if(horns) { stick(.18,.40,0,.14,.50,-.015,.011,'#e0c797',g); stick(.22,.40,0,.27,.50,-.015,.011,'#e0c797',g); }
      };

      this.sway=[];
      root.rotation.x=Math.PI/2;
      root.scale.setScalar(.64);
      this.el.object3D.position.y=-.11;
      this.risePending=false; this.rising=false;
      this.onFound=()=>{this.risePending=true;this.rising=true;};
      if(this.el.parentEl) this.el.parentEl.addEventListener('targetFound',this.onFound);

      // A little stage lip gives each small model a shared book-like base.
      cyl(.50,.50,.035,'#815133',0,.005,0,root,12);
      cyl(.47,.47,.025,'#d7ad68',0,.03,0,root,12);
      switch(this.data.kind) {
        case 'tree': tree(0,.02,1.12); break;
        case 'flower': bloom(0,0,1.4); bloom(-.25,-.14,.72); break;
        case 'village':
          ball(0,.09,-.13,.47,.12,.25,'#d39a49',root);
          hut(-.26,.02,.75); hut(.25,.03,.78);
          tree(-.48,.13,.58); tree(.47,.14,.52); break;
        case 'panel':
          [-.24,.24].forEach(x=>{ box(.39,.10,.55,'#74452f',x,.12,0); box(.31,.035,.46,'#b27940',x,.185,0); box(.045,.025,.31,'#e7c983',x,.21,0); });
          break;
        case 'story': tree(-.12,.04,.94); person(.04,.12,'#a33336','reach'); person(.28,-.12,'#315c48','reach'); break;
        case 'animals': animal(-.22,.06,'#a8703e',true); animal(.23,-.08,'#c4a875',false); ball(.04,.12,.1,.06,.045,.06,'#8b6544',root); break;
        case 'horse':
          animal(0,.02,'#eee0c4',false);
          person(-.03,.02,'#b53b36','stand');
          break;
        case 'instrument':
          box(.66,.11,.38,'#80502f',0,.10,0); box(.57,.035,.31,'#d0a05b',0,.17,0);
          for(let i=0;i<9;i++) { const x=-.24+i*.06; stick(x,.195,-.13,x,.195,.13,.002,'#f5e4bd',root); }
          box(.72,.025,.045,'#68412e',0,.205,-.16); box(.72,.025,.045,'#68412e',0,.205,.16);
          for(let i=0;i<7;i++) cyl(.012,.012,.09,'#9a673d',-.26+i*.086,.23,-.205,root,6);
          break;
        case 'attendant': person(0,0,'#b34135','staff'); break;
        case 'foliage':
          stick(-.34,.05,0,.32,.3,0,.025,'#76502f',root);
          for(let i=0;i<9;i++) { const x=-.28+i*.07; const leaf=ball(x,.24+(i%3)*.055,(i%2?1:-1)*.04,.12,.022,.065,i%2?'#355d34':'#517443',root); leaf.rotation.z=(i%2?-.55:.55); }
          break;
        default: hut(-.2,.02,.8); tree(.22,.04,.8); break;
      }
    },
    tick(time) {
      if(this.risePending){this.riseStart=time;this.risePending=false;}
      if(this.rising){const p=Math.min((time-this.riseStart)/950,1);this.el.object3D.position.y=-.11*(1-(1-Math.pow(1-p,3)));if(p>=1)this.rising=false;}
      this.sway.forEach(({object,phase})=>{object.rotation.z=Math.sin(time*.00065+phase)*.035;});
    },
    remove() {
      if(this.el.parentEl&&this.onFound)this.el.parentEl.removeEventListener('targetFound',this.onFound);
      Object.values(this.materials||{}).forEach(m=>m.dispose());
    }
  });
})();
