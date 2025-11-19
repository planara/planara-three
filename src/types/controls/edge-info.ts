import * as THREE from 'three';

/**
 * Метаданные, описывающие выбранное ребро меша / LineSegments.
 * Используются инструментами редактирования для синхронизации гизмо с реальной геометрией.
 */
export type EdgeInfo = {
  /**
   * Коллекция рёбер (LineSegments), из которой было выбрано текущее ребро.
   */
  lines: THREE.LineSegments;

  /**
   * Индекс сегмента в `lines.geometry` (номер ребра).
   */
  seg: number;

  /**
   * Исходный Mesh, которому принадлежит это ребро.
   */
  mesh?: THREE.Mesh | null;

  /**
   * Индексы первой вершины ребра в буфере позиций `lines.geometry.attributes.position`.
   */
  aIndices: number[];

  /**
   * Индексы второй вершины ребра в буфере позиций `lines.geometry.attributes.position`.
   */
  bIndices: number[];

  /** Индексы вершин в `lines.geometry.attributes.position` для конца A. */
  aEdgeIndices: number[];

  /** Индексы вершин в `lines.geometry.attributes.position` для конца B. */
  bEdgeIndices: number[];
};
