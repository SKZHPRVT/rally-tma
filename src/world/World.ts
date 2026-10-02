import * as THREE from 'three';
import { Terrain } from './Terrain';
import { RoadRing } from './RoadRing';

export class World {
  public terrain: Terrain;
  public road: RoadRing;
  public seed: number;

  constructor(scene: THREE.Scene, groundTexture: THREE.Texture, roadTexture: THREE.Texture, seed?: number) {
    // Если seed не задан — берём текущую неделю (для регена каждую неделю)
    this.seed = seed ?? this.weeklySeed();
    
    console.log('[world] seed:', this.seed);
    
    this.terrain = new Terrain(this.seed);
    this.terrain.createMesh(scene, groundTexture);
    
    this.road = new RoadRing(scene, this.terrain, roadTexture, this.seed);
  }

  // Сид = номер текущей недели (год * 100 + неделя)
  private weeklySeed(): number {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
    const week = Math.ceil((days + start.getDay() + 1) / 7);
    return year * 100 + week;
  }

  getHeight(x: number, z: number): number {
    return this.terrain.getHeight(x, z);
  }
}
