import { _decorator, Component, Prefab } from "cc";
import { IPoolObject } from "./IPoolObject";
import { PoolManager } from "./PoolManager";
// import { Prefab } from "./Prefab";

const { ccclass, property } = _decorator;

@ccclass
export class PrefixPool extends Component {
  @property([Prefab])
  public poolInfos: { prefab: Prefab; amount: number }[] = [];

  onLoad() {
    for (let poolInfo of this.poolInfos) {
      if (!poolInfo.prefab) continue;
      const instances: IPoolObject[] = [];
      for (let i = 0; i < poolInfo.amount; i++) {
        const instance = PoolManager.get<IPoolObject>(poolInfo.prefab);
        instance.node.setParent(this.node);
        instances.push(instance);
      }
      for (let instance of instances) {
        instance.returnToPool();
      }
    }
  }
}
