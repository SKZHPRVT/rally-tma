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
    const texNames = ['gravel1', 'gravel2', 'gravel3', 'mud1', 'rock1', 'tarmac1', 'grass1'];

    for (const name of texNames) {
      const tex = loader.load(basePath + name + '.png');
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      this.textures[name] = tex;
      console.log('[track] loaded:', name);
    }
  }

  createGround(scene: THREE.Scene) {
    const grassTex = this.textures['grass1'].clone();
    grassTex.needsUpdate = true;
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(150, 150);

    const geo = new THREE.PlaneGeometry(3000, 3000, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ map: grassTex });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  createRoad(scene: THREE.Scene) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 80; i++) {
      const z = -i * 20;
      const x = Math.sin(i * 0.3) * 30;
      points.push(new THREE.Vector3(x, 0.05, z));
    }

    const roadVariants = ['gravel1', 'gravel2', 'gravel3'];
    const bankVariants = ['rock1', 'gravel2', 'mud1'];

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const dir = b.clone().sub(a).normalize();
      const angle = Math.atan2(dir.x, dir.z);

      this.addStrip(scene, mid, angle, roadVariants[i % 3], 6, 0);
      this.addStrip(scene, mid, angle, bankVariants[i % 3], 3, -4.5);
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
      new THREE.Vector3(0, 1, 0), angle
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
        new THREE.CylinderGeometry(0.3, 0.4, 3, 6),
        trunkMat
      );
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);

      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(2, 4, 6),
        leafMat
      );
      leaves.position.y = 4.5;
      leaves.castShadow = true;
      tree.add(leaves);

      tree.position.set(x, 0, z);
      scene.add(tree);
    }
  }
}
