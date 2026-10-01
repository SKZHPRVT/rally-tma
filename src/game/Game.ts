import * as THREE from 'three';
import { Car } from '../entities/Car';
import { Track } from '../entities/Track';
import { HUD } from '../ui/HUD';
import { Input } from './Input';

export class Game {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  car: Car;
  track: Track;
  hud: HUD;
  input: Input;
  clock: THREE.Clock;
  running: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 100, 400);

    this.camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.1, 1000
    );

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    this.scene.add(sun);

    this.track = new Track(this.scene);
    this.car = new Car(this.scene);

    this.hud = new HUD();
    this.input = new Input();
    this.clock = new THREE.Clock();

    window.addEventListener('resize', () => this.onResize());
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

    this.car.update(dt, this.input);
    this.car.updateCamera(this.camera);
    this.hud.update(dt, this.car);

    this.renderer.render(this.scene, this.camera);
  }
}
