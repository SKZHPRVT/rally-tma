import * as THREE from 'three';

export class Track {
  public textures: { [key: string]: THREE.Texture } = {};

  constructor(scene: THREE.Scene) {
    this.loadTextures();
    this.createGround(scene);
    this.createRoad(scene);
    this.scatterTrees(scene);
  }

  loadTextures() {
    const loader = new THREE.TextureLoader();
    const basePath = './assets/cmr/track/';

    // ПРАВИЛЬНЫЕ текстуры (gr_ = дорога, bk_ = обочина, rg_ = земля)
    const texNames = [
      'road1',     // gr_1a — дорога гравий
      'road2',     // gr_1b — дорога гравий вариант
      'mud1',      // m_mg1a — грязь
      'tarmac1',   // t5 — асфальт
      'bank1',     // bk_gr1a — обочина гравий
      'bank2',     // bk_gr2a — обочина гравий
      'bank3',     // bk_gr3a — обочина гравий
      'ground1',   // rg_dcha — земля (сухая)
      'rock1',     // rck_01 — камень
    ];

    for (const name of texNames) {
      const tex = loader.load(
        basePath + name + '.png',
        () => console.log('[track] OK:', name),
        undefined,
        (err) => console.error('[track] FAIL:', name, err)
      );
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      this.textures[name] = tex;
    }
  }

  // ЗЕМЛЯ — сухая, коричневая, с текстурой rg_dcha
  createGround(scene: THREE.Scene) {
    const groundTex = this.textures['ground1'].clone();
    groundTex.needsUpdate = true;
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(150, 150);

    const geo = new THREE.PlaneGeometry(3000, 3000, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ map: groundTex });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // ДОРОГА — центр (gr) + обочины (bk)
  createRoad(scene: THREE.Scene) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 80; i++) {
      const z = -i * 20;
      const x = Math.sin(i * 0.3) * 30;
      points.push(new THREE.Vector3(x, 0.05, z));
    }

    // Чередуем как CMR
    const roadVariants = ['road1', 'road2', 'road1', 'mud1'];
    const bankVariants = ['bank1', 'bank2', 'bank3'];

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const dir = b.clone().sub(a).normalize();
      const angle = Math.atan2(dir.x, dir.z);

      // ЦЕНТР — дорога (gr_)
      this.addStrip(scene, mid, angle, roadVariants[i % roadVariants.length], 6, 0);

      // ЛЕВАЯ ОБОЧИНА — bank
      this.addStrip(scene, mid, angle, bankVariants[i % 3], 3, -4.5);

      // ПРАВАЯ ОБОЧИНА — bank
      this.addStrip(scene, mid, angle, bankVariants[i % 3], 3, 4.5);
    }
  }

  addStrip(
    scene: THREE.Scene,
    mid: THREE.Vector3,
    angle: number,
    texName: string,
    width: number,
    offsetX: number
  ) {
    const tex = this.textures[texName].clone();
    tex.needsUpdate = true;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(width / 4, 20 / 4);

    const mat = new THREE.MeshStandardMaterial({ map: tex });
    const geo = new THREE.PlaneGeometry(width, 20);
    const strip = new THREE.Mesh(geo, mat);

    const offset = new THREE.Vector3(offsetX, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      angle
    );

    strip.position.copy(mid).add(offset);
    strip.position.y = 0.05;
    strip.rotation.x = -Math.PI / 2;
    strip.rotation.z = angle;
    strip.receiveShadow = true;
    scene.add(strip);
  }

  scatterTrees(scene: THREE.Scene) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d5016 });

    for (let i = 0; i < 250; i++) {
      const z = (Math.random() - 0.5) * 1500;
      const roadX = Math.sin(-z / 20 * 0.3) * 30;
      const side = Math.random() > 0.5 ? 1 : -1;
      const offset = 15 + Math.random() * 50;
      const x = roadX + side * offset;

      const tree = new THREE.Group();

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 3, 6), trunkMat
      );
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);

      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(2, 4, 6), leafMat
      );
      leaves.position.y = 4.5;
      leaves.castShadow = true;
      tree.add(leaves);

      tree.position.set(x, 0, z);
      scene.add(tree);
    }
  }
}
