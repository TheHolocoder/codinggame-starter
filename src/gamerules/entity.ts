import { PlayerID } from '../../libs/game';
import { distance, Point } from '../../libs/utils';

export type EntityType = 'WALL' | 'ROOT' | 'BASIC' | 'HARVESTER' | 'A' | 'B' | 'C' | 'D' | 'TENTACLE' | 'SPORER';
export type OrganDir = 'N' | 'S' | 'E' | 'W' | 'X'; // N,E,S,W or X if not an organ

export class Entity extends Point {
    targetEntity: Entity | undefined = undefined;
    targetedBy: Entity[] = [];

    constructor(
        public id: number,
        pos: Point,
        public type: EntityType,
        public createdOnTurn: number,
        public owner: PlayerID = -1, // -1 si pas organe
        public direction: OrganDir = 'X',
        public parentId: number = -1, // 0 pour root, -1 sinon
        public rootId: number = -1, // -1 si pas organe
    ) {
        super();
        this.x = pos.x;
        this.y = pos.y;
    }

    get targetPosition(): Point | null {
        if (this.type !== 'HARVESTER' && this.type !== 'TENTACLE') {
            return null;
        }

        switch (this.direction) {
            case 'N':
                return { x: this.x, y: this.y - 1 };
            case 'S':
                return { x: this.x, y: this.y + 1 };
            case 'E':
                return { x: this.x + 1, y: this.y };
            case 'W':
                return { x: this.x - 1, y: this.y };
            case 'X':
                return null;
        }
    }

    isCell = (): boolean => this.type === 'ROOT' || this.type === 'BASIC' || this.type === 'HARVESTER' || this.type === 'TENTACLE' || this.type === 'SPORER';
    isWall = (): boolean => this.type === 'WALL';
    isProtein = (): boolean => this.type === 'A' || this.type === 'B' || this.type === 'C' || this.type === 'D';
    isProteinOfType = (type: Extract<EntityType, 'A' | 'B' | 'C' | 'D'>): boolean => this.type === type;
    isMyOrgan = (playerId: PlayerID): boolean => this.isCell() && this.owner === playerId;
    isMyRoot = (playerId: PlayerID): boolean => this.isCell() && this.owner === playerId && this.type === 'ROOT';
    isOppRoot = (playerId: PlayerID): boolean => this.isCell() && this.owner !== playerId && this.type === 'ROOT';

    distanceTo = (entity: Entity): number => distance(this, entity);
};
export const createWall = (pos: Point, turn: number): Entity => new Entity(-1, pos, 'WALL', turn);

