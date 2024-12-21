import { Command, IPlayer, PlayerID } from '../../libs/game';

export class Player implements IPlayer {
    constructor(
        public readonly id: PlayerID,
        public alive: boolean = true,
        public pendingOutputCommands: Command[] = [],
    ) {}
}
