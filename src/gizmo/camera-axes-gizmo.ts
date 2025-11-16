import {
  Scene,
  PerspectiveCamera,
  Object3D,
  DirectionalLight,
  WebGLRenderer,
  Quaternion,
  Raycaster,
  Vector2,
  Vector3,
  type Camera,
} from 'three';
import { GizmoAxesHelper, type GizmoAxis } from '../axes/gizmo-axes-helper';

export interface CameraAxesGizmoOptions {
  /** Размер квадрата под гизмо в пикселях */
  size?: number;
  /** Отступ от края в пикселях */
  margin?: number;
  /** Длительность анимации перелёта к оси (мс) */
  animationDuration?: number;
}

export class CameraAxesGizmo {
  private readonly renderer: WebGLRenderer;
  private readonly mainCamera: Camera;

  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly root: Object3D;

  private readonly size: number;
  private readonly margin: number;
  private readonly animationDuration: number;

  private readonly _q = new Quaternion();

  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly pickables: Object3D[] = [];

  private viewportWidth = 0;
  private viewportHeight = 0;

  private readonly target = new Vector3(0, 0, 0);
  private readonly onPointerDownBound: (event: PointerEvent) => void;

  // состояние анимации камеры
  private readonly animFromPos = new Vector3();
  private readonly animToPos = new Vector3();
  private readonly animFromQuat = new Quaternion();
  private readonly animToQuat = new Quaternion();
  private animStart = 0;
  private animActive = false;

  public constructor(
    renderer: WebGLRenderer,
    mainCamera: Camera,
    options: CameraAxesGizmoOptions = {},
  ) {
    this.renderer = renderer;
    this.mainCamera = mainCamera;

    this.size = options.size ?? 80;
    this.margin = options.margin ?? 16;
    this.animationDuration = options.animationDuration ?? 300;

    this.scene = new Scene();
    this.scene.background = null;

    this.camera = new PerspectiveCamera(50, 1, 0.1, 10);
    this.camera.position.set(0, 0, 3);
    this.scene.add(this.camera);

    this.root = new Object3D();
    this.scene.add(this.root);

    const axes = new GizmoAxesHelper(1, {
      radius: 0.06,
      sphereRadius: 0.2,
      negativeColor: 0x444444,
    });
    this.root.add(axes);
    this.pickables.push(...axes.pickables);

    const light = new DirectionalLight(0xffffff, 0.8);
    light.position.set(2, 2, 4);
    this.scene.add(light);

    // обработчик кликов по canvas
    this.onPointerDownBound = this.onPointerDown.bind(this);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDownBound);
  }

  /**
   * Рисует гизмо в правом нижнем углу.
   */
  render(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    // Обновление анимации камеры перед тем, как читать её ориентацию
    this.updateAnimation();

    // Инвертируем мировой кватернион камеры,
    // чтобы гизмо показывало мировые оси в проекции текущей камеры
    this.mainCamera.getWorldQuaternion(this._q);
    this._q.invert();
    this.root.quaternion.copy(this._q);

    const s = this.size;
    const m = this.margin;

    const x = viewportWidth - s - m;
    const y = m;

    const renderer = this.renderer;
    const prevAutoClear = renderer.autoClear;

    renderer.autoClear = false;
    renderer.setViewport(x, y, s, s);
    renderer.setScissor(x, y, s, s);
    renderer.setScissorTest(true);

    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();

    renderer.render(this.scene, this.camera);

    renderer.autoClear = prevAutoClear;
    renderer.setViewport(0, 0, viewportWidth, viewportHeight);
    renderer.setScissorTest(false);
  }

  private onPointerDown(event: PointerEvent) {
    if (!this.viewportWidth || !this.viewportHeight) return;

    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    const xDom = event.clientX - rect.left;
    const yDom = event.clientY - rect.top;

    const width = this.viewportWidth;
    const height = this.viewportHeight;

    const s = this.size;
    const m = this.margin;

    // Положение квадрата гизмо в координатах canvas
    const gizmoLeft = width - s - m;
    const gizmoRight = width - m;
    const gizmoTop = height - m - s;
    const gizmoBottom = height - m;

    // Попал ли клик в гизмо
    if (xDom < gizmoLeft || xDom > gizmoRight || yDom < gizmoTop || yDom > gizmoBottom) {
      return;
    }

    // Нормализованные координаты внутри гизмо
    const localX = (xDom - gizmoLeft) / s;
    const localY = (yDom - gizmoTop) / s;

    // Перевод в NDC [-1..1]
    const ndcX = localX * 2 - 1;
    const ndcY = -(localY * 2 - 1);

    this.pointer.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(this.pickables, false);
    const [hit] = intersects;
    if (!hit) return;

    const obj = hit.object;
    const axis = obj.userData.axis as GizmoAxis | undefined;
    if (!axis) return;

    this.snapToAxis(axis);
  }

  private snapToAxis(axis: GizmoAxis) {
    const cam = this.mainCamera;

    // расстояние от камеры до таргета
    const dir = cam.position.clone().sub(this.target);
    let distance = dir.length();
    if (!isFinite(distance) || distance === 0) {
      distance = 10;
    }

    const targetPos = new Vector3();

    switch (axis) {
      case 'x+':
        targetPos.set(this.target.x + distance, this.target.y, this.target.z);
        break;
      case 'x-':
        targetPos.set(this.target.x - distance, this.target.y, this.target.z);
        break;
      case 'y+':
        targetPos.set(this.target.x, this.target.y + distance, this.target.z);
        break;
      case 'y-':
        targetPos.set(this.target.x, this.target.y - distance, this.target.z);
        break;
      case 'z+':
        targetPos.set(this.target.x, this.target.y, this.target.z + distance);
        break;
      case 'z-':
        targetPos.set(this.target.x, this.target.y, this.target.z - distance);
        break;
    }

    // старт анимации
    this.animFromPos.copy(cam.position);
    this.animFromQuat.copy(cam.quaternion);

    // считаем целевую ориентацию через lookAt
    cam.position.copy(targetPos);
    cam.lookAt(this.target);
    this.animToPos.copy(cam.position);
    this.animToQuat.copy(cam.quaternion);

    // откатываемся обратно — анимация сама доведёт
    cam.position.copy(this.animFromPos);
    cam.quaternion.copy(this.animFromQuat);

    this.animStart = performance.now();
    this.animActive = true;
  }

  private updateAnimation() {
    if (!this.animActive) return;

    const now = performance.now();
    const t = Math.min(1, (now - this.animStart) / this.animationDuration);

    const k = t * t * (3 - 2 * t);

    this.mainCamera.position.lerpVectors(this.animFromPos, this.animToPos, k);
    this.mainCamera.quaternion.slerpQuaternions(this.animFromQuat, this.animToQuat, k);

    if (t >= 1) {
      this.animActive = false;
      this.mainCamera.position.copy(this.animToPos);
      this.mainCamera.quaternion.copy(this.animToQuat);
    }
  }

  dispose() {
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDownBound);
  }

  [Symbol.dispose]() {
    this.dispose();
  }
}
