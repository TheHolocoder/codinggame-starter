import { IGameState } from '../../libs/game';
import { Player } from './player';

export class GameState implements IGameState {
    turn = 1;
    width = 0;
    height = 0;
    players: Player[] = [];
}
