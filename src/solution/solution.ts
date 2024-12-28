import { d } from '../../libs/utils';
import { Game } from '../gamerules/game';
import { readGameSetup, readGameState } from '../parsing/input';
import { bfs } from './bfs';
import { CellularEvaluation } from './evaluation';

const initialState = readGameSetup(readline);
const game = new Game({
    turn: 0,
    width: initialState.width,
    height: initialState.height,
    entities: [],
    players: [],
});
const opponentId = game.addPlayer(); // id=0 / Opponent
const playerId = game.addPlayer(); // id=1 / Player

/**
 * This is called in an infinite loop (once per turn)
 */
export function run(): void {
    const state = readGameState(readline);
    game.patchState(({turn}) => ({
        turn: turn + 1,
        ...state
    }));
    game.applyEntityMapping();
    d(`Map is ${game.state.width}x${game.state.height}, there are ${game.state.entities.length} entities`);

    // const root = game.state.entities.find(entity => entity.isMyRoot(playerId));
    // if (root) {
    //     console.log(`GROW ${root.id} ${root.x + 1} ${root.y} BASIC X`);
    //     return;
    // }

    console.time('bfs');
    const action = bfs(game, [{
        state: game.state,
        playerId,
        action: {command: undefined, eval: -Infinity },
        depth: 0,
    }], new CellularEvaluation(), 3);
    console.timeEnd('bfs');

    if (action.command) {
        console.log(action.command);
    } else {
        console.log('WAIT');
    }

}
