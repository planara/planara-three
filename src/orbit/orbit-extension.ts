// Core
import { type Camera } from 'three';
// Extensions
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Расширение для OrbitControls с отслеживанием управления камерой
 * @public
 */
export class OrbitWithState extends OrbitControls {
  /** Используется ли Orbit-controls */
  public isInteracting: boolean = false;

  private onMouseDown = () => (this.isInteracting = true);
  private onTouchStart = () => (this.isInteracting = true);
  private onMouseUp = () => (this.isInteracting = false);
  private onTouchEnd = () => (this.isInteracting = false);

  public constructor(camera: Camera, domElement?: HTMLElement | null) {
    super(camera, domElement);

    // Добавление обработчиков событий
    this.domElement?.addEventListener('mousedown', this.onMouseDown);
    this.domElement?.addEventListener('mouseup', this.onMouseUp);
    this.domElement?.addEventListener('touchstart', this.onTouchStart);
    this.domElement?.addEventListener('touchend', this.onTouchEnd);
  }

  /** Очистка новых обработчиков событий */
  public dispose() {
    this.domElement?.removeEventListener('mousedown', this.onMouseDown);
    this.domElement?.removeEventListener('mouseup', this.onMouseUp);
    this.domElement?.removeEventListener('touchstart', this.onTouchStart);
    this.domElement?.removeEventListener('touchend', this.onTouchEnd);

    super.dispose();
  }
}
