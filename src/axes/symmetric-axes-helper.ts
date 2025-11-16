// Core
import * as THREE from 'three';

/**
 * `AxesHelper` с симметричными осями во все стороны (+/- X, Y, Z)
 * @public
 */
export class SymmetricAxesHelper extends THREE.Group {
  constructor(size = 5) {
    super();

    const axes = [
      { dir: new THREE.Vector3(1, 0, 0), color: 0xff0000 }, // +X
      { dir: new THREE.Vector3(-1, 0, 0), color: 0xff0000 }, // -X
      { dir: new THREE.Vector3(0, 1, 0), color: 0x00ff00 }, // +Y
      { dir: new THREE.Vector3(0, -1, 0), color: 0x00ff00 }, // -Y
      { dir: new THREE.Vector3(0, 0, 1), color: 0x0000ff }, // +Z
      { dir: new THREE.Vector3(0, 0, -1), color: 0x0000ff }, // -Z
    ];

    for (const { dir, color } of axes) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        dir.clone().multiplyScalar(size),
      ]);
      const material = new THREE.LineBasicMaterial({ color });
      const line = new THREE.Line(geometry, material);
      this.add(line);
    }
  }
}
