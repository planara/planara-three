// Core
import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three';
// Types
import type { GizmoAxesHelperOptions } from '../types/axes/gizmo-axes-helper-options';
import type { GizmoAxis } from '../types/axes/gizmo-axes';

/**
 * Симметричные оси:
 *  - Оси идут только в положительные направления (0 -> +L)
 *  - На концах осей цветные шарики (+X/+Y/+Z)
 *  - В отрицательных направлениях нет осей, только серые шарики (-X/-Y/-Z)
 *  @public
 */
export class GizmoAxesHelper extends Group {
  /** Объекты, по которым можно кликать (шарики) */
  public readonly pickables: Object3D[] = [];

  constructor(length = 1, options: GizmoAxesHelperOptions = {}) {
    super();

    const radius = options.radius ?? length * 0.04;
    const sphereRadius = options.sphereRadius ?? radius * 1.5;
    const negativeColor = options.negativeColor ?? 0xaaaaaa;

    const axes: { dir: Vector3; color: number; axis: GizmoAxis }[] = [
      { dir: new Vector3(1, 0, 0), color: 0xff0000, axis: 'x+' }, // +X
      { dir: new Vector3(0, 1, 0), color: 0x00ff00, axis: 'y+' }, // +Y
      { dir: new Vector3(0, 0, 1), color: 0x0000ff, axis: 'z+' }, // +Z
    ];

    const cylGeometry = new CylinderGeometry(radius, radius, length, 8, 1, true);
    const sphereGeometry = new SphereGeometry(sphereRadius, 12, 12);

    const yAxis = new Vector3(0, 1, 0);
    const q = new Quaternion();

    for (const { dir, color, axis } of axes) {
      const dirNorm = dir.clone().normalize();

      // Ось: 0 -> +length
      {
        const material = new MeshBasicMaterial({ color });
        const cylinder = new Mesh(cylGeometry, material);

        // Середина цилиндра в +length / 2
        cylinder.position.copy(dirNorm).multiplyScalar(length / 2);

        // Повернуть цилиндр вдоль dirNorm
        q.setFromUnitVectors(yAxis, dirNorm);
        cylinder.quaternion.copy(q);

        this.add(cylinder);

        // Цветной шарик на положительном конце (+L)
        const sphereMat = new MeshBasicMaterial({ color });
        const sphere = new Mesh(sphereGeometry, sphereMat);
        sphere.position.copy(dirNorm).multiplyScalar(length);
        sphere.userData.axis = axis;
        this.add(sphere);
        this.pickables.push(sphere);
      }

      // Серый шарик на отрицательном конце (-L), без оси
      {
        const negDir = dirNorm.clone().multiplyScalar(-1);
        const sphereMat = new MeshBasicMaterial({ color: negativeColor });
        const sphere = new Mesh(sphereGeometry, sphereMat);
        sphere.position.copy(negDir).multiplyScalar(length);

        sphere.userData.axis = axis === 'x+' ? 'x-' : axis === 'y+' ? 'y-' : 'z-';
        this.add(sphere);
        this.pickables.push(sphere);
      }
    }
  }
}
