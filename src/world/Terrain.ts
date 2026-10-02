import * as THREE from 'three';

export class Terrain {
  public heightmap: number[][] = [];
  public size: number = 1000;         // размер мира в метрах
  public segments: number = 64;       // 64x64 сегментов
  public maxHeight: number = 40;      // максимальная высота гор
  public mesh!: THREE.Mesh;

  constructor(seed: number = 12345) {
    this.generateHeightmap(seed);
  }

  // Простой Perlin-подобный шум
  private noise2D(x: number, y: number, seed: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  }

  // Сглаженный шум (интерполяция)
  private smoothNoise(x: number, y: number, seed: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    
    // Плавные веса
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    
    const n00 = this.noise2D(ix, iy, seed);
    const n10 = this.noise2D(ix + 1, iy, seed);
    const n01 = this.noise2D(ix, iy + 1, seed);
    const n11 = this.noise2D(ix + 1, iy + 1, seed);
    
    const nx0 = n00 * (1 - sx) + n10 * sx;
    const nx1 = n01 * (1 - sx) + n11 * sx;
    return nx0 * (1 - sy) + nx1 * sy;
  }

  // Fractal Brownian Motion — многослойный шум
  private fbm(x: number, y: number, seed: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    
    for (let i = 0; i < 4; i++) {
      value += this.smoothNoise(x * frequency, y * frequency, seed + i * 100) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    
    return value / maxValue;
  }

  generateHeightmap(seed: number) {
    const seg = this.segments;
    this.heightmap = [];
    
    for (let i = 0; i <= seg; i++) {
      this.heightmap[i] = [];
      for (let j = 0; j <= seg; j++) {
        // Нормализованные координаты [0..1]
        const nx = i / seg;
        const ny = j / seg;
        
        // Два масштаба: холмы (крупные) + горы (островами)
        const hills = this.fbm(nx * 3, ny * 3, seed);
        const mountains = this.fbm(nx * 6, ny * 6, seed + 9999);
        
        // Маска для гор — только в некоторых местах карты
        const mountainMask = Math.max(0, mountains - 0.6) * 2.5;
        
        // Итоговая высота
        let h = hills * 0.4 + mountainMask * 0.6;
        
        // Плоская зона в центре (для кольцевой дороги)
        const distFromCenter = Math.sqrt(
          Math.pow(nx - 0.5, 2) + Math.pow(ny - 0.5, 2)
        );
        const flatMask = Math.max(0, 1 - distFromCenter * 3); // 1 в центре, 0 дальше
        
        // В центре — плоско, снаружи — рельеф
        h = h * (1 - flatMask * 0.9) + 0.05 * flatMask;
        
        this.heightmap[i][j] = h * this.maxHeight;
      }
    }
  }

  // Высота в мировых координатах (x, z)
  getHeight(worldX: number, worldZ: number): number {
    // Мир от -size/2 до +size/2, heightmap от 0 до segments
    const nx = (worldX + this.size / 2) / this.size; // 0..1
    const nz = (worldZ + this.size / 2) / this.size; // 0..1
    
    if (nx < 0 || nx > 1 || nz < 0 || nz > 1) return 0;
    
    const i = Math.floor(nx * this.segments);
    const j = Math.floor(nz * this.segments);
    
    return this.heightmap[i]?.[j] ?? 0;
  }

  createMesh(scene: THREE.Scene, texture: THREE.Texture) {
    const geo = new THREE.PlaneGeometry(
      this.size, this.size,
      this.segments, this.segments
    );
    
    // Применяем heightmap к вершинам
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      
      // В PlaneGeometry координаты идут по X-Y, потом повернём
      const nx = (x + this.size / 2) / this.size;
      const nz = (y + this.size / 2) / this.size;
      
      const hi = Math.floor(nx * this.segments);
      const hj = Math.floor(nz * this.segments);
      
      const h = this.heightmap[hi]?.[hj] ?? 0;
      pos.setZ(i, h);
    }
    
    geo.computeVertexNormals();
    
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0x5a6b3a,
    });
    
    // Повторяем текстуру
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30, 30);
    
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  }
}
