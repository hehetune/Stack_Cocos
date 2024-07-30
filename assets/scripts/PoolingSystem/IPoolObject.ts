import { Node } from "cc";

export interface IPoolObject {
  node: Node;
  init(returnAction: (obj: IPoolObject) => void): void;
  returnToPool(): void;
  returnToPoolByLifeTime(lifeTime: number): void;
}
