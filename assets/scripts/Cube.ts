import {
  _decorator,
  BoxCollider,
  CCBoolean,
  CCFloat,
  Component,
  RigidBody,
  Vec3,
} from "cc";
import { FIXED_DELTA_TIME } from "./Constant";
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
  protected _time: number = 0;
  @property({ type: CCFloat, visible: true })
  private _accumulator: number = 0;

  @property({ type: CCFloat, visible: true })
  protected _minPos: number = -1.2;
  @property({ type: CCFloat, visible: true })
  protected _maxPos: number = 1.2;

  @property({ type: CCBoolean, visible: true })
  public followZ: Boolean = false;

  private vec_x: Vec3 = new Vec3(1, 0, 0);
  private vec_z: Vec3 = new Vec3(0, 0, 1);

  private _canMove: Boolean = true;

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

  protected moveAround(): void {
    if (!this._canMove) return;
    if (this.followZ) {
      if (this.node.position.z > this._maxPos)
        this._rb.setLinearVelocity(
          this.vec_z.clone().multiplyScalar(this._moveSpeed * -1)
        );

      if (this.node.position.z < this._minPos)
        this._rb.setLinearVelocity(
          this.vec_z.clone().multiplyScalar(this._moveSpeed)
        );
    } else {
      if (this.node.position.x > this._maxPos)
        this._rb.setLinearVelocity(
          this.vec_x.clone().multiplyScalar(this._moveSpeed * -1)
        );

      if (this.node.position.x < this._minPos)
        this._rb.setLinearVelocity(
          this.vec_x.clone().multiplyScalar(this._moveSpeed)
        );
    }
  }

  public StopCube(
    startX: number,
    endX: number,
    startZ: number,
    endZ: number
  ): void {
    this._rb.setLinearVelocity(Vec3.ZERO);
    this._col.worldBounds.center;
    this._canMove = false;
  }
}
