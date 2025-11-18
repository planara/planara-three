// Core
import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
// Types
import type { EdgeInfo } from '../types/controls/edge-info';

export class ModelingTransformControls extends TransformControls {
  public constructor(camera: THREE.Camera, domElement: HTMLElement) {
    super(camera, domElement);
  }

  public override pointerMove(pointer: PointerEvent | null): void {
    super.pointerMove(pointer);

    const obj = this.object as THREE.Object3D | null;
    if (!obj) return;

    const edge: EdgeInfo | undefined = (obj as any).userData?.edgeInfo;
    if (!edge) return;

    if (this.mode === 'translate' && edge) this._applyEdgeTranslate(obj as THREE.Line, edge);
  }

  private _applyEdgeTranslate(line: THREE.Line, edge: EdgeInfo) {
    const { lines, aIndex, bIndex, mesh } = edge;

    // Получение локальных точек линии
    const g = line.geometry as THREE.BufferGeometry;
    const pos = g.getAttribute('position') as THREE.BufferAttribute;

    const aLocal = new THREE.Vector3().fromBufferAttribute(pos, 0);
    const bLocal = new THREE.Vector3().fromBufferAttribute(pos, 1);

    // Перевод в мировые координаты
    const aWorld = line.localToWorld(aLocal.clone());
    const bWorld = line.localToWorld(bLocal.clone());

    // Перевод в локальные координаты LineSegments, где живёт реальное ребро
    const toLocalLines = new THREE.Matrix4().copy(lines.matrixWorld).invert();
    const aLocalLines = aWorld.clone().applyMatrix4(toLocalLines);
    const bLocalLines = bWorld.clone().applyMatrix4(toLocalLines);

    // Обновление геометрии линий
    const srcPos = lines.geometry.getAttribute('position') as THREE.BufferAttribute;
    srcPos.setXYZ(aIndex, aLocalLines.x, aLocalLines.y, aLocalLines.z);
    srcPos.setXYZ(bIndex, bLocalLines.x, bLocalLines.y, bLocalLines.z);
    srcPos.needsUpdate = true;

    lines.geometry.computeBoundingBox();
    lines.geometry.computeBoundingSphere();

    // Обновление трансформации у фигуры
    if (mesh) {
      // Получение геометрии и позиции текущей фигуры в пространстве
      const meshGeo = mesh.geometry as THREE.BufferGeometry;
      const meshPos = meshGeo.getAttribute('position') as THREE.BufferAttribute;

      // Обновление геометрии через новые позиции вершин
      meshPos.setXYZ(aIndex, aLocalLines.x, aLocalLines.y, aLocalLines.z);
      meshPos.setXYZ(bIndex, bLocalLines.x, bLocalLines.y, bLocalLines.z);
      meshPos.needsUpdate = true;

      // Пересчет новой геометрии
      meshGeo.computeVertexNormals();
      meshGeo.computeBoundingBox();
      meshGeo.computeBoundingSphere();
    }
  }
}
