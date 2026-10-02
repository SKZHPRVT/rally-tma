import * as THREE from 'three';
import { Car } from '../entities/Car';
import { Track } from '../entities/Track';
import { HUD } from '../ui/HUD';
import { Input } from './Input';
import { EngineSound } from '../audio/EngineSound';

export class Game {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  car: Car;
  track: Track;
  hud: HUD;
  input: Input;
  engineSound: EngineSound;
  clock: THREE.Clock;
  running: boolean = false;
  
  private currentSeed: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 250, 700);

    this.camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.1, 2000
    );

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 150;
    sun.shadow.camera.bottom = -150;
    sun.shadow.camera.far = 500;
    this.scene.add(sun);

    this.currentSeed = this.weeklySeed();
    
    this.track = new Track(this.scene, this.currentSeed);
    
    const spawnPos = this.track.getSpawnPoint();
    const spawnRot = this.track.getSpawnRotation();
    this.car = new Car(this.scene, spawnPos, spawnRot);

    this.hud = new HUD();
    this.input = new Input();
    this.engineSound = new EngineSound();

    this.hud.onNewWorld = () => {
      this.regenerate();
    };

    this.clock = new THREE.Clock();
    window.addEventListener('resize', () => this.onResize());
  }

  private weeklySeed(): number {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
    const week = Math.ceil((days + start.getDay() + 1) / 7);
    return year * 100 + week;
  }

  private randomSeed(): number {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  regenerate(newSeed?: number) {
    console.log('[game] regenerating world');
    
    this.currentSeed = newSeed ?? this.randomSeed();
    
    this.track.dispose();
    this.track = new Track(this.scene, this.currentSeed);
    
    const spawnPos = this.track.getSpawnPoint();
    const spawnRot = this.track.getSpawnRotation();
    this.car.resetPosition(spawnPos, spawnRot);
    
    this.camera.position.set(
      spawnPos.x - Math.sin(spawnRot) * 10,
      spawnPos.y + 3,
      spawnPos.z - Math.cos(spawnRot) * 10
    );
    
    this.hud.showStartMenu();
    
    console.log('[game] new world ready, seed:', this.currentSeed);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  start() {
    this.running = true;
    this.clock.start();
    this.loop();
  }

  loop() {
    if (!this.running) return;
    requestAnimationFrame(() => this.loop());

    const dt = Math.min(this.clock.getDelta(), 0.1);

    this.input.enabled = this.hud.canControl();
    if (!this.input.enabled) {
      this.input.reset();
    }

    this.car.update(dt, this.input);
    this.car.updateCamera(this.camera);
    this.hud.update(dt, this.car, this.track);

    this.engineSound.update(this.car.velocity, this.input.gas, this.input.brake, dt);

    this.renderer.render(this.scene, this.camera);
  }
}
