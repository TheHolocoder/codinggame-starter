import { BaseGame, PlayerID, RuleResponse } from '../../../libs/game';
import { Game } from '../game';
import { GameState } from '../gamestate';

export function attackRule(game: BaseGame, playerId: PlayerID): RuleResponse {
    const state = game.state as GameState;
    const tentacles = state.entities.filter(entity => entity.type === 'TENTACLE' && entity.owner === playerId);
    for (const tentacle of tentacles) {
        const target = tentacle.targetEntity;
        if (target && target.isCell() && !target.isMyOrgan(playerId)) {
            (game as Game).patchState(state => {
                const index = state.entities.findIndex(entity => entity.id === target.id);
                state.entities.splice(index, 1);

                return {
                    entities: state.entities,
                };
            });
        }
    }

    return null;
}

