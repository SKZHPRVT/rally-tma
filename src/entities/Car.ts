import * as THREE from 'three';
import { Input } from '../game/Input';
import { World } from '../world/World';

export class Car {
  mesh: THREE.Group;
  body: THREE.Mesh;

  position: THREE.Vector3;
  rotation: number = 0;
  velocity: number = 0;
  angularVelocity: number = 0;
  
  // Вертикальная физика (прыжки)
  verticalVelocity: number = 0;
  isOnGround: boolean = true;
  groundHeight: number = 0;

  maxSpeed: number = 40;
  acceleration: number = 15;
  brakeForce: number = 30;
  drag: number = 0.5;
  turnSpeed: number = 1.8;
  gravity: number = 25;

  constructor(scene: THREE.Scene, spawnPoint?: THREE.Vector3) {
    this.mesh = new THREE.Group();
    this.position = spawnPoint ? spawnPoint.clone() : new THREE.Vector3(0, 1, 0);

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
    scene.add(this.mesh);
  }

  update(dt: number, input: Input, world: World) {
    // Горизонтальная скорость
    if (input.gas) {
      this.velocity += this.acceleration * dt;
    } else if (input.brake) {
      this.velocity -= this.brakeForce * dt;
    } else {
      this.velocity *= (1 - this.drag * dt);
    }
    this.velocity = Math.max(-this.maxSpeed * 0.3, Math.min(this.maxSpeed, this.velocity));

    // Поворот
    const speedFactor = Math.min(Math.abs(this.velocity) / this.maxSpeed, 1);
    if (input.left) {
      this.angularVelocity = this.turnSpeed * speedFactor;
    } else if (input.right) {
      this.angularVelocity = -this.turnSpeed * speedFactor;
    } else {
      this.angularVelocity *= 0.9;
    }
    this.rotation += this.angularVelocity * dt;

    // Движение вперёд
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0), this.rotation
    );
    this.position.x += forward.x * this.velocity * dt;
    this.position.z += forward.z * this.velocity * dt;

    // === ВЕРТИКАЛЬНАЯ ФИЗИКА ===
    // Высота рельефа под машиной
    this.groundHeight = world.getHeight(this.position.x, this.position.z) + 0.5;

    if (this.isOnGround) {
      // На земле — двигаемся по рельефу
      if (this.position.y < this.groundHeight + 0.1) {
        this.position.y = this.groundHeight;
        this.verticalVelocity = 0;
      } else {
        // Оторвались от земли — падаем
        this.isOnGround = false;
      }
    }
    
    if (!this.isOnGround) {
      // В воздухе — гравитация
      this.verticalVelocity -= this.gravity * dt;
      this.position.y += this.verticalVelocity * dt;

      // Приземление
      if (this.position.y <= this.groundHeight) {
        this.position.y = this.groundHeight;
        this.verticalVelocity = 0;
        this.isOnGround = true;
      }
    }

    // Обновляем mesh
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;

    // Наклон на склоне (простой)
    if (this.isOnGround) {
      const h1 = world.getHeight(this.position.x + 1, this.position.z);
      const h2 = world.getHeight(this.position.x, this.position.z + 1);
      const tiltX = (h2 - this.groundHeight + 0.5) * 0.3;
      const tiltZ = (h1 - this.groundHeight + 0.5) * 0.3;
      this.mesh.rotation.x = tiltZ;
      this.mesh.rotation.z = -tiltX;
    }
  }

  updateCamera(camera: THREE.PerspectiveCamera) {
    const speedRatio = Math.min(Math.abs(this.velocity) / this.maxSpeed, 1);

    const backDist = -8 - speedRatio * 1;
    const height = 3 + speedRatio * 0.5;

    const behind = new THREE.Vector3(0, height, backDist).applyAxisAngle(
      new THREE.Vector3(0, 1, 0), this.rotation
    );
    const targetPos = this.position.clone().add(behind);
    camera.position.lerp(targetPos, 0.12);

    camera.lookAt(this.position.x, this.position.y + 0.5, this.position.z);

    const targetFov = 70 + speedRatio * 3;
    camera.fov += (targetFov - camera.fov) * 0.05;
    camera.updateProjectionMatrix();
  }
}
