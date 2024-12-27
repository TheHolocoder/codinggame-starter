import { BaseGame, PlayerID, RuleResponse } from '../../../libs/game';
import { Game } from '../game';
import { GameState } from '../gamestate';
import { add, resourcesToString } from '../helpers';
import { emptyResources, Resources } from '../player';

export function harvestRule(game: BaseGame, playerId: PlayerID): RuleResponse {
    const state = game.state as GameState;
    let earnings: Resources = emptyResources;
    function respond(message: string): RuleResponse {
        return {
            playerId,
            actions: [message],
        };
    }
    function getProteinEarning(type: 'A' | 'B' | 'C' | 'D'): Resources {
        switch (type) {
            case 'A': return { ...emptyResources, 'A': 1 };
            case 'B': return { ...emptyResources, 'B': 1 };
            case 'C': return { ...emptyResources, 'C': 1 };
            case 'D': return { ...emptyResources, 'D': 1 };
        }
    }

    let hasEarned = false;
    const harvesters = state.entities.filter(entity => entity.type === 'HARVESTER' && entity.owner === playerId);
    for (const harvester of harvesters) {
        const target = harvester.targetEntity;
        if (target && target.isProtein()) {
            hasEarned = true;
            earnings = add(earnings, getProteinEarning(target.type as 'A' | 'B' | 'C' | 'D'));
        }
    }

    if (!hasEarned) {
        return null;
    }

    const players = state.players.map(player => {
        if (player.id === playerId) {
            return { ...player, resources: add(player.resources, earnings) };
        }

        return player;
    });
    (game as Game).patchState(() => ({ players }));

    return respond(`gained ${resourcesToString(earnings)} from harvest`);
}
