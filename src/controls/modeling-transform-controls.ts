// Core
import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
// Types
import type { EdgeInfo } from '../types/controls/edge-info';

/** Расширенные `TransformControls` для редактирования точек/ребер/граней модели */
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

    // TODO: добавить сохранение предыдущего состояния, чтобы можно было откатиться назад
    if (this.mode === 'translate' && edge) this._applyEdgeTranslate(obj as THREE.Line, edge);
  }

  private _applyEdgeTranslate(line: THREE.Line, edge: EdgeInfo) {
    const { lines, mesh, aIndices, bIndices, aEdgeIndices, bEdgeIndices } = edge;

    // Получение локальных точек линии
    const g = line.geometry as THREE.BufferGeometry;
    const pos = g.getAttribute('position') as THREE.BufferAttribute;

    const aLocalLine = new THREE.Vector3().fromBufferAttribute(pos, 0);
    const bLocalLine = new THREE.Vector3().fromBufferAttribute(pos, 1);

    // Перевод точек их в мировые координаты
    const aWorld = line.localToWorld(aLocalLine.clone());
    const bWorld = line.localToWorld(bLocalLine.clone());

    if (!mesh) return;

    // Перевод точек в локальные координаты меша
    const toLocalMesh = new THREE.Matrix4().copy(mesh.matrixWorld).invert();
    const aLocalMesh = aWorld.clone().applyMatrix4(toLocalMesh);
    const bLocalMesh = bWorld.clone().applyMatrix4(toLocalMesh);

    const meshGeo = mesh.geometry as THREE.BufferGeometry;
    const meshPos = meshGeo.getAttribute('position') as THREE.BufferAttribute;

    // Обновление всех вершин, которые относятся к этому ребру
    for (const idx of aIndices) {
      meshPos.setXYZ(idx, aLocalMesh.x, aLocalMesh.y, aLocalMesh.z);
    }
    for (const idx of bIndices) {
      meshPos.setXYZ(idx, bLocalMesh.x, bLocalMesh.y, bLocalMesh.z);
    }
    meshPos.needsUpdate = true;

    meshGeo.computeVertexNormals();
    meshGeo.computeBoundingBox();
    meshGeo.computeBoundingSphere();

    {
      const toLocalLines = new THREE.Matrix4().copy(lines.matrixWorld).invert();
      const aLocalLines = aWorld.clone().applyMatrix4(toLocalLines);
      const bLocalLines = bWorld.clone().applyMatrix4(toLocalLines);

      const srcPos = lines.geometry.getAttribute('position') as THREE.BufferAttribute;

      // Перемещение вершин линий, которые связаны с этим ребром
      for (const idx of aEdgeIndices) {
        srcPos.setXYZ(idx, aLocalLines.x, aLocalLines.y, aLocalLines.z);
      }
      for (const idx of bEdgeIndices) {
        srcPos.setXYZ(idx, bLocalLines.x, bLocalLines.y, bLocalLines.z);
      }
      srcPos.needsUpdate = true;

      lines.geometry.computeBoundingBox();
      lines.geometry.computeBoundingSphere();
    }
  }
}
