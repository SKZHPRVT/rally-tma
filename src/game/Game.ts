import * as THREE from 'three';
import { Car } from '../entities/Car';
import { World } from '../world/World';
import { HUD } from '../ui/HUD';
import { Input } from './Input';
import { EngineSound } from '../audio/EngineSound';

export class Game {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  car: Car;
  world: World;
  hud: HUD;
  input: Input;
  engineSound: EngineSound;
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
    this.scene.fog = new THREE.Fog(0x87ceeb, 300, 800);

    this.camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.1, 3000
    );

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(50, 150, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -200;
    sun.shadow.camera.right = 200;
    sun.shadow.camera.top = 200;
    sun.shadow.camera.bottom = -200;
    sun.shadow.camera.far = 600;
    this.scene.add(sun);

    // Загружаем текстуры
    const loader = new THREE.TextureLoader();
    const groundTex = loader.load('./assets/cmr/track/grass1.png');
    const roadTex = loader.load('./assets/cmr/track/gravel1.png');

    // Создаём мир (генерируется процедурно)
    this.world = new World(this.scene, groundTex, roadTex);

    // Спавним машину над дорогой
    const spawnPoint = this.world.road.points[0];
    this.car = new Car(this.scene, spawnPoint);

    this.hud = new HUD();
    this.input = new Input();
    this.engineSound = new EngineSound();

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

    // Обновляем машину с учётом рельефа
    this.car.update(dt, this.input, this.world);
    this.car.updateCamera(this.camera);
    this.hud.update(dt, this.car);

    this.engineSound.update(this.car.velocity, this.input.gas, this.input.brake, dt);

    this.renderer.render(this.scene, this.camera);
  }
}
