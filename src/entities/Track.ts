import * as THREE from 'three';
import { BIOMES, BiomeId, BIOME_IDS } from '../world/Biomes';

export class Track {
  public roadPoints: THREE.Vector3[] = [];
  public startPoint: THREE.Vector3 = new THREE.Vector3();
  public biome: BiomeId = 'forest';
  
  private scene: THREE.Scene;
  private meshes: THREE.Object3D[] = [];
  private textures: { [key: string]: THREE.Texture } = {};
  private seed: number = 0;

  constructor(scene: THREE.Scene, seed: number = 1, biome?: BiomeId) {
    this.scene = scene;
    this.seed = seed;
    
    // Выбор биома: либо явно, либо случайно по seed
    if (biome) {
      this.biome = biome;
    } else {
      const idx = Math.abs(seed) % BIOME_IDS.length;
      this.biome = BIOME_IDS[idx];
    }
    
    console.log('[track] biome:', this.biome, 'seed:', seed);
    
    this.loadBiomeTextures();
    this.build();
  }

  private loadBiomeTextures() {
    const loader = new THREE.TextureLoader();
    const cfg = BIOMES[this.biome];
    
    const paths = {
      ground: cfg.groundTexture,
      road:   cfg.roadTexture,
      bank:   cfg.bankTexture,
    };
    
    for (const [key, path] of Object.entries(paths)) {
      const tex = loader.load(path);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      this.textures[key] = tex;
    }
  }

  private build() {
    const rand = this.seededRandom(this.seed);
    const cfg = BIOMES[this.biome];
    
    // Фон и туман
    this.scene.background = new THREE.Color(cfg.backgroundColor);
    this.scene.fog = new THREE.Fog(cfg.fogColor, 250, 700);
    
    this.createGround(cfg);
    this.createRingRoad(rand, cfg);
    this.createStartMarker();
    this.scatterTrees(rand, cfg);
  }

  dispose() {
    for (const m of this.meshes) {
      this.scene.remove(m);
      m.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mt: any) => mt.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
    this.meshes = [];
    this.roadPoints = [];
  }

  private seededRandom(seed: number): () => number {
    let s = seed || 1;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  private add(obj: THREE.Object3D) {
    this.meshes.push(obj);
    this.scene.add(obj);
  }

  private createGround(cfg: any) {
    const tex = this.textures['ground'].clone();
    tex.needsUpdate = true;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(80, 80);
    
    const geo = new THREE.PlaneGeometry(3000, 3000, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      color: cfg.groundColor,
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.add(ground);
  }

  private createRingRoad(rand: () => number, cfg: any) {
    const numPoints = 64;
    const baseRadius = 350;
    const centerX = 0;
    const centerZ = -400;

    this.roadPoints = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const noiseVal = (rand() - 0.5) * 0.3;
      const radius = baseRadius + noiseVal * 100;

      const x = centerX + Math.cos(angle) * radius;
      const z = centerZ + Math.sin(angle) * radius;

      this.roadPoints.push(new THREE.Vector3(x, 0.15, z));
    }
    this.roadPoints.push(this.roadPoints[0].clone());

    this.startPoint = this.roadPoints[0].clone();

    const roadWidth = cfg.roadWidth;
    const segmentLength = this.roadPoints[0].distanceTo(this.roadPoints[1]);

    const roadTex = this.textures['road'].clone();
    roadTex.needsUpdate = true;
    roadTex.wrapS = THREE.RepeatWrapping;
    roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(roadWidth / 4, segmentLength / 4);

    const bankTex = this.textures['bank'].clone();
    bankTex.needsUpdate = true;
    bankTex.wrapS = THREE.RepeatWrapping;
    bankTex.wrapT = THREE.RepeatWrapping;
    bankTex.repeat.set(2, segmentLength / 4);

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const bankMat = new THREE.MeshStandardMaterial({
      map: bankTex,
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

      // Дорога
      const roadGeo = new THREE.PlaneGeometry(roadWidth, length + 4);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.copy(mid);
      road.position.y = 0.15;
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = angle;
      road.receiveShadow = true;
      this.add(road);
    }
  }

  private createStartMarker() {
    const p = this.startPoint;
    const next = this.roadPoints[1];
    const dir = next.clone().sub(p).normalize();
    const angle = Math.atan2(dir.x, dir.z);
    const archWidth = 14;

    const redMat = new THREE.MeshStandardMaterial({ color: 0xcc2222 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 8);

    const leftPillar = new THREE.Mesh(pillarGeo, redMat);
    const leftOffset = new THREE.Vector3(-archWidth / 2, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0), angle
    );
    leftPillar.position.copy(p).add(leftOffset);
    leftPillar.position.y = 3;
    leftPillar.castShadow = true;
    this.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, redMat);
    const rightOffset = new THREE.Vector3(archWidth / 2, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0), angle
    );
    rightPillar.position.copy(p).add(rightOffset);
    rightPillar.position.y = 3;
    rightPillar.castShadow = true;
    this.add(rightPillar);

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
      this.add(stripe);
    }

    const lineGeo = new THREE.PlaneGeometry(archWidth, 1.5);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.copy(p);
    line.position.y = 0.2;
    line.rotation.x = -Math.PI / 2;
    line.rotation.z = angle;
    this.add(line);
  }

  private scatterTrees(rand: () => number, cfg: any) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: cfg.treeTrunkColor });
    const leafMat = new THREE.MeshStandardMaterial({ color: cfg.treeLeafColor });

    const centerX = 0;
    const centerZ = -400;
    const ringRadius = 350;
    const minDistFromRoad = 22;
    const targetCount = cfg.treeCount;

    let placed = 0;
    let attempts = 0;

    while (placed < targetCount && attempts < targetCount * 10) {
      attempts++;
      const x = (rand() - 0.5) * 2000;
      const z = (rand() - 0.5) * 2000;

      const dx = x - centerX;
      const dz = z - centerZ;
      const distFromCenter = Math.sqrt(dx * dx + dz * dz);
      const distFromRoad = Math.abs(distFromCenter - ringRadius);

      if (distFromRoad < minDistFromRoad || distFromRoad > 200) continue;

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 6), trunkMat);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);

      const leaves = new THREE.Mesh(new THREE.ConeGeometry(2, 4, 6), leafMat);
      leaves.position.y = 4.5;
      leaves.castShadow = true;
      tree.add(leaves);

      const scale = 0.7 + rand() * 0.8;
      tree.scale.set(scale, scale, scale);
      tree.position.set(x, 0, z);
      tree.rotation.y = rand() * Math.PI;
      this.add(tree);
      placed++;
    }
  }

  getSpawnPoint(): THREE.Vector3 {
    const spawn = this.startPoint.clone();
    spawn.y = 0.5;
    const next = this.roadPoints[1];
    const dir = next.clone().sub(this.startPoint).normalize();
    spawn.x -= dir.x * 5;
    spawn.z -= dir.z * 5;
    return spawn;
  }

  getSpawnRotation(): number {
    const next = this.roadPoints[1];
    const dir = next.clone().sub(this.startPoint).normalize();
    return Math.atan2(dir.x, dir.z);
  }
}
