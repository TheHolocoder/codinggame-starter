export type PlayerID = number;
export type PlayerActionsLog = {
    playerId: PlayerID,
    actions: string[],
};

export class Command {
    constructor(
        public readonly playerId: PlayerID,
        public readonly action: string,
        public readonly params: string[]) { }

    static fromLine(line: string, playerId: PlayerID): Command {
        const commands = line.split(' ');
        return new Command(
            playerId,
            commands.shift() ?? '',
            [...commands]
        );
    }
};

export interface IPlayer {
    id: PlayerID,
    alive: boolean,
    pendingOutputCommands: Command[],
};
export type PlayerScore = {id: PlayerID, score: number};
