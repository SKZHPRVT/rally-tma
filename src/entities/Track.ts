import * as THREE from 'three';

export class Track {
  private textures: { [key: string]: THREE.Texture } = {};

  constructor(scene: THREE.Scene) {
    this.loadTextures();
    this.createGround(scene);
    this.createRoad(scene);
    this.scatterTrees(scene);
  }

  loadTextures() {
    const loader = new THREE.TextureLoader();
    const basePath = '/assets/cmr/track/';
    const texNames = ['gravel1', 'gravel2', 'gravel3', 'mud1', 'rock1', 'tarmac1', 'grass1'];

    for (const name of texNames) {
      const tex = loader.load(basePath + name + '.png');
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.colorSpace = THREE.SRGBColorSpace;
      this.textures[name] = tex;
    }
    console.log('[track] textures loaded:', Object.keys(this.textures));
  }

  createGround(scene: THREE.Scene) {
    const grassTex = this.textures['grass1'];
    grassTex.repeat.set(200, 200);

    const groundGeo = new THREE.PlaneGeometry(2000, 2000, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({ map: grassTex, color: 0xffffff });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // Дорога = 3 полосы: gravel (центр), bank (обочины)
  createRoad(scene: THREE.Scene) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 50; i++) {
      const z = -i * 20;
      const x = Math.sin(i * 0.3) * 30;
      points.push(new THREE.Vector3(x, 0.05, z));
    }

    // Варианты текстур для чередования (как CMR: gr_1a, gr_1b, gr_1c)
    const roadVariants = ['gravel1', 'gravel2', 'gravel3'];
    const bankVariants = ['rock1', 'gravel2', 'mud1'];

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];

      const mid = a.clone().add(b).multiplyScalar(0.5);
      const dir = b.clone().sub(a).normalize();
      const angle = Math.atan2(dir.x, dir.z);

      // === ПОЛОСА 1: ЦЕНТР ДОРОГИ — GRAVEL ===
      const roadTexName = roadVariants[i % roadVariants.length];
      const roadTex = this.textures[roadTexName].clone();
      roadTex.needsUpdate = true;
      roadTex.wrapS = THREE.RepeatWrapping;
      roadTex.wrapT = THREE.RepeatWrapping;
      roadTex.repeat.set(2, 4);

      const roadMat = new THREE.MeshStandardMaterial({ map: roadTex });
      const roadGeo = new THREE.PlaneGeometry(6, 20);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.copy(mid);
      road.position.y = 0.05;
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = angle;
      road.receiveShadow = true;
      scene.add(road);

      // === ПОЛОСА 2: ЛЕВАЯ ОБОЧИНА — BANK ===
      this.createSideStrip(scene, mid, angle, bankVariants[i % bankVariants.length], -5);

      // === ПОЛОСА 3: ПРАВАЯ ОБОЧИНА — BANK ===
      this.createSideStrip(scene, mid, angle, bankVariants[i % bankVariants.length], 5);
    }
  }

  createSideStrip(scene: THREE.Scene, mid: THREE.Vector3, angle: number, texName: string, offsetX: number) {
    const tex = this.textures[texName].clone();
    tex.needsUpdate = true;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 6);

    const mat = new THREE.MeshStandardMaterial({ map: tex });
    const geo = new THREE.PlaneGeometry(4, 20);
    const strip = new THREE.Mesh(geo, mat);

    // Смещаем вбок перпендикулярно дороге
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

    for (let i = 0; i < 200; i++) {
      const x = (Math.random() - 0.5) * 600;
      const z = (Math.random() - 0.5) * 1200 - 400;

      const roadX = Math.sin(-z / 20 * 0.3) * 30;
      // Деревья дальше 12м от дороги
      if (Math.abs(x - roadX) < 12) continue;

      const tree = new THREE.Group();

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 6), trunkMat);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);

      const leaves = new THREE.Mesh(new THREE.ConeGeometry(2, 4, 6), leafMat);
      leaves.position.y = 4.5;
      leaves.castShadow = true;
      tree.add(leaves);

      tree.position.set(x, 0, z);
      scene.add(tree);
    }
  }
}
