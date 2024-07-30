import { _decorator, Component } from "cc";
import { IPoolObject } from "./IPoolObject";

const { ccclass, property } = _decorator;

@ccclass
export class PoolObject extends Component implements IPoolObject {
  private _isDestroyed: boolean = false;

  protected lateUpdate(dt: number): void {
    if (this._isDestroyed) this.node.active = false;
  }

  private returnAction: (obj: IPoolObject) => void;

  public init(returnAction: (obj: IPoolObject) => void): void {
    this.returnAction = returnAction;
  }

  public returnToPoolByLifeTime(lifeTime: number): void {
    this.scheduleOnce(this.returnToPool.bind(this), lifeTime);
  }

  public returnToPool(): void {
    if (this.returnAction) {
      this.returnAction(this);
      this.returnAction = null;
    } else {
      this._isDestroyed = true;
    }
  }
}
