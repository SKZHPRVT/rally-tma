import * as THREE from 'three';
import { BIOMES, BiomeId, BIOME_IDS } from '../world/Biomes';

export class Track {
  public roadPoints: THREE.Vector3[] = [];
  public startPoint: THREE.Vector3 = new THREE.Vector3();
  public biome: BiomeId = 'classic';
  
  private scene: THREE.Scene;
  private meshes: THREE.Object3D[] = [];
  private textures: { [key: string]: THREE.Texture | null } = {};
  private seed: number = 0;

  constructor(scene: THREE.Scene, seed: number = 1, biome?: BiomeId) {
    this.scene = scene;
    this.seed = seed;
    
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
    
    const pathMap: { [key: string]: string | null } = {
      ground: cfg.groundTexture,
      road:   cfg.roadTexture,
      bank:   cfg.bankTexture,
    };
    
    for (const [key, path] of Object.entries(pathMap)) {
      if (path === null) {
        this.textures[key] = null;
        continue;
      }
      
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
    
    this.scene.background = new THREE.Color(cfg.backgroundColor);
    this.scene.fog = new THREE.Fog(cfg.fogColor, 250, 700);
    
    this.createGround(cfg);
    this.createRingRoad(rand, cfg);
    this.createStartMarker();
    
    // Объекты
    this.scatterMountains(rand, cfg);
    this.scatterTrees(rand, cfg);
    this.scatterRocks(rand, cfg);
    this.scatterBuildings(rand, cfg);
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
    const geo = new THREE.PlaneGeometry(3000, 3000, 1, 1);
    
    if (this.textures['ground'] === null) {
      const mat = new THREE.MeshStandardMaterial({ color: cfg.groundColor });
      const ground = new THREE.Mesh(geo, mat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      this.add(ground);
      return;
    }
    
    const tex = this.textures['ground']!.clone();
    tex.needsUpdate = true;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(80, 80);
    
    const mat = new THREE.MeshStandardMaterial({ map: tex, color: cfg.groundColor });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.add(ground);
  }

  // === ДОРОГА — усиленный рандом формы ===
  private createRingRoad(rand: () => number, cfg: any) {
    const numPoints = 120;
    const baseRadius = 320;
    const centerX = 0;
    const centerZ = -400;

    this.roadPoints = [];

    // Архетип
    const archetype = Math.floor(rand() * 5);  // было 4, теперь 5
    
    // Roughness — шире диапазон
    const roughness = 0.2 + rand() * 0.8;  // 0.2-1.0
    
    console.log('[track] archetype:', archetype, 'roughness:', roughness.toFixed(2));

    // Много фаз
    const phases = Array.from({ length: 7 }, () => rand() * Math.PI * 2);
    
    // Амплитуды
    const amps = [
      0.3 + rand() * 0.7,          // очень низкая
      0.2 + roughness * 0.8,       // низкая
      0.1 + roughness * 0.7,       // средняя
      0.05 + roughness * 0.6,      // высокая
      roughness * 0.5,             // очень высокая
      roughness * roughness * 0.4, // экстрим
      roughness * roughness * 0.3,
    ];
    
    // Вытянутость
    let stretchX = 1;
    let stretchZ = 1;
    
    if (archetype === 1) {
      const s = 0.3 + rand() * 0.7;
      stretchX = s;
      stretchZ = 1 / s;
    }
    
    if (archetype === 3 || archetype === 4) {
      stretchX = 0.4 + rand() * 1.2;
      stretchZ = 0.4 + rand() * 1.2;
    }

    // Выступы — резкие пики
    const bumpCount = Math.floor(roughness * 8);
    const bumps: { angle: number, width: number, strength: number }[] = [];
    for (let i = 0; i < bumpCount; i++) {
      bumps.push({
        angle: rand() * Math.PI * 2,
        width: 0.15 + rand() * 0.6,
        strength: 0.2 + rand() * 1.0,
      });
    }

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const angle = t * Math.PI * 2;
      
      // 7 частот шума
      const n1 = Math.sin(angle * 2 + phases[0]) * amps[0];
      const n2 = Math.sin(angle * 3 + phases[1]) * amps[1];
      const n3 = Math.sin(angle * 5 + phases[2]) * amps[2];
      const n4 = Math.sin(angle * 8 + phases[3]) * amps[3];
      const n5 = Math.sin(angle * 13 + phases[4]) * amps[4];
      const n6 = Math.sin(angle * 21 + phases[5]) * amps[5];
      const n7 = Math.sin(angle * 34 + phases[6]) * amps[6];
      
      // Выступы
      let bumpMod = 0;
      for (const bump of bumps) {
        let diff = angle - bump.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        
        const falloff = Math.exp(-(diff * diff) / (bump.width * bump.width));
        bumpMod += falloff * bump.strength;
      }
      
      // Пятно для archetype 2
      let blobMod = 0;
      if (archetype === 2) {
        blobMod = Math.sin(angle * 1.5 + phases[0]) * 0.5 + 
                  Math.sin(angle * 2.5 + phases[1]) * 0.4 +
                  Math.sin(angle * 4 + phases[2]) * 0.2;
      }
      
      // Хаос для archetype 4
      let chaosMod = 0;
      if (archetype === 4) {
        chaosMod = Math.sin(angle * 7 + phases[0]) * 0.5 +
                   Math.sin(angle * 11 + phases[3]) * 0.3;
      }
      
      const sum = n1 + n2 + n3 + n4 + n5 + n6 + n7 + bumpMod + blobMod + chaosMod;
      const radiusMod = 1 + sum * 0.4;
      const radius = baseRadius * Math.max(0.25, radiusMod);
      
      const x = centerX + Math.cos(angle) * radius * stretchX;
      const z = centerZ + Math.sin(angle) * radius * stretchZ;

      this.roadPoints.push(new THREE.Vector3(x, 0.15, z));
    }
    this.roadPoints.push(this.roadPoints[0].clone());

    this.startPoint = this.roadPoints[0].clone();

    const roadWidth = cfg.roadWidth;
    const segmentLength = this.roadPoints[0].distanceTo(this.roadPoints[1]);

    const roadTex = this.textures['road']!.clone();
    roadTex.needsUpdate = true;
    roadTex.wrapS = THREE.RepeatWrapping;
    roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(roadWidth / 4, segmentLength / 4);

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
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

  // Минимальное расстояние от машины до дороги (для проверки)
  private distanceToRoad(x: number, z: number): number {
    let minDist = Infinity;
    for (const p of this.roadPoints) {
      const dx = x - p.x;
      const dz = z - p.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < minDist) minDist = d;
    }
    return minDist;
  }

  // Генерация точки в кольце вокруг дороги
  private randomPointAround(rand: () => number, minDist: number, maxDist: number): { x: number, z: number } | null {
    const centerX = 0;
    const centerZ = -400;
    
    for (let attempt = 0; attempt < 20; attempt++) {
      const x = (rand() - 0.5) * 2200;
      const z = (rand() - 0.5) * 2200;
      
      const dist = this.distanceToRoad(x, z);
      if (dist >= minDist && dist <= maxDist) {
        return { x, z };
      }
    }
    return null;
  }

  // === ГОРЫ на горизонте ===
  private scatterMountains(rand: () => number, cfg: any) {
    if (cfg.mountainCount === 0) return;
    
    const mat = new THREE.MeshStandardMaterial({ color: cfg.mountainColor, flatShading: true });
    const centerX = 0;
    const centerZ = -400;
    
    for (let i = 0; i < cfg.mountainCount; i++) {
      const angle = (i / cfg.mountainCount) * Math.PI * 2 + rand() * 0.3;
      const dist = 900 + rand() * 600;
      
      const x = centerX + Math.cos(angle) * dist;
      const z = centerZ + Math.sin(angle) * dist;
      
      const height = 150 + rand() * 200;
      const radius = 100 + rand() * 150;
      
      const geo = new THREE.ConeGeometry(radius, height, 5 + Math.floor(rand() * 3));
      const mountain = new THREE.Mesh(geo, mat);
      mountain.position.set(x, height / 2 - 20, z);
      mountain.rotation.y = rand() * Math.PI;
      mountain.castShadow = false;
      mountain.receiveShadow = false;
      
      this.add(mountain);
    }
  }

  // === ДЕРЕВЬЯ — больше и лучше распределены ===
  private scatterTrees(rand: () => number, cfg: any) {
    if (cfg.treeCount === 0) return;
    
    const trunkMat = new THREE.MeshStandardMaterial({ color: cfg.treeTrunkColor });
    const leafMat = new THREE.MeshStandardMaterial({ color: cfg.treeLeafColor });

    let placed = 0;
    let attempts = 0;
    const maxAttempts = cfg.treeCount * 5;

    while (placed < cfg.treeCount && attempts < maxAttempts) {
      attempts++;
      
      // От 22м до 500м от дороги
      const pt = this.randomPointAround(rand, 22, 500);
      if (!pt) continue;

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 6), trunkMat);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);

      const leaves = new THREE.Mesh(new THREE.ConeGeometry(2, 4, 6), leafMat);
      leaves.position.y = 4.5;
      leaves.castShadow = true;
      tree.add(leaves);

      const scale = 0.6 + rand() * 1.0;
      tree.scale.set(scale, scale, scale);
      tree.position.set(pt.x, 0, pt.z);
      tree.rotation.y = rand() * Math.PI;
      this.add(tree);
      placed++;
    }
    
    console.log('[track] trees placed:', placed, '/', cfg.treeCount);
  }

  // === КАМНИ ===
  private scatterRocks(rand: () => number, cfg: any) {
    if (cfg.rockCount === 0) return;
    
    const rockMat = new THREE.MeshStandardMaterial({ 
      color: cfg.rockColor,
      flatShading: true,
    });

    let placed = 0;
    let attempts = 0;
    const maxAttempts = cfg.rockCount * 5;

    while (placed < cfg.rockCount && attempts < maxAttempts) {
      attempts++;
      
      // Камни ближе к дороге — 18-100м
      const pt = this.randomPointAround(rand, 18, 100);
      if (!pt) continue;

      const scale = 0.3 + rand() * 1.2;
      const geo = new THREE.IcosahedronGeometry(scale, 0);
      const rock = new THREE.Mesh(geo, rockMat);
      
      rock.position.set(pt.x, scale * 0.5, pt.z);
      rock.rotation.set(
        rand() * Math.PI,
        rand() * Math.PI,
        rand() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.add(rock);
      placed++;
    }
    
    console.log('[track] rocks placed:', placed, '/', cfg.rockCount);
  }

  // === ДОМИКИ ===
  private scatterBuildings(rand: () => number, cfg: any) {
    if (cfg.buildingCount === 0) return;
    
    const wallMat = new THREE.MeshStandardMaterial({ color: cfg.buildingColor });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b3a2a });
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x2a3a4a });

    let placed = 0;
    let attempts = 0;
    const maxAttempts = cfg.buildingCount * 5;

    while (placed < cfg.buildingCount && attempts < maxAttempts) {
      attempts++;
      
      // Домики дальше от дороги — 30-300м
      const pt = this.randomPointAround(rand, 30, 300);
      if (!pt) continue;

      const group = new THREE.Group();
      
      // Стены
      const w = 4 + rand() * 4;
      const h = 3 + rand() * 2;
      const d = 4 + rand() * 4;
      
      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        wallMat
      );
      walls.position.y = h / 2;
      walls.castShadow = true;
      walls.receiveShadow = true;
      group.add(walls);
      
      // Крыша (двускатная)
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(Math.max(w, d) * 0.8, 2, 4),
        roofMat
      );
      roof.position.y = h + 1;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);
      
      // Окна (пара кубиков)
      const windowCount = 1 + Math.floor(rand() * 3);
      for (let wi = 0; wi < windowCount; wi++) {
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.6, 0.1),
          windowMat
        );
        win.position.set(
          -w/2 + 0.5 + wi * 1.2,
          h * 0.6,
          d / 2 + 0.05
        );
        group.add(win);
      }
      
      group.position.set(pt.x, 0, pt.z);
      group.rotation.y = rand() * Math.PI * 2;
      this.add(group);
      placed++;
    }
    
    console.log('[track] buildings placed:', placed, '/', cfg.buildingCount);
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
