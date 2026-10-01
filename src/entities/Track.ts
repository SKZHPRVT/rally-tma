import * as THREE from 'three';

export class Track {
  constructor(scene: THREE.Scene) {
    const groundGeo = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3a5f2a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    this.createRoad(scene);
    this.scatterTrees(scene);
  }

  createRoad(scene: THREE.Scene) {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });

    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 50; i++) {
      const z = -i * 20;
      const x = Math.sin(i * 0.3) * 30;
      points.push(new THREE.Vector3(x, 0.05, z));
    }

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];

      const geo = new THREE.PlaneGeometry(8, 20, 1, 1);
      const road = new THREE.Mesh(geo, roadMat);

      const mid = a.clone().add(b).multiplyScalar(0.5);
      road.position.copy(mid);
      road.position.y = 0.05;

      const dir = b.clone().sub(a).normalize();
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = Math.atan2(dir.x, dir.z);

      road.receiveShadow = true;
      scene.add(road);
    }
  }

  scatterTrees(scene: THREE.Scene) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d5016 });

    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 800 - 400;

      const roadX = Math.sin(-z / 20 * 0.3) * 30;
      if (Math.abs(x - roadX) < 15) continue;

      const tree = new THREE.Group();

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 3, 6), trunkMat
      );
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);

      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(2, 4, 6), leafMat
      );
      leaves.position.y = 4.5;
      leaves.castShadow = true;
      tree.add(leaves);

      tree.position.set(x, 0, z);
      scene.add(tree);
    }
  }
}
