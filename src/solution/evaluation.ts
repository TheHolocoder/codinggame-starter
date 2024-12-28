import { Evaluation } from '../../libs/evaluation';
import { PlayerID } from '../../libs/game';
import { GameState } from '../gamerules/gamestate';

const BASE_SCORE_FOR_RESOURCES = 50;

export class CellularEvaluation extends Evaluation {
    evaluate(state: GameState, playerId: PlayerID): number {
        let score = 0;
        // applyTargetsToCells(state.entities);

        // Score for every cell we have
        score += state.entities.filter(e => e.isMyOrgan(playerId)).reduce((acc, entity) => {
            acc++;
            if (entity.type === 'HARVESTER' && entity.targetEntity) {
                acc += (BASE_SCORE_FOR_RESOURCES / state.turn); // 50pts turn 1 | 1pt turn 50 | 0.5pts turn 100
            }

            return acc;
        }, 0);

        // Score for every cell opponent have
        score -= state.entities.filter(e => e.isCell() && !e.isMyOrgan(playerId)).reduce((acc, entity) => {
            acc++;
            if (entity.type === 'HARVESTER' && entity.targetEntity) {
                acc += (BASE_SCORE_FOR_RESOURCES / state.turn); // 50pts turn 1 | 1pt turn 50 | 0.5pts turn 100
            }

            return acc;
        }, 0);

        return score;
    }

}
