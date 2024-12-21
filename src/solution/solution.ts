import { d } from '../../libs/utils';
import { Game } from '../gamerules/game';
import { readGameSetup, readGameState } from '../parsing/input';

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
    game.patchState(({turn}) => ({
        turn: turn + 1,
        ...readGameState(readline)
    }));
    d(`Map is ${game.state.width}x${game.state.height}, there are ${game.state.entities.length} entities`);

    const root = game.state.entities.find(entity => entity.isMyRoot(playerId));
    if (root) {
        console.log(`GROW ${root.id} ${root.x + 1} ${root.y} BASIC X`);
        return;
    }

    console.log('WAIT');
}
