import { IPlayer, PlayerActionsLog, PlayerID, PlayerScore } from './player';

export type IGameState = {
    players: IPlayer[];
};
export type RuleResponse = PlayerActionsLog | null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RuleCallback = (game: BaseGame, ...args: any[]) => RuleResponse;
export type PatchStateCallback = (state: Readonly<IGameState>) => Partial<IGameState>;
export type TurnLogs = Record<PlayerID, string[]>;

export interface IGameStateSerializer {
    setupToStrings(state: Readonly<IGameState>, recipient: PlayerID): string[];
    stateToStrings(state: Readonly<IGameState>, recipient: PlayerID): string[];
}

export abstract class BaseGame {
    private rules: Record<string, RuleCallback[]> = {};
    private turnLogs: TurnLogs = {};

    abstract get state(): Readonly<IGameState>;
    abstract initialize(): void;
    abstract computePlayerScore(playerId: PlayerID): number;
    abstract step(): void;
    abstract isInProgress(): boolean;
    abstract patchState(patcher: PatchStateCallback): void;
    protected abstract createPlayer(id: PlayerID): IPlayer;

    takeTurn(): TurnLogs {
        this.turnLogs = {};
        this.step();

        return {...this.turnLogs};
    }

    addPlayer(): PlayerID {
        const id = this.state.players.length;
        this.patchState(state => ({
            players: [
                ...state.players,
                this.createPlayer(id),
            ]
        }));

        return id;
    }

    player(id: PlayerID): IPlayer | undefined {
        return this.state.players.find(p => p.id === id);
    }

    getPlayerScores(): PlayerScore[] {
        const scores: PlayerScore[] = [];
        for (const player of this.state.players) {
            scores.push({
                id: player.id,
                score: this.computePlayerScore(player.id),
            });
        }

        return scores;
    }

    attachRule(event: string, callback: RuleCallback): void {
        if (!this.rules[event]) {
            this.rules[event] = [];
        }
        this.rules[event].push(callback);
    }

    detachRule(event: string, callback: RuleCallback): void {
        const cbs = this.rules[event];
        if (cbs) {
            this.rules[event] = cbs.filter(cb => cb !== callback);
        }
    }

    emit(event: string, ...args: unknown[]): void {
        const cbs = this.rules[event];
        if (!cbs) {
            return;
        }
        for (const rule of cbs) {
            const result = rule(this, ...args);
            if (result) {
                if (!this.turnLogs[result.playerId]) {
                    this.turnLogs[result.playerId] = [];
                }
                this.turnLogs[result.playerId].push(...result.actions);
            }
        }
    }
}
