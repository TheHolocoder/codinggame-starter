import { BaseGame, RuleResponse } from '../../../libs/game';
import { Point } from '../../../libs/utils';
import { Entity } from '../entity';
import { Game } from '../game';

export function collisionRule(game: BaseGame, pos: Point): RuleResponse {
    // Create entity, set the turn!!
    (game as Game).patchState(state => ({
        entities: [
            ...state.entities,
            new Entity(state.entities.length, pos, 'WALL', state.turn, -1, 'X', 0, 0)
        ]
    }));

    return null;
}
