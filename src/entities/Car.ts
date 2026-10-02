import * as THREE from 'three';
import { Input } from '../game/Input';

export class Car {
  mesh: THREE.Group;
  body: THREE.Mesh;

  position: THREE.Vector3;
  rotation: number = 0;
  velocity: number = 0;
  angularVelocity: number = 0;

  maxSpeed: number = 40;
  acceleration: number = 15;
  brakeForce: number = 30;
  drag: number = 0.5;
  turnSpeed: number = 1.8;

  // Сглаженные параметры камеры
  private smoothBackDist: number = 7;
  private smoothHeight: number = 2.3;
  private smoothFov: number = 70;

  constructor(scene: THREE.Scene, spawnPos?: THREE.Vector3, spawnRot: number = 0) {
    this.mesh = new THREE.Group();
    this.position = spawnPos ? spawnPos.clone() : new THREE.Vector3(0, 0.5, 0);
    this.rotation = spawnRot;

    const bodyGeo = new THREE.BoxGeometry(1.8, 0.8, 3.5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2266cc });
    this.body = new THREE.Mesh(bodyGeo, bodyMat);
    this.body.position.y = 0.5;
    this.body.castShadow = true;
    this.mesh.add(this.body);

    const cabGeo = new THREE.BoxGeometry(1.6, 0.6, 1.8);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x1a4f99 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 1.1, -0.2);
    cab.castShadow = true;
    this.mesh.add(cab);

    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const wheelPositions: [number, number, number][] = [
      [-0.9, 0.4, 1.2],
      [0.9, 0.4, 1.2],
      [-0.9, 0.4, -1.2],
      [0.9, 0.4, -1.2],
    ];
    for (const [x, y, z] of wheelPositions) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(x, y, z);
      w.rotation.z = Math.PI / 2;
      w.castShadow = true;
      this.mesh.add(w);
    }

    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;
    scene.add(this.mesh);
  }

  resetPosition(pos: THREE.Vector3, rot: number = 0) {
    this.position.copy(pos);
    this.rotation = rot;
    this.velocity = 0;
    this.angularVelocity = 0;
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;
    
    this.smoothBackDist = 7;
    this.smoothHeight = 2.3;
    this.smoothFov = 70;
  }

  update(dt: number, input: Input) {
    if (input.gas) {
      this.velocity += this.acceleration * dt;
    } else if (input.brake) {
      this.velocity -= this.brakeForce * dt;
    } else {
      this.velocity *= (1 - this.drag * dt);
    }
    this.velocity = Math.max(-this.maxSpeed * 0.3, Math.min(this.maxSpeed, this.velocity));

    const speedFactor = Math.min(Math.abs(this.velocity) / this.maxSpeed, 1);
    if (input.left) {
      this.angularVelocity = this.turnSpeed * speedFactor;
    } else if (input.right) {
      this.angularVelocity = -this.turnSpeed * speedFactor;
    } else {
      this.angularVelocity *= 0.9;
    }
    this.rotation += this.angularVelocity * dt;

    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0), this.rotation
    );
    this.position.addScaledVector(forward, this.velocity * dt);

    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;
  }

  updateCamera(camera: THREE.PerspectiveCamera, dt: number = 0.016) {
    const speedRatio = Math.min(Math.abs(this.velocity) / this.maxSpeed, 1);

    // Целевые значения
    const targetBackDist = 7 + speedRatio * 0.8;
    const targetHeight = 2.3 + speedRatio * 0.2;
    const targetFov = 70 + speedRatio * 3;

    // === Frame-rate independent smoothing для параметров ===
    // Экспоненциальный фильтр — одинаково работает на 30 и 60 FPS
    const paramsSmooth = 1 - Math.exp(-5 * dt);
    this.smoothBackDist += (targetBackDist - this.smoothBackDist) * paramsSmooth;
    this.smoothHeight += (targetHeight - this.smoothHeight) * paramsSmooth;
    this.smoothFov += (targetFov - this.smoothFov) * paramsSmooth;

    // === Целевая позиция камеры (в локальных координатах машины) ===
    const targetOffset = new THREE.Vector3(0, this.smoothHeight, -this.smoothBackDist);
    targetOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);

    const targetPos = new THREE.Vector3(
      this.position.x + targetOffset.x,
      this.position.y + targetOffset.y,
      this.position.z + targetOffset.z
    );

    // === Frame-rate independent lerp для позиции ===
    // ВАЖНО: speed=6 — это коэффициент. Чем больше — тем плотнее следует
    // При speed=6: на 60 FPS — камера почти на месте, но с лёгким запаздыванием
    //                на 30 FPS — то же самое
    const posSmooth = 1 - Math.exp(-6 * dt);
    camera.position.x += (targetPos.x - camera.position.x) * posSmooth;
    camera.position.y += (targetPos.y - camera.position.y) * posSmooth;
    camera.position.z += (targetPos.z - camera.position.z) * posSmooth;

    // === Смотрим на машину ===
    camera.lookAt(
      this.position.x,
      this.position.y + 0.8,
      this.position.z
    );

    // === FOV ===
    if (Math.abs(this.smoothFov - camera.fov) > 0.05) {
      camera.fov = this.smoothFov;
      camera.updateProjectionMatrix();
    }
  }
}
