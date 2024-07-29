import {
  _decorator,
  CCBoolean,
  CCFloat,
  Component,
  Input,
  input,
  instantiate,
  KeyCode,
  Node,
  Prefab,
  Vec3,
} from "cc";
import { Cube } from "./Cube";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: CCFloat, visible: true })
  private _startY: number = 0;
  @property({ type: CCFloat, visible: true })
  private _yStep: number = 1;

  @property({ type: CCFloat, visible: true })
  private _startX: number = -1;
  @property({ type: CCFloat, visible: true })
  private _endX: number = 1;
  @property({ type: CCFloat, visible: true })
  private _startZ: number = -1;
  @property({ type: CCFloat, visible: true })
  private _endZ: number = 1;

  @property({ type: Node, visible: true })
  private _startPointLeft: Node = null;
  @property({ type: Node, visible: true })
  private _startPointRight: Node = null;
  @property({ type: Node, visible: true })
  private _cubeContainer: Node = null;

  @property({ type: CCBoolean, visible: true })
  private _spawnAtLeft: boolean = false;

  @property({ type: Cube, visible: true })
  private _currentCube: Cube = null;

  @property({ type: Prefab, visible: true })
  private _cubePrefab: Prefab = null;

  @property({ type: Node, visible: true })
  private _mainCam: Node = null;

  private _pressedKeys: Set<number> = new Set();

  private _camOriginY: number = 0;

  protected onLoad(): void {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    // input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    this._camOriginY = this._mainCam.position.y;
  }

  public onKeyDown(event: { keyCode: any }) {
    this._pressedKeys.add(event.keyCode);
  }

  //   public onKeyUp(event: { keyCode: any }) {
  //     this._pressedKeys.delete(event.keyCode);
  //   }

  protected start(): void {
    this.spawnNewCube();
  }

  protected update(dt: number): void {
    this.handleInput();
    this.handleCamPosition(dt);
  }

  protected handleInput() {
    var touch: boolean = false;
    if (this._pressedKeys.has(KeyCode.SPACE)) {
      touch = true;
      this._pressedKeys.delete(KeyCode.SPACE);
    }
    this.handleStopCube(touch);
  }

  protected handleCamPosition(dt: number) {
    let newPos: Vec3 = this._mainCam.position;
    newPos.y = Math.min(
      this._mainCam.position.y + dt,
      this._camOriginY + this.node.position.y
    );
    this._mainCam.position = newPos;
  }

  protected handleStopCube(touch: boolean) {
    if (!touch) return;

    this._currentCube.StopCube(
      this._startX,
      this._endX,
      this._startZ,
      this._endZ
    );

    this._endX =
      this._currentCube.node.worldPosition.x +
      this._currentCube.node.scale.x / 2;
    this._startX = -this._endX;
    this._endZ =
      this._currentCube.node.worldPosition.z +
      this._currentCube.node.scale.z / 2;
    this._startZ = -this._endZ;

    this.node.position = new Vec3(
      this.node.position.x,
      this.node.position.y + this._yStep,
      this.node.position.z
    );
    this._spawnAtLeft = !this._spawnAtLeft;
    this.spawnNewCube();
  }

  protected spawnNewCube() {
    var go = instantiate(this._cubePrefab);
    go.setWorldPosition(
      this._spawnAtLeft
        ? this._startPointLeft.worldPosition
        : this._startPointRight.worldPosition
    );
    this._currentCube = go.getComponent(Cube);
    this._currentCube.followZ = this._spawnAtLeft ? false : true;
    go.setParent(this._cubeContainer);
  }
}
