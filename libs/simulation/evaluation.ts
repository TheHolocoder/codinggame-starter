import { IGameState } from '../game';

export abstract class Evaluation {
    abstract evaluate(state: IGameState): number;
}
