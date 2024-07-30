import { _decorator, Button, Component, Node } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property({type: Button, visible: true})
    private _retryButton: Button = null;

    @property({type: Button, visible: true})
    private _startButton: Button = null;

    @property({type: GameManager, visible: true})
    private _gameManager: GameManager = null;

    public retry(): void {
        this._retryButton.enabled = false;
        this._gameManager.retry();
    }

    public start(): void {
        this._startButton.enabled = false;
        this._gameManager.retry();
    }

    public showLoseUI(): void {
        this._retryButton.enabled = true;
        this._gameManager.loseGame();
    }


}


