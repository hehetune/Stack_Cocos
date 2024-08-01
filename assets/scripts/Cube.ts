import {
  _decorator,
  BoxCollider,
  CCBoolean,
  CCFloat,
  Color,
  Component,
  Material,
  MeshRenderer,
  Prefab,
  Quat,
  RigidBody,
  Vec3,
} from "cc";
import { FIXED_DELTA_TIME } from "./Constant";
import { PoolManager } from "./PoolingSystem/PoolManager";
import { IPoolObject } from "./PoolingSystem/IPoolObject";
import { GameTheme } from "./GameTheme";
import { PoolObject } from "./PoolingSystem/PoolObject";
const { ccclass, property } = _decorator;

@ccclass("Cube")
export class Cube extends Component {
  @property({ type: RigidBody, visible: true })
  private _rb: RigidBody = null;

  @property({ type: BoxCollider, visible: true })
  private _col: BoxCollider = null;

  @property({ type: CCFloat, visible: true })
  private _moveSpeed: number = 0;

  @property({ type: CCFloat, visible: true })
  private _time: number = 0;
  @property({ type: CCFloat, visible: true })
  private _accumulator: number = 0;

  @property({ type: CCFloat, visible: true })
  private _minPos: number = -1.2;
  @property({ type: CCFloat, visible: true })
  private _maxPos: number = 1.2;

  @property({ type: CCBoolean, visible: true })
  public followZ: Boolean = false;

  private _isMovingForward = true;

  private vec_x: Vec3 = new Vec3(1, 0, 0);
  private vec_z: Vec3 = new Vec3(0, 0, 1);

  private _canMove: Boolean = true;

  private _material: Material = null;
  private _color: Color = null;

  @property({ type: Prefab, visible: true })
  private _cubePrefab: Prefab = null;

  public initialize(useGravity: boolean, canMove: boolean): void {
    this._canMove = canMove;
    this.useGravity(useGravity);

    const meshRenderer = this.getComponent(MeshRenderer);
    if (meshRenderer) {
      if (!this._material) {
        this._material = new Material();
        this._material.initialize({ effectName: "builtin-standard" }); // Use the appropriate effect name
      }

      this._color = GameTheme.getTheme(0);
      this._material.setProperty("albedo", this._color);

      meshRenderer.material = this._material;
    }
  }

  protected update(deltaTime: number): void {
    this._time += deltaTime;

    this._accumulator += deltaTime;

    if (this._accumulator >= FIXED_DELTA_TIME) {
      this.fixedUpdate();
      this._accumulator -= FIXED_DELTA_TIME;
    }
  }

  protected fixedUpdate(): void {
    this.moveAround();
  }

  private moveAround(): void {
    if (!this._canMove) return;

    const currentPosition = this.followZ
      ? this.node.worldPosition.z
      : this.node.worldPosition.x;

    if (currentPosition > this._maxPos || currentPosition < this._minPos) {
      const velocity = this.followZ ? this.vec_z.clone() : this.vec_x.clone();
      velocity.multiplyScalar(
        this._moveSpeed * (currentPosition > this._maxPos ? -1 : 1)
      );

      this._rb.setLinearVelocity(velocity);
      this._isMovingForward = currentPosition < this._minPos;
    }
  }

  private _perfectThreshold: number = 0.1;

  public stopCube(
    oldStartX: number,
    oldEndX: number,
    oldStartZ: number,
    oldEndZ: number
  ): void {
    this._rb.setLinearVelocity(Vec3.ZERO);

    const newStartX = this.startX;
    const newStartZ = this.startZ;
    const newEndX = this.endX;
    const newEndZ = this.endZ;

    if (this.followZ) {
      this.handleAxis(oldStartZ, newStartZ, true);
      this.handleAxis(oldEndZ, newEndZ, false);
    } else {
      this.handleAxis(oldStartX, newStartX, true);
      this.handleAxis(oldEndX, newEndX, false);
    }

    this._col.worldBounds.center;
    this._canMove = false;
  }

  private handleAxis(
    oldCoord: number,
    newCoord: number,
    isStart: boolean
  ): void {
    if ((isStart && oldCoord > newCoord) || (!isStart && oldCoord < newCoord)) {
      let scaleDiff = Math.abs(oldCoord - newCoord);
      let positionDiff = scaleDiff / 2;

      // correct cube position when it is in perfect zone
      if (scaleDiff <= this._perfectThreshold) {
        positionDiff = scaleDiff;
        scaleDiff = 0;
      }

      // position the cube left on stack
      const direction = isStart ? 1 : -1;
      const scale = this.node.scale.clone();
      const worldPosition = this.node.worldPosition.clone();

      if (this.followZ) {
        scale.z -= scaleDiff;
        worldPosition.z += direction * positionDiff;
      } else {
        scale.x -= scaleDiff;
        worldPosition.x += direction * positionDiff;
      }

      this.node.scale = scale;
      this.node.worldPosition = worldPosition;

      // position the falling part
      if (scaleDiff > this._perfectThreshold) {
        if (this.followZ) {
          scale.z = scaleDiff;
          worldPosition.z = -direction * positionDiff + oldCoord;
        } else {
          scale.x = scaleDiff;
          worldPosition.x = -direction * positionDiff + oldCoord;
        }

        const fallDirection = isStart
          ? new Vec3(this.followZ ? 0 : -1, 0, this.followZ ? -1 : 0)
          : new Vec3(this.followZ ? 0 : 1, 0, this.followZ ? 1 : 0);
        this.spawnFallingCube(worldPosition, scale, fallDirection);
      }
    }
  }

  private spawnFallingCube(
    position: Vec3,
    scale: Vec3,
    fallDirection: Vec3
  ): void {
    const fallCubeGo = PoolManager.get<IPoolObject>(this._cubePrefab);
    fallCubeGo.returnToPoolByLifeTime(10);
    fallCubeGo.node.worldPosition = position;
    fallCubeGo.node.scale = scale;
    fallCubeGo.node.rotation = Quat.IDENTITY;
    fallCubeGo.node.setParent(this.node.parent);
    const fallCube = fallCubeGo.node.getComponent(Cube);
    fallCube.initialize(true, false);

    this.applyFalldownEffect(
      fallCubeGo.node.getComponent(RigidBody),
      fallDirection
    );
  }

  public fallDownThisCube(forward: boolean): void {
    this._canMove = false;
    const fallDirection = this.followZ
      ? new Vec3(0, 0, forward ? 1 : -1)
      : new Vec3(forward ? 1 : -1, 0, 0);
    this.applyFalldownEffect(this._rb, fallDirection);

    this.getComponent(PoolObject).returnToPoolByLifeTime(5);
  }

  private applyFalldownEffect(rigidbody: RigidBody, fallDirection: Vec3): void {
    rigidbody.useGravity = true;
    rigidbody.applyForce(fallDirection.multiplyScalar(100));
  }

  private useGravity(useGravity: boolean): void {
    this._rb.useGravity = useGravity;
  }

  public get startX(): number {
    return this.node.worldPosition.x - this.node.scale.x / 2;
  }

  public get startZ(): number {
    return this.node.worldPosition.z - this.node.scale.z / 2;
  }

  public get endX(): number {
    return this.node.worldPosition.x + this.node.scale.x / 2;
  }

  public get endZ(): number {
    return this.node.worldPosition.z + this.node.scale.z / 2;
  }
}
