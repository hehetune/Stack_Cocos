import { instantiate, Prefab } from "cc";
import { IPoolObject } from "./IPoolObject";
import { PoolObject } from "./PoolObject";
// import { Prefab } from "./Prefab";

export class ObjectPool {
  private prefab: Prefab;
  private pool: IPoolObject[] = [];
  private allInstances: IPoolObject[] = [];

  constructor(prefab: Prefab) {
    this.prefab = prefab;
  }

  public get(): IPoolObject {
    let instance: IPoolObject;

    if (this.pool.length > 0) {
      instance = this.pool.shift();
      if (!instance.node.isValid) {
        instance = this.instantiate();
      }
      instance.node.active = true;
    } else {
      instance = this.instantiate();
    }

    instance.init(this.release.bind(this));
    return instance;
  }

  public clearPool(): void {
    for (let instance of this.allInstances) {
      if (instance.node.isValid) {
        instance.node.destroy();
      }
    }
    this.pool.length = 0;
    this.allInstances.length = 0;
  }

  private instantiate(): IPoolObject {
    const node = instantiate(this.prefab);
    console.log(node == null);
    const instance = node.getComponent(PoolObject);
    console.log(instance == null);
    this.allInstances.push(instance);
    return instance;
  }

  private release(instance: IPoolObject): void {
    instance.node.active = false;
    this.pool.push(instance);
  }
}
