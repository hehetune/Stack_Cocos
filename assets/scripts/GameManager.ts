import {
  _decorator,
  CCBoolean,
  CCFloat,
  Component,
  Input,
  input,
  KeyCode,
  Node,
  Prefab,
  Vec3,
} from "cc";
import { Cube } from "./Cube";
import { PoolManager } from "./PoolingSystem/PoolManager";
import { IPoolObject } from "./PoolingSystem/IPoolObject";
import { PoolObject } from "./PoolingSystem/PoolObject";
import { GameTheme } from "./GameTheme";
const { ccclass, property } = _decorator;

enum GameState {
  Wait,
  Playing,
}

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: CCFloat, visible: true })
  private _startY: number = 2.1;
  @property({ type: CCFloat, visible: true })
  private _yStep: number = 0.2;

  @property({ type: CCFloat, visible: true })
  private _startX: number = -0.5;
  @property({ type: CCFloat, visible: true })
  private _endX: number = 0.5;
  @property({ type: CCFloat, visible: true })
  private _startZ: number = -0.5;
  @property({ type: CCFloat, visible: true })
  private _endZ: number = 0.5;

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

  private _gameState: GameState = GameState.Wait;

  private _score: number = 0;

  private _cubeQueue: Cube[] = [];
  private _maxQueueSize: number = 15;

  protected onLoad(): void {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    // input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    this._camOriginY = this._mainCam.worldPosition.y;
  }

  public onKeyDown(event: { keyCode: any }) {
    this._pressedKeys.add(event.keyCode);
  }

  //   public onKeyUp(event: { keyCode: any }) {
  //     this._pressedKeys.delete(event.keyCode);
  //   }

  protected start(): void {
    this.retry();
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
    this.handleTouchAction(touch);
  }

  protected handleCamPosition(dt: number) {
    let newPos: Vec3 = this._mainCam.worldPosition;
    newPos.y = Math.min(
      this._mainCam.worldPosition.y + dt,
      this._camOriginY + this.node.worldPosition.y
    );
    this._mainCam.worldPosition = newPos;
  }

  protected handleTouchAction(touch: boolean) {
    if (!touch) return;

    // cache current cube x and z location
    let cubeStartX = this._currentCube.startX;
    let cubeStartZ = this._currentCube.startZ;
    let cubeEndX = this._currentCube.endX;
    let cubeEndZ = this._currentCube.endZ;

    if (
      this._startX > cubeEndX ||
      this._endX < cubeStartX ||
      this._startZ > cubeEndZ ||
      this._endZ < cubeStartZ
    ) {
      // If no overlap, game over!
      this.loseGame();
      this._currentCube.fallDownThisCube();
      return;
    }

    // stop the cube
    this._currentCube.stopCube(
      this._startX,
      this._endX,
      this._startZ,
      this._endZ
    );

    this._startX = this._currentCube.startX;
    this._endX = this._currentCube.endX;
    this._startZ = this._currentCube.startZ;
    this._endZ = this._currentCube.endZ;

    // increase y view
    this.node.worldPosition = new Vec3(
      this.node.worldPosition.x,
      this.node.worldPosition.y + this._yStep,
      this.node.worldPosition.z
    );

    // change spawn location
    this._spawnAtLeft = !this._spawnAtLeft;
    // spawn new cube
    this.spawnNewCube();

    // increase score
    this._score++;

    // change game theme
    GameTheme.changeTheme();
  }

  public loseGame(): void {
    this._gameState = GameState.Wait;
  }

  public retry(): void {
    this._gameState = GameState.Playing;
    this._score = 0;

    this.clearAllCube();

    // reset y position
    let nodePos: Vec3 = this.node.worldPosition;
    nodePos.y = 0;
    this.node.worldPosition = nodePos;
    let camPos: Vec3 = this._mainCam.worldPosition;
    camPos.y = this._camOriginY;
    this._mainCam.worldPosition = camPos;

    this.spawnNewCube();
  }

  protected spawnNewCube() {
    const fallCubePO = PoolManager.get<IPoolObject>(this._cubePrefab);

    let targetPosition: Vec3 = new Vec3();

    if (this._spawnAtLeft) {
      targetPosition.x = this._startPointLeft.worldPosition.x;
      targetPosition.y = this._startPointLeft.worldPosition.y;
      targetPosition.z = this._startZ + (this._endZ - this._startZ) / 2;
    } else {
      targetPosition.x = this._startX + (this._endX - this._startX) / 2;
      targetPosition.y = this._startPointRight.worldPosition.y;
      targetPosition.z = this._startPointRight.worldPosition.z;
    }
    fallCubePO.node.setWorldPosition(targetPosition);

    fallCubePO.node.scale = new Vec3(
      this._endX - this._startX,
      fallCubePO.node.scale.y,
      this._endZ - this._startZ
    );

    this._currentCube = fallCubePO.node.getComponent(Cube);
    this._currentCube.initialize(false, true);
    this._currentCube.followZ = this._spawnAtLeft ? false : true;
    fallCubePO.node.setParent(this._cubeContainer);

    this.pushCubeToQueue(this._currentCube);
  }

  private pushCubeToQueue(cube: Cube): void {
    if (this._cubeQueue.length == this._maxQueueSize) {
      let cubeToShift: Cube = this._cubeQueue.shift();
      cubeToShift.getComponent(PoolObject).returnToPool();
    }

    this._cubeQueue.push(cube);
  }

  private clearAllCube(): void {
    this._cubeQueue.forEach((cube) => {
      cube.getComponent(PoolObject).returnToPool();
    });
  }
}
