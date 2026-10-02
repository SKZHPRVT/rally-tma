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

  // ЗЕМЛЯ — на y=0, depthWrite: false чтобы не конфликтовать с дорогой
  createGround(scene: THREE.Scene) {
    const geo = new THREE.PlaneGeometry(3000, 3000, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x5a6b3a,
      depthWrite: false,           // ← не пишем в depth buffer
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.renderOrder = 0;         // ← рисуется первым
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // ДОРОГА — на y=0.15, polygonOffset чтобы всегда быть поверх земли
  createRoad(scene: THREE.Scene) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 80; i++) {
      const z = -i * 20;
      const x = Math.sin(i * 0.3) * 30;
      points.push(new THREE.Vector3(x, 0.15, z)); // ← y=0.15
    }

    const texName = 'gravel1';
    const tex = this.textures[texName].clone();
    tex.needsUpdate = true;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.5, 5);

    const roadMat = new THREE.MeshStandardMaterial({
      map: tex,
      polygonOffset: true,           // ← сдвигаем глубину
      polygonOffsetFactor: -1,       // ← ближе к камере
      polygonOffsetUnits: -1,
    });

    const roadWidth = 6;
    const segmentLength = 20;

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const dir = b.clone().sub(a).normalize();
      const angle = Math.atan2(dir.x, dir.z);

      const geo = new THREE.PlaneGeometry(roadWidth, segmentLength + 2);
      const road = new THREE.Mesh(geo, roadMat);

      road.position.copy(mid);
      road.position.y = 0.15;
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = angle;
      road.renderOrder = 1;          // ← рисуется после земли
      road.receiveShadow = true;
      scene.add(road);
    }
  }

  // ДЕРЕВЬЯ
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
