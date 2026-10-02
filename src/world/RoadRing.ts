import * as THREE from 'three';
import { Terrain } from './Terrain';

export class RoadRing {
  public points: THREE.Vector3[] = [];

  constructor(
    scene: THREE.Scene,
    terrain: Terrain,
    texture: THREE.Texture,
    seed: number = 12345
  ) {
    this.generatePoints(terrain, seed);
    this.createMesh(scene, terrain, texture);
  }

  generatePoints(terrain: Terrain, seed: number) {
    const numPoints = 40;
    const baseRadius = terrain.size * 0.35; // 35% от размера мира
    const centerX = 0;
    const centerZ = 0;

    this.points = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      
      // Варьируем радиус шумом — дорога не идеальный круг
      const noiseVal = Math.sin(i * 1.7 + seed) * 0.5 + Math.sin(i * 0.3 + seed * 2) * 0.5;
      const radius = baseRadius + noiseVal * 30; // ±30 м
      
      const x = centerX + Math.cos(angle) * radius;
      const z = centerZ + Math.sin(angle) * radius;
      
      // Высота = высота рельефа в этой точке (плоская зона = 0.05 * maxHeight)
      const y = terrain.getHeight(x, z) + 0.2;
      
      this.points.push(new THREE.Vector3(x, y, z));
    }
    
    // Замыкаем кольцо
    this.points.push(this.points[0].clone());
  }

  createMesh(scene: THREE.Scene, terrain: Terrain, texture: THREE.Texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    const width = 8; // ширина дороги
    const step = 0.5; // шаг по длине

    for (let i = 0; i < this.points.length - 1; i++) {
      const a = this.points[i];
      const b = this.points[i + 1];
      
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const dir = b.clone().sub(a);
      const length = dir.length();
      dir.normalize();
      
      const angle = Math.atan2(dir.x, dir.z);
      
      const tex = texture.clone();
      tex.needsUpdate = true;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(width / 4, length / 4);
      
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      
      // Сегмент дороги
      const geo = new THREE.PlaneGeometry(width, length + 2);
      const seg = new THREE.Mesh(geo, mat);
      
      seg.position.copy(mid);
      seg.rotation.x = -Math.PI / 2;
      seg.rotation.z = angle;
      seg.receiveShadow = true;
      seg.renderOrder = 1;
      
      scene.add(seg);
    }
  }

  // Ближайшая точка на дороге к позиции
  getClosestPoint(pos: THREE.Vector3): THREE.Vector3 {
    let closest = this.points[0];
    let minDist = Infinity;
    
    for (const p of this.points) {
      const d = p.distanceToSquared(pos);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    }
    return closest;
  }
}
