import { Entity, EntityType, OrganDir } from '../gamerules/entity';
import { GameState } from '../gamerules/gamestate';
import { Player, Resources } from '../gamerules/player';

type StateSetup = {
    width: number,
    height: number,
};
type StateState = Pick<GameState, 'players' | 'entities'>;

export function readGameSetup(readline: () => string): StateSetup {
    const input = readline().split(' ');

    return {
        width: Number(input[0]),
        height: Number(input[1]),
    };
}

export function readGameState(readline: () => string): StateState {
    const entityCount = Number(readline());
    const entitiesLines: string[] = [];
    for (let i = 0; i < entityCount; ++i) {
        entitiesLines.push(readline());
    }
    const myResources = readline();
    const oppResources = readline();
    const actions = parseInt(readline());
    const entities = parseEntities(entitiesLines);

    const players: Player[] = [];
    players.push(new Player(
        0,
        parseResources(oppResources),
        entities.filter(e => e.owner === 0 && e.type === 'ROOT').length,
        true,
        [],
    ));
    players.push(new Player(
        1,
        parseResources(myResources),
        actions,
        true,
        [],
    ));

    return {
        entities: entities,
        players,
    };
}

export function parseEntities(lines: string[]): Entity[] {
    const entities: Entity[] = [];
    for (const line of lines) {
        const inputs = line.split(' ');
        entities.push(new Entity(
            parseInt(inputs[4]),
            {
                x: parseInt(inputs[0]),
                y: parseInt(inputs[1])
            },
            inputs[2] as EntityType,
            0, // turn
            parseInt(inputs[3]),
            inputs[5] as OrganDir,
            parseInt(inputs[6]),
            parseInt(inputs[7])
        ));
    }

    return entities;
}

export function parseResources(line: string): Resources {
    const inputs: string[] = line.split(' ');
    return {
        A: parseInt(inputs[0]),
        B: parseInt(inputs[1]),
        C: parseInt(inputs[2]),
        D: parseInt(inputs[3])
    };
}
