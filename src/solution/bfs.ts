import { Evaluation } from '../../libs/evaluation';
import { Command, PlayerID } from '../../libs/game';
import { add, d, gridDistance, Point } from '../../libs/utils';
import { OrganDir } from '../gamerules/entity';
import { Game } from '../gamerules/game';
import { GameState } from '../gamerules/gamestate';
import { applyTargetsToCells, canAfford, canGrowAtPosition, getClosestEntities, getDirection, outOfBounds } from '../gamerules/helpers';
import { Player } from '../gamerules/player';

export type Action = {
    command?: string,
    eval: number
};

export type ActionAndState = {
    depth: number;
    action: Action,
    playerId: Readonly<PlayerID>,
    state: Readonly<GameState>
};

export function bfs(game: Game, queue: ActionAndState[], evalutation: Evaluation, maxDepth = 5): Action {
    let bestAction: Action = { command: undefined, eval: -Infinity };

    while (queue.length !== 0) {
        const state = queue.shift();
        if (state) {
            if (state.depth < maxDepth) {
                // If max depth is not reached, continue exploring
                addPossibleActionsToQueue(game, state, queue);
            } else {
                // If max depth is reached, take the best course of action
                const score = evalutation.evaluate(state.state, state.playerId);
                bestAction = bestAction.eval > score ? bestAction : state.action;
            }
        }
    }

    return bestAction;
}

export function addPossibleActionsToQueue(game: Game, state: Readonly<ActionAndState>, queue: ActionAndState[]): void {
    // increment depth
    const depth = state.depth + 1;

    // Actions
    growBasics(game, state, queue, depth);
    growHarvesters(game, state, queue, depth);

    // if action command is undefined, set it
}

const around: Map<OrganDir, Point> = new Map<OrganDir, Point>();
around.set('E', { x: 1, y: 0 });
around.set('S', { x: 0, y: 1 });
around.set('W', { x: -1, y: 0 });
around.set('N', { x: 0, y: -1 });

function playoutAction(game: Game, state: Readonly<GameState>, player: Player, action: string): void {
    // d(`playout action: ${action}`);
    player.pendingOutputCommands.push(Command.fromLine(action, player.id));
    const newState: GameState = {
        ...state,
        turn: 1,
        players: state.players.map(p => {
            if (p.id === player.id) {
                return player;
            }

            return p;
        })
    };
    game.step(newState);
}

function growBasics(game: Game, state: Readonly<ActionAndState>, queue: ActionAndState[], depth: number): void {
    const player = state.state.players.find(p => p.id === state.playerId);
    if (!player || !canAfford('BASIC', player.resources)) {
        return;
    }

    const cells = state.state.entities.filter(e => e.isMyOrgan(state.playerId));
    for (const cell of cells) {
        for (const v of around.values()) {
            const pos = add(cell, v);
            if (!outOfBounds(pos, state.state.width, state.state.height) && canGrowAtPosition(pos, state.state.entities)) {
                const action = `GROW ${cell.id} ${pos.x} ${pos.y} BASIC`;
                playoutAction(game, state.state, player, action);
                queue.push({
                    depth,
                    action: { ...state.action, command: state.action.command ? state.action.command : action },
                    playerId: state.playerId,
                    state: game.state,
                });
            }
        }
    }
}

function growHarvesters(game: Game, state: Readonly<ActionAndState>, queue: ActionAndState[], depth: number): void {
    const player = state.state.players.find(p => p.id === state.playerId);
    if (!player || !canAfford('HARVESTER', player.resources)) {
        return;
    }

    const cells = state.state.entities.filter(e => e.isMyOrgan(state.playerId));
    const proteins = state.state.entities.filter(e => e.isProtein() && e.targetedBy.find(b => b.isMyOrgan(player.id)));
    for (const protein of proteins) {
        for (const v in around) {
            const pos = add(protein, around.get(v as OrganDir)!);
            if (!outOfBounds(pos, state.state.width, state.state.height) && canGrowAtPosition(pos, state.state.entities)) {
                for (const cell of cells) {
                    if (gridDistance(cell, pos) === 1) {
                        const lookDir = getDirection(pos, protein);
                        const action = `GROW ${cell.id} ${pos.x} ${pos.y} HARVESTER ${lookDir}`;
                        playoutAction(game, state.state, player, action);
                        queue.push({
                            depth,
                            action: { ...state.action, command: state.action.command ? state.action.command : action },
                            playerId: state.playerId,
                            state: game.state,
                        });
                    }
                }
            }
        }
    }
}
