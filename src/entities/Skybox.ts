import * as THREE from 'three';

export class Skybox {
  constructor(scene: THREE.Scene) {
    // Просто цвет неба — самый надёжный вариант
    scene.background = new THREE.Color(0x87ceeb); // голубое небо

    // Туман на горизонте, чтобы горы "растворялись"
    scene.fog = new THREE.Fog(0x87ceeb, 200, 600);
  }
}
