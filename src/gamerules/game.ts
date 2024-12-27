import { BaseGame, Command, PlayerID } from '../../libs/game';
import { GameState } from './gamestate';
import { Player, Resources } from './player';
import { collisionRule } from './rules/collision';
import { growRule } from './rules/grow';
import { sporeRule } from './rules/spore';
import { waitRule } from './rules/wait';

const GrowEvent = 'grow', SporeEvent = 'spore', WaitEvent = 'wait', CollisionEvent = 'collision', HarvestEvent = 'harvest', AttackEvent = 'attack';
const defaultResources: Resources = {
    A: 0, B: 0, C: 0, D: 0,
};

export class Game extends BaseGame {
    maxTurns = 1;

    get state(): Readonly<GameState> {
        return this._state;
    }

    constructor(private _state: GameState) {
        super();
    }

    initialize(): void {
        // rules:
        this.attachRule(GrowEvent, growRule);
        this.attachRule(SporeEvent, sporeRule);
        this.attachRule(WaitEvent, waitRule);
        this.attachRule(CollisionEvent, collisionRule);
    }

    step() {
        /**
         * Ordre des actions pour un tour
         *
         * Les actions GROW et SPORE sont calculées.
         * Les murs issus de collisions sont générés.
         * Les récoltes de protéines sont calculées.
         * Les attaques de tentacules sont calculées.
         * Les conditions de fin de partie sont vérifiées.
         */
        this.patchState(state => ({ turn: state.turn + 1 }));

        // @TODO: compute #actions per player

        // PLAYER COMMANDS AND ACTIONS
        const commands: Record<string, Command[]> = {};
        for (const player of this._state.players) {
            // actions
            player.actions = this.state.entities.filter(entity => entity.owner === player.id && entity.type === 'ROOT').length;

            // commands
            for (const cmd of player.pendingOutputCommands) {
                if (!commands[cmd.action]) {
                    commands[cmd.action] = [];
                }
                commands[cmd.action].push({...cmd});
            }

            //
            player.pendingOutputCommands = [];
        }
        for (const cmd of commands['GROW'] ?? []) {
            this.emit(GrowEvent, cmd);
        }
        for (const cmd of commands['SPORE'] ?? []) {
            this.emit(SporeEvent, cmd);
        }
        for (const cmd of commands['WAIT'] ?? []) {
            this.emit(WaitEvent, cmd);
        }

        // HARVEST
        for (const player of this.state.players) {
            this.emit(HarvestEvent, player.id);
        }

        // ATTACK
        for (const player of this.state.players) {
            this.emit(AttackEvent, player.id);
        }

        //
        this.checkEndCondition();
    }

    patchState(patcher: (state: Readonly<GameState>) => Partial<GameState>): void {
        this._state = {
            ...this._state,
            ...patcher(this.state)
        };
    }

    checkEndCondition(): void {
        // one player has no more ROOT

        // turn count
        
        // no resources and no harvester

    }

    computePlayerScore(playerId: PlayerID): number {
        return this.state.entities.filter(entity => entity.owner === playerId).length;
    }

    isInProgress(): boolean {
        return this.state.turn < this.maxTurns;
    }

    protected createPlayer(id: PlayerID): Player {
        return new Player(id, defaultResources, 1);
    }
}
