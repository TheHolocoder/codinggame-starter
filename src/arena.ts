import { program } from 'commander';
import { randomInt } from 'crypto';

import { Arena, logToString } from '../libs/simulation';
import { Game } from './gamerules/game';
import { fromGameMapData, MAPS } from './maps';
import { GameStateSerializer } from './parsing/output';

program
    .description('Make several bots go against each other in the arena')
    .requiredOption('-p1, --player1 <script>', 'Player 1 script')
    .requiredOption('-p2, --player2 <script>', 'Player 2 script')
    .option('-p3, --player3 <script>', 'Player 3 script')
    .option('-p4, --player4 <script>', 'Player 4 script')
    ;
program.parse();
const options = program.opts();

/**********************************/
/* CUSTOMIZE WITH YOUR GAME CLASS */
/**********************************/
const game = new Game(fromGameMapData(MAPS[randomInt(MAPS.length)]));
const serializer = new GameStateSerializer();
/**********************************/


const simulation = new Arena(game, serializer);
simulation.addPlayer(options.player1);
simulation.addPlayer(options.player2);

try {
    await simulation.run();
} catch (e: unknown) {
    console.error('An error occured during simulation');
    if (e instanceof Error) {
        console.error(e.message);
    } else {
        console.error(e);
    }
} finally {
    simulation.terminate();
}

console.log('----- LOGS -----');
simulation.logs.map(line => console.log(logToString(line)));

console.log('\n==========\nRESULTS\n==========');
for (const score of simulation.game.getPlayerScores()) {
    console.log(`Player ${score.id}: ${score.score} points`);
}

