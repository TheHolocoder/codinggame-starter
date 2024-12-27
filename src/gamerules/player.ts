import { Command, IPlayer, PlayerID } from '../../libs/game';

export type Resources = {
    A: number;
    B: number;
    C: number;
    D: number;
};

export const emptyResources: Resources = {A: 0, B: 0, C: 0, D: 0};

export class Player implements IPlayer {
    constructor(
        public readonly id: PlayerID,
        public resources: Resources = {A: 0, B: 0, C: 0, D: 0},
        public actions: number = 1,
        public alive: boolean = true,
        public pendingOutputCommands: Command[] = [],
    ) {}
}
