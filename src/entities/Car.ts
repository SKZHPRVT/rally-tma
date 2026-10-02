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

    const backDist = -7 - speedRatio * 0.5;
    const height = 2.2 + speedRatio * 0.15;

    const behind = new THREE.Vector3(0, height, backDist).applyAxisAngle(
      new THREE.Vector3(0, 1, 0), this.rotation
    );
    const targetPos = this.position.clone().add(behind);
    camera.position.lerp(targetPos, 0.15);

    camera.lookAt(this.position.x, this.position.y + 0.5, this.position.z);

    // === ДИНАМИЧЕСКИЙ FOV ПО ASPECT RATIO ===
    // 110° по горизонтали — как было раньше в горизонтали
    const HORIZONTAL_FOV_BASE = 110 + speedRatio * 5;
    
    const hFovRad = HORIZONTAL_FOV_BASE * Math.PI / 180;
    const vFovRad = 2 * Math.atan(Math.tan(hFovRad / 2) / camera.aspect);
    const vFovDeg = vFovRad * 180 / Math.PI;
    
    // Ограничения
    const clampedFov = Math.max(50, Math.min(120, vFovDeg));
    
    camera.fov = clampedFov;
    camera.updateProjectionMatrix();
  }
}
