import { _decorator, CCString, Component } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export class Prefab extends Component {
  @property(CCString)
  public uniquePrefabID: string = "";
}
