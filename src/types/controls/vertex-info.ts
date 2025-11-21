// Core
import * as THREE from 'three';

/** Метаданные выбранной вершины */
export type VertexInfo = {
  points: THREE.Points;
  index: number;
  mesh: THREE.Mesh;
  vertexIndices: number[];

  // для синхронизации рёберного оверлея
  lines?: THREE.LineSegments | null;
  edgeVertexIndices?: number[];
};
