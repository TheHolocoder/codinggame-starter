import { BaseGame, Command, RuleResponse } from '../../../libs/game';
import { Entity, EntityType, OrganDir } from '../entity';
import { Game } from '../game';
import { GameState } from '../gamestate';
import { add, canGrowAtPosition, cellCosts, findEntityAtPosition, findEntityById, isNegative, resourcesToString, substract } from '../helpers';
import { Player, Resources } from '../player';

export function growRule(game: BaseGame, command: Command): RuleResponse {
    const state = game.state as GameState;
    const playerId = command.playerId;
    const player = game.state.players.find(p => p.id === playerId)! as Player;
    const messages: string[] = [];
    function respond(message: string): RuleResponse {
        messages.push(message);
        return {
            playerId: playerId,
            actions: messages,
        };
    }

    const id = parseInt(command.params[0]);
    let pos = { x: parseInt(command.params[1]), y: parseInt(command.params[2]) };
    const type = command.params[3] as EntityType;
    const direction = command.params[4] as OrganDir;
    const parentEntity = findEntityById(id, state.entities);

    // Check actions count
    if (player.actions < 1) {
        return respond('too many actions were provided');
    }

    // check if cell belongs to player
    {
        if (!parentEntity || !parentEntity.isMyOrgan(playerId)) {
            return respond(`cannot grow from unknown organ (${id})`);
        }
    }

    // Pathfind auto si pas adjacent
    const dx = pos.x - parentEntity.x;
    const dy = pos.y - parentEntity.y;
    if (Math.abs(dx) >= 1 && Math.abs(dy) >= 1) {
        if (Math.abs(dx) >= 1 && canGrowAtPosition({ x: parentEntity.x + dx, y: parentEntity.y }, state.entities)) {
            pos = { x: parentEntity.x + dx, y: parentEntity.y };
        } else if (Math.abs(dy) >= 1 && canGrowAtPosition({ x: parentEntity.x, y: parentEntity.y + dy }, state.entities)) {
            pos = { x: parentEntity.x, y: parentEntity.y + dy };
        }
    }

    // check if cell is out of bound
    {
        if (pos.x < 0 || pos.y < 0 || pos.x >= state.width || pos.y >= state.height) {
            return respond(`cannot grow outside of map at ((${pos.x}, ${pos.y}))`);
        }
    }

    // Check cost for type
    if (!cellCosts.has(type)) {
        return respond(`cannot grow type (${type})`);
    }
    const cost = cellCosts.get(type)!;
    let newResources = substract(player.resources, cost);
    if (isNegative(newResources)) {
        return respond(`cannot afford to grow (${type})`);
    }

    // Check if cell is occupied
    const entity = findEntityAtPosition(pos, state.entities);
    {
        if (entity && !entity.isProtein()) {
            if (entity.createdOnTurn === state.turn) {
                // collision
                game.emit('collision', pos);
            }
            return respond(`cannot grow onto cell at ((${pos.x}, ${pos.y}))`);
        }
    }

    // Create entity, set the turn!!
    if (entity && entity.isProtein()) {
        const type = entity.type as Extract<EntityType, 'A' | 'B' | 'C' | 'D'>;
        const gain: Resources = {A: 0, B: 0, C: 0, D: 0};
        gain[type] = 3;
        newResources = add(newResources, gain);
        messages.push(`gained 3${type} from absorption`);
    }
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
                pos, type, state.turn, playerId, direction, parentEntity.id, parentEntity.rootId
            )
        ],
        players
    }));

    return respond(`consumed ${resourcesToString(cost)} for growth`);
}

