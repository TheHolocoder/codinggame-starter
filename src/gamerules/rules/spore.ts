import { BaseGame, Command, RuleResponse } from '../../../libs/game';
import { add, equals, Point } from '../../../libs/utils';
import { Entity } from '../entity';
import { Game } from '../game';
import { GameState } from '../gamestate';
import { cellCosts, findEntityAtPosition, findEntityById, isNegative, resourcesToString, substract } from '../helpers';
import { Player } from '../player';

export function sporeRule(game: BaseGame, command: Command): RuleResponse {
    const state = game.state as GameState;
    const playerId = command.playerId;
    const player = game.state.players.find(p => p.id === playerId)! as Player;
    function respond(message: string): RuleResponse {
        return {
            playerId: playerId,
            actions: [message],
        };
    }

    const id = parseInt(command.params[0]);
    const pos = { x: parseInt(command.params[1]), y: parseInt(command.params[2]) };
    const parentEntity = findEntityById(id, state.entities);

    // Check actions count
    if (player.actions < 1) {
        return respond('too many actions were provided');
    }


    // check if cell belongs to player
    {
        if (!parentEntity || !parentEntity.isMyOrgan(playerId)) {
            return respond(`cannot spore from unknown organ (${id})`);
        }
        if (parentEntity.type !== 'SPORER') {
            return respond(`cannot spore from organ of type (${parentEntity.type})`);
        }
        if (parentEntity.direction === 'X') {
            return respond(`cannot spore in direction (${parentEntity.direction})`);
        }
    }

    // check if target is out of bound
    function outOfBounds(pos: Point): boolean {
        if (pos.x < 0 || pos.y < 0 || pos.x >= state.width || pos.y >= state.height) {
            return true;
        }

        return false;
    }
    {
        if (outOfBounds(pos)) {
            return respond(`cannot grow outside of map at ((${pos.x}, ${pos.y}))`);
        }
    }

    // Check cost for type
    const cost = cellCosts.get('ROOT')!;
    const newResources = substract(player.resources, cost);
    if (isNegative(newResources)) {
        return respond('cannot afford to grow (ROOT)');
    }

    // check collisions on path or out of bound
    const directions = {
        'S': { x: 0, y: 1 },
        'N': { x: 0, y: -1 },
        'E': { x: 1, y: 0 },
        'W': { x: -1, y: 0 },
        'X': { x: 0, y: 0 }
    };
    const vec = directions[parentEntity.direction];
    {
        let targetFound = false;
        let inspect = add(parentEntity, vec);
        while (!outOfBounds(inspect)) {
            const ent = findEntityAtPosition(inspect, state.entities);
            if (ent) {
                return respond(`spore cannot reach its destination at ((${pos.x},${pos.y}))`);
            }
            if (equals(pos, inspect)) {
                targetFound = true;
                break;
            }
            inspect = add(inspect, vec);
        }
        if (!targetFound) {
            return respond(`spore cannot reach its destination at ((${pos.x},${pos.y}))`);
        }
    }

    // Create entity, set the turn!!
    const players = state.players.map(player => {
        if (player.id === playerId) {
            return { ...player, actions: player.actions - 1, resources: newResources };
        }

        return player;
    });
    (game as Game).patchState(state => ({
        entities: [
            ...state.entities,
            new Entity(
                state.entities.length,
                pos, 'ROOT', state.turn, playerId, 'N', 0, state.entities.length
            )
        ],
        players,
    }));

    return respond(`consumed ${resourcesToString(cost)} for growth`);
}
