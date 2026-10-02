import * as THREE from 'three';

export class Track {
  public textures: { [key: string]: THREE.Texture } = {};
  public roadPoints: THREE.Vector3[] = [];
  public startPoint: THREE.Vector3 = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.loadTextures();
    this.createGround(scene);
    this.createRingRoad(scene);
    this.createStartMarker(scene);
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

  // КОЛЬЦЕВАЯ ДОРОГА — ШИРЕ
  createRingRoad(scene: THREE.Scene) {
    const numPoints = 64;
    const baseRadius = 350;
    const centerX = 0;
    const centerZ = -400;

    this.roadPoints = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const noiseVal = Math.sin(i * 1.3) * 0.15 + Math.sin(i * 0.5) * 0.1;
      const radius = baseRadius + noiseVal * 100;

      const x = centerX + Math.cos(angle) * radius;
      const z = centerZ + Math.sin(angle) * radius;

      this.roadPoints.push(new THREE.Vector3(x, 0.15, z));
    }
    this.roadPoints.push(this.roadPoints[0].clone());

    this.startPoint = this.roadPoints[0].clone();

    // Дорога — шире в 1.5 раза (было 9, стало 13.5)
    const roadWidth = 13.5;
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

    console.log('[track] ring road created, width:', roadWidth);
  }

  // МЕТКА СТАРТА — арка из двух столбов + поперечная линия
  createStartMarker(scene: THREE.Scene) {
    const p = this.startPoint;
    
    // Направление следующей точки (чтобы арка была поперёк дороги)
    const next = this.roadPoints[1];
    const dir = next.clone().sub(p).normalize();
    const angle = Math.atan2(dir.x, dir.z);
    
    // Ширина дороги — 13.5, арка чуть шире
    const archWidth = 14;
    
    // Материал для столбов (красно-белый, как в CMR)
    const redMat = new THREE.MeshStandardMaterial({ color: 0xcc2222 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    // Левый столб
    const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 8);
    
    const leftPillar = new THREE.Mesh(pillarGeo, redMat);
    const leftOffset = new THREE.Vector3(-archWidth / 2, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0), angle
    );
    leftPillar.position.copy(p).add(leftOffset);
    leftPillar.position.y = 3;
    leftPillar.castShadow = true;
    scene.add(leftPillar);
    
    // Правый столб
    const rightPillar = new THREE.Mesh(pillarGeo, redMat);
    const rightOffset = new THREE.Vector3(archWidth / 2, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0), angle
    );
    rightPillar.position.copy(p).add(rightOffset);
    rightPillar.position.y = 3;
    rightPillar.castShadow = true;
    scene.add(rightPillar);
    
    // Перекладина сверху
    const beamGeo = new THREE.BoxGeometry(archWidth, 0.8, 0.8);
    const beam = new THREE.Mesh(beamGeo, whiteMat);
    beam.position.copy(p);
    beam.position.y = 6;
    beam.rotation.y = angle;
    beam.castShadow = true;
    scene.add(beam);
    
    // Красно-белые полоски на перекладине (для видимости)
    for (let i = 0; i < 6; i++) {
      const stripeGeo = new THREE.BoxGeometry(archWidth / 6, 0.9, 0.9);
      const stripeMat = i % 2 === 0 ? redMat : whiteMat;
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      
      const offset = -archWidth / 2 + (archWidth / 6) * (i + 0.5);
      const stripeOffset = new THREE.Vector3(offset, 0, 0).applyAxisAngle(
        new THREE.Vector3(0, 1, 0), angle
      );
      
      stripe.position.copy(p).add(stripeOffset);
      stripe.position.y = 6;
      stripe.rotation.y = angle;
      stripe.castShadow = true;
      scene.add(stripe);
    }
    
    // Широкая белая линия на дороге (стартовая)
    const lineGeo = new THREE.PlaneGeometry(archWidth, 1.5);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.copy(p);
    line.position.y = 0.2;
    line.rotation.x = -Math.PI / 2;
    line.rotation.z = angle;
    scene.add(line);
    
    console.log('[track] start marker created');
  }

  // ДЕРЕВЬЯ — НЕ на дороге
  scatterTrees(scene: THREE.Scene) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d5016 });

    const centerX = 0;
    const centerZ = -400;
    const ringRadius = 350;
    
    // Дорога 13.5 м — деревья на 15 м от края = 15 + 7 = ~22 м от центра дороги
    const minDistFromRoad = 22;

    let placed = 0;
    let attempts = 0;

    while (placed < 400 && attempts < 3000) {
      attempts++;
      
      const x = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      
      const dx = x - centerX;
      const dz = z - centerZ;
      const distFromCenter = Math.sqrt(dx * dx + dz * dz);
      const distFromRoad = Math.abs(distFromCenter - ringRadius);
      
      // Не на дороге и не слишком далеко
      if (distFromRoad < minDistFromRoad || distFromRoad > 200) continue;

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
