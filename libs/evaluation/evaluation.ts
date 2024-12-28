import { IGameState, PlayerID } from '../game';

export abstract class Evaluation {
    abstract evaluate(state: IGameState, playerId: PlayerID): number;
}
