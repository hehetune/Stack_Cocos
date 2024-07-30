import { Prefab } from "cc";
import { IPoolObject } from "./IPoolObject";
import { ObjectPool } from "./ObjectPool";
// import { Prefab } from "./Prefab";

export class PoolManager {
  private static pools: { [key: string]: ObjectPool } = {};

  public static get<T extends IPoolObject>(prefab: Prefab): T {
    if (!this.pools[prefab.uuid]) {
      this.pools[prefab.uuid] = new ObjectPool(prefab);
    }

    const instance = this.pools[prefab.uuid].get() as T;
    return instance;
  }

  public static clearPools(): void {
    for (let key in this.pools) {
      if (this.pools.hasOwnProperty(key)) {
        this.pools[key].clearPool();
      }
    }
    this.pools = {};
  }
}
