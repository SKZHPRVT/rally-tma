import * as THREE from 'three';

export class Track {
  public textures: { [key: string]: THREE.Texture } = {};
  public roadPoints: THREE.Vector3[] = [];

  constructor(scene: THREE.Scene) {
    this.loadTextures();
    this.createGround(scene);
    this.createRingRoad(scene);
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
    }
    console.log('[track] textures loaded');
  }

  // ЗЕМЛЯ
  createGround(scene: THREE.Scene) {
    const geo = new THREE.PlaneGeometry(3000, 3000, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x5a6b3a,
      depthWrite: false,
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.renderOrder = 0;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // КОЛЬЦЕВАЯ ДОРОГА
  createRingRoad(scene: THREE.Scene) {
    const numPoints = 64;             // много точек = плавный круг
    const baseRadius = 350;           // радиус кольца
    const centerX = 0;
    const centerZ = -400;             // сместим кольцо вперёд, чтобы спавн был на дороге
    
    this.roadPoints = [];
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      
      // Небольшое варьирование радиуса — дорога не идеальный круг
      const noiseVal = Math.sin(i * 1.3) * 0.15 + Math.sin(i * 0.5) * 0.1;
      const radius = baseRadius + noiseVal * 100;
      
      const x = centerX + Math.cos(angle) * radius;
      const z = centerZ + Math.sin(angle) * radius;
      
      this.roadPoints.push(new THREE.Vector3(x, 0.15, z));
    }
    
    // Замыкаем кольцо
    this.roadPoints.push(this.roadPoints[0].clone());

    // Создаём сегменты дороги
    const roadWidth = 9;             // ШИРЕ (было 6)
    const segmentLength = this.roadPoints[0].distanceTo(this.roadPoints[1]);

    const tex = this.textures['gravel1'].clone();
    tex.needsUpdate = true;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(roadWidth / 4, segmentLength / 4);

    const roadMat = new THREE.MeshStandardMaterial({
      map: tex,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    for (let i = 0; i < this.roadPoints.length - 1; i++) {
      const a = this.roadPoints[i];
      const b = this.roadPoints[i + 1];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const dir = b.clone().sub(a);
      const length = dir.length();
      dir.normalize();
      const angle = Math.atan2(dir.x, dir.z);

      const geo = new THREE.PlaneGeometry(roadWidth, length + 4);
      const road = new THREE.Mesh(geo, roadMat);

      road.position.copy(mid);
      road.position.y = 0.15;
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = angle;
      road.renderOrder = 1;
      road.receiveShadow = true;
      scene.add(road);
    }

    console.log('[track] ring road created with', this.roadPoints.length, 'points');
  }

  // ДЕРЕВЬЯ ВОКРУГ ТРАССЫ
  scatterTrees(scene: THREE.Scene) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d5016 });

    const centerX = 0;
    const centerZ = -400;
    const ringRadius = 350;

    let placed = 0;
    let attempts = 0;

    while (placed < 400 && attempts < 2000) {
      attempts++;
      
      // Случайная точка в мире
      const x = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      
      // Расстояние от центра кольца
      const dx = x - centerX;
      const dz = z - centerZ;
      const distFromCenter = Math.sqrt(dx * dx + dz * dz);
      
      // Расстояние от дороги (кольца)
      const distFromRoad = Math.abs(distFromCenter - ringRadius);
      
      // Деревья только:
      // 1. НЕ на дороге (distFromRoad > 12)
      // 2. НЕ слишком далеко (distFromRoad < 200)
      if (distFromRoad < 12 || distFromRoad > 200) continue;

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

      // Случайный масштаб
      const scale = 0.7 + Math.random() * 0.8;
      tree.scale.set(scale, scale, scale);

      tree.position.set(x, 0, z);
      tree.rotation.y = Math.random() * Math.PI;
      scene.add(tree);
      placed++;
    }

    console.log('[track] placed', placed, 'trees');
  }
}
