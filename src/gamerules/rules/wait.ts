import { BaseGame, Command, RuleResponse } from '../../../libs/game';
import { Game } from '../game';
import { GameState } from '../gamestate';
import { Player } from '../player';

export function waitRule(game: BaseGame, command: Command): RuleResponse {
    const state = game.state as GameState;
    const playerId = command.playerId;
    const player = game.state.players.find(p => p.id === playerId)! as Player;
    function respond(message: string): RuleResponse {
        return {
            playerId: playerId,
            actions: [message],
        };
    }

    // Check actions count
    if (player.actions < 1) {
        return respond('too many actions were provided');
    }

    // Update actions count
    const players = state.players.map(player => {
        if (player.id === playerId) {
            return {...player, actions: player.actions - 1};
        }

        return player;
    });
    (game as Game).patchState(() => ({
        players,
    }));

    return null;
}
