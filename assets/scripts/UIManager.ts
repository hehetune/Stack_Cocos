import { _decorator, Button, Component, Material, Node, Sprite } from "cc";
import { GameManager } from "./GameManager";
import { GameTheme } from "./GameTheme";
const { ccclass, property } = _decorator;

@ccclass("UIManager")
export class UIManager extends Component {
  @property({ type: Button, visible: true })
  private _retryButton: Button = null;

  @property({ type: Button, visible: true })
  private _startButton: Button = null;

  private _gameManager: GameManager = null;

  @property({ type: Sprite, visible: true })
  private _gradientSprite: Sprite = null;

  protected onLoad(): void {
    this._gameManager = this.getComponent(GameManager);
  }

  protected start(): void {
    this.updateGameTheme();
  }

  public retry(): void {
    this._retryButton.node.active = false;
    this._gameManager.retry();
    this.updateGameTheme();
  }

  public startGame(): void {
    this._startButton.node.active = false;
    this._gameManager.startGame();
  }

  public showLoseUI(): void {
    this._retryButton.node.active = true;
  }

  public updateGameTheme(): void {
    this.updateBackgroundColor();
  }

  private updateBackgroundColor(): void {
    this._gradientSprite.material.setProperty("startColor", GameTheme.getTheme(-5));
    this._gradientSprite.material.setProperty("endColor", GameTheme.getTheme(5));
    // console.log(this._gradientMaterial.getProperty("startColor"));
    // console.log(this._gradientMaterial.getProperty("endColor"));
  }
}
