import { PlayerID } from '../../libs/game';
import { distance, Point } from '../../libs/utils';

export type EntityType = 'WALL' | 'ROOT' | 'BASIC' | 'HARVESTER' | 'A' | 'B' | 'C' | 'D' | 'TENTACLE' | 'SPORER';
export type OrganDir = 'N' | 'S' | 'E' | 'W' | 'X'; // N,E,S,W or X if not an organ

export class Entity extends Point {
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

    isCell = (): boolean => this.type === 'ROOT' || this.type === 'BASIC' || this.type === 'HARVESTER';
    isWall = (): boolean => this.type === 'WALL';
    isProtein = (type: Extract<EntityType, 'A' | 'C' | 'D'>): boolean => this.type === type;
    isMyOrgan = (playerId: PlayerID): boolean => this.isCell() && this.owner === playerId;
    isMyRoot = (playerId: PlayerID): boolean => this.isCell() && this.owner === playerId && this.type === 'ROOT';
    isOppRoot = (playerId: PlayerID): boolean => this.isCell() && this.owner !== playerId && this.type === 'ROOT';

    distanceTo = (entity: Entity): number => distance(this, entity);
};
export const createWall = (pos: Point, turn: number): Entity => new Entity(-1, pos, 'WALL', turn);

