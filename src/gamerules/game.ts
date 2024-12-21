import { BaseGame, Command, PlayerID } from '../../libs/game';
import { GameState } from './gamestate';



export class Game extends BaseGame {
    maxTurns = 5;

    get state(): Readonly<GameState> {
        return this._state;
    }

    constructor(private _state: GameState) {
        super();
    }

    initialize(): void {
        // rules:
    }

    step() {
        this.patchState(state => ({ turn: state.turn + 1 }));

        //
        this.checkEndCondition();
    }

    patchState(patcher: (state: Readonly<GameState>) => Partial<GameState>): void {
        this._state = {
            ...this._state,
            ...patcher(this.state)
        };
    }

    checkEndCondition(): void {

    }

    isInProgress(): boolean {
        return this.state.turn < this.maxTurns;
    }

    protected createPlayer(id: PlayerID): Player {
    }
}
