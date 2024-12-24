import { BaseGame, Command, RuleResponse } from '../../../libs/game';
import { Entity, EntityType, OrganDir } from '../entity';
import { Game } from '../game';
import { GameState } from '../gamestate';
import { findEntityAtPosition, findEntityById } from '../helpers';
import { Player, Resources } from '../player';

const cellCosts = new Map<EntityType, Resources>();
cellCosts.set('BASIC', {A: 1, B: 0, C: 0, D: 0});
cellCosts.set('HARVESTER', {A: 0, B: 0, C: 1, D: 1});
cellCosts.set('TENTACLE', {A: 0, B: 1, C: 1, D: 0});
cellCosts.set('SPORER', {A: 0, B: 1, C: 0, D: 1});
cellCosts.set('ROOT', {A: 1, B: 1, C: 1, D: 1});

const substract = (from: Resources, amount: Resources): Resources => {
    return {
        A: from.A - amount.A,
        B: from.B - amount.B,
        C: from.C - amount.C,
        D: from.D - amount.D,
    };
};
const isNegative = (res: Resources): boolean => {
    return res.A < 0 || res.B < 0 || res.C < 0 || res.D < 0;
};
const resourcesToString = (res: Resources): string => {
    const out: string[] = [];
    if (res.A > 0) { out.push(`${res.A}A`); }
    if (res.B > 0) { out.push(`${res.B}B`); }
    if (res.C > 0) { out.push(`${res.C}C`); }
    if (res.D > 0) { out.push(`${res.D}D`); }

    return out.join(', ');
};

export function growRule(game: BaseGame, command: Command): RuleResponse {
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
    let pos = { x: parseInt(command.params[1]), y: parseInt(command.params[2]) };
    const type = command.params[3] as EntityType;
    const direction = command.params[4] as OrganDir;
    const parentEntity = findEntityById(id, state.entities);

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
        if (Math.abs(dx) >= 1 && !findEntityAtPosition({x: parentEntity.x + dx, y: parentEntity.y}, state.entities)) {
            pos = {x: parentEntity.x + dx, y: parentEntity.y};
        } else if (Math.abs(dy) >= 1 && !findEntityAtPosition({x: parentEntity.x, y: parentEntity.y + dy}, state.entities)) {
            pos = {x: parentEntity.x, y: parentEntity.y + dy};
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
    const newResources = substract(player.resources, cost);
    if (isNegative(newResources)) {
        return respond(`cannot afford to grow (${type})`);
    }

    // Check if cell is occupied
    {
        const entity = findEntityAtPosition(pos, state.entities);
        if (entity) {
            if (entity.createdOnTurn === state.turn) {
                // collision
                game.emit('collision', pos);
            }
            return respond(`cannot grow onto cell at ((${pos.x}, ${pos.y}))`);
        }
    }

    // Create entity, set the turn!!
    (game as Game).patchState(state => ({
        entities: [
            ...state.entities,
            new Entity(
                state.entities.length,
                pos, type, state.turn, playerId, direction, parentEntity.id, parentEntity.rootId
            )
        ]
    }));

    return respond(`consumed ${resourcesToString(cost)} for growth`);
}

