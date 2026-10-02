import * as THREE from 'three';

export class Skybox {
  constructor(scene: THREE.Scene) {
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 200, 600);
  }
}
