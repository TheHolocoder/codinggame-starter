import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

import { BaseGame, Command, IGameStateSerializer, PlayerID, TurnLogs } from '../game';

type Log = {
    turn: number;
    simulation: string[];
    input: string[];
    output: string[];
    actions: TurnLogs;
};

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class Arena {
    players: { id: PlayerID, script: string, process?: ChildProcessWithoutNullStreams }[] = [];
    firstTurnTime = 1000;
    turnTime = 50;
    currentTurn = 0;
    logs: Log[] = [];
    currentLog!: Log;

    constructor(
        public game: BaseGame,
        private serializer: IGameStateSerializer,
    ) {
        this.resetCurrentLog();
    }

    addPlayer(script: string): void {
        const id = this.players.length;
        this.players.push({ id, script });
        this.log(`Added player ${id}`);
    }

    async run() {
        this.game.initialize();

        for (const player of this.players) {
            player.process = spawn('./bin/jsshell/js', [player.script]);
            player.process.stdout.pause();
            player.process.stderr.on('data', error => {
                throw new Error(error.toString());
            });
            player.process.on('exit', code => {
                this.log(`Player ${player.id} process has exited with code ${code}`);
                this.players.splice(this.players.findIndex(p => p.id === player.id), 1);
            });
            this.log(`Player ${player.id} process started`);
        }

        // Give the initial state/setup to the players
        const setups = this.serializer.setupToStrings(this.game.state, this.players[0].id);
        for (const line of setups) {
            this.broadcast(line);
        }

        // Wait for the first response
        await sleep(this.firstTurnTime);
        this.persistCurrentLog();
        this.currentTurn = 1;
        this.resetCurrentLog();

        while (this.game.isInProgress()) {
            // game handling
            for (const player of this.players) {
                const stateLines = this.serializer.stateToStrings(this.game.state, player.id);
                for (const line of stateLines) {
                    this.broadcast(line, player.id);
                }
            }
            await sleep(this.turnTime);
            this.receiveOutputs();
            const actions = this.game.takeTurn();

            // simulation data
            this.logActions(actions);
            this.persistCurrentLog();
            this.currentTurn++;
            this.resetCurrentLog();
        }
    }

    terminate(): void {
        // Cleanup
        for (const player of this.players) {
            player.process?.kill();
        }
    }

    private broadcast(message: string, playerId: PlayerID | null = null): void {
        if (!message.endsWith('\n')) {
            message += '\n';
        }
        this.logInput(message.trim());
        if (null === playerId) {
            for (const player of this.players) {
                player.process!.stdin.write(message);
            }
        } else {
            const player = this.players.find(p => p.id === playerId);
            player?.process!.stdin.write(message);
        }
    }

    private receiveOutputs(): void {
        for (const player of this.players) {
            const answer: Buffer | null = player.process!.stdout.read();
            if (!answer || 0 === answer.length) {
                throw new Error(`Player ${player.id} did not respond in time!`);
            }
            const lines = answer.toString().trim().split('\n');
            for (const line of lines) {
                this.logOutput(player.id, line.trim());
                this.game.player(player.id)?.pendingOutputCommands.push(Command.fromLine(line, player.id));
            }
        }
    }

    private log(message: string): void {
        this.currentLog.simulation.push(`[SIM] ${message}`);
    }

    private logInput(message: string): void {
        // this.currentLog.input.push(`[INPUT] ${message}`);
    }

    private logOutput(playerId: PlayerID, message: string): void {
        this.currentLog.output.push(`[P${playerId}] ${message}`);
    }

    private logActions(logs: TurnLogs): void {
        for (const id in logs) {
            if (!this.currentLog.actions[id]) {
                this.currentLog.actions[id] = [];
            }
            this.currentLog.actions[id].push(...logs[id]);
        }
    }

    private persistCurrentLog(): void {
        this.logs.push({ ...this.currentLog });
    }

    private resetCurrentLog(): void {
        this.currentLog = {
            turn: this.currentTurn,
            simulation: [],
            input: [],
            output: [],
            actions: {}
        };
    }
}

export function logToString(log: Log): string {
    /**
     *Résumé du jeu :
     *
     *TheHolocoder cannot grow outside of map at ((3, -1))
     *Défaut:
     *- consumed 2A, 3B, 1C, 4D for growth
     *- gained 3B, 3D from absorption
     *- gained 2A, 3B, 1C, 3D from harvest
     *
     */
    let output = `\n\n----- TOUR ${log.turn} -----\n`;
    for (const line of log.simulation) {
        output += `${line}\n`;
    }
    for (const line of log.input) {
        output += `${line}\n`;
    }
    for (const line of log.output) {
        output += `${line}\n`;
    }
    output += '\n\nRésumé du jeu :';
    for (const id in log.actions) {
        output += `\nPlayer ${id}:\n`;
        for (const action of log.actions[id]) {
            output += `- ${action}\n`;
        }
    }

    return output.trimEnd();
}
