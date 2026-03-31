// Core
import * as THREE from 'three';

/**
 * Группа треугольников, образующих одну логическую грань.
 */
export type FaceInfo = {
  /** Меш, которому принадлежит грань. */
  mesh: THREE.Mesh;

  /** Стартовый triangle index, полученный из raycast. */
  faceIndex: number;

  /** Индексы треугольников, входящих в грань. */
  triangleIndices: number[];

  /**
   * Уникальные индексы вершин исходной geometry,
   * которые участвуют в выбранной грани.
   */
  vertexIndices: number[];

  /**
   * Отображение вершин proxy-геометрии в индексы вершин исходного меша.
   * Нужен для обратной записи transform'а proxy обратно в mesh geometry.
   */
  proxyVertexMap: number[];
};
