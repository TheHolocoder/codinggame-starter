import { IGameState } from '../../libs/game';
import { Entity } from './entity';
import { Player } from './player';

export class GameState implements IGameState {
    turn = 1;
    width = 0;
    height = 0;
    entities: Entity[] = [];
    players: Player[] = [];
}
