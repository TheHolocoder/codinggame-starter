import { IGameStateSerializer, PlayerID } from '../../libs/game';
import { GameState } from '../gamerules/gamestate';


export class GameStateSerializer implements IGameStateSerializer {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupToStrings(state: Readonly<GameState>, recipient: PlayerID): string[] {
        return [`${state.width} ${state.height}`];
    }

    stateToStrings(state: Readonly<GameState>, recipient: PlayerID): string[] {
        const output: string[] = [];
        // entityCount
        output.push(state.entities.length.toString());
        // entities
        for (const entity of state.entities) {
            const owner = (-1 === entity.owner) ? -1 : (recipient === entity.owner ? 1 : 0);
            output.push(`${entity.x} ${entity.y} ${entity.type} ${owner} ${entity.id} ${entity.direction} ${entity.parentId} ${entity.rootId}`);
        }
        // playerResources
        const player = state.players.find(p => p.id === recipient)!;
        const opponent = state.players.find(p => p.id !== recipient)!;
        output.push(`${player.resources.A} ${player.resources.B} ${player.resources.C} ${player.resources.D}`);
        output.push(`${opponent.resources.A} ${opponent.resources.B} ${opponent.resources.C} ${opponent.resources.D}`);
        output.push(player.actions.toString());

        return output;
    }
}
