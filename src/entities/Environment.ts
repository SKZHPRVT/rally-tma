import * as THREE from 'three';

export class Environment {
  private textures: { [key: string]: THREE.Texture } = {};

  constructor(scene: THREE.Scene, textures: { [key: string]: THREE.Texture }) {
    this.textures = textures;
    this.createMountains(scene);
    this.createBushes(scene);
    this.createRocks(scene);
  }

  // ГОРЫ на горизонте
  createMountains(scene: THREE.Scene) {
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x8b7d6b });

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const dist = 350 + Math.random() * 150;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const height = 80 + Math.random() * 120;
      const radius = 60 + Math.random() * 40;

      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(radius, height, 6),
        mountainMat
      );
      mountain.position.set(x, height / 2 - 10, z);
      mountain.rotation.y = Math.random() * Math.PI;
      scene.add(mountain);
    }
  }

  // КУСТЫ вдоль обочин
  createBushes(scene: THREE.Scene) {
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x3a6b2a });

    for (let i = 0; i < 400; i++) {
      const z = (Math.random() - 0.5) * 1500;
      const roadX = Math.sin(-z / 20 * 0.3) * 30;
      const side = Math.random() > 0.5 ? 1 : -1;
      const offset = 7 + Math.random() * 5;
      const x = roadX + side * offset;

      const scale = 0.4 + Math.random() * 0.6;
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(scale, 6, 4),
        bushMat
      );
      bush.position.set(x, scale * 0.6, z);
      bush.castShadow = true;
      scene.add(bush);
    }
  }

  // КАМНИ вдоль обочин
  createRocks(scene: THREE.Scene) {
    const rockMat = new THREE.MeshStandardMaterial({
      map: this.textures['rock1'],
      color: 0xcccccc,
    });

    for (let i = 0; i < 150; i++) {
      const z = (Math.random() - 0.5) * 1500;
      const roadX = Math.sin(-z / 20 * 0.3) * 30;
      const side = Math.random() > 0.5 ? 1 : -1;
      const offset = 5.5 + Math.random() * 3;
      const x = roadX + side * offset;

      const scale = 0.4 + Math.random() * 0.8;
      const rock = new THREE.Mesh(
        new THREE.IcosahedronGeometry(scale, 0),
        rockMat
      );
      rock.position.set(x, scale * 0.4, z);
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      scene.add(rock);
    }
  }
}
