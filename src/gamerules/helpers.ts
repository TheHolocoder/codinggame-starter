import { equals, Point } from '../../libs/utils';
import { Entity, EntityType } from './entity';
import { Resources } from './player';

export const findEntityAtPosition = (pos: Point, entities: Entity[]): Entity | undefined => {
    return entities.find(entity => equals(entity, pos));
};

export const applyTargetsToCells = (entities: Entity[]): void => {
    for (const entity of entities) {
        const target = entity.targetPosition;
        if (target) {
            entity.targetEntity = findEntityAtPosition(target, entities);
        }
    }
};

export const canGrowAtPosition = (pos: Point, entities: Entity[]): boolean => {
    applyTargetsToCells(entities);
    const target = entities.filter(entity => entity.targetPosition && equals(pos, entity.targetPosition));
    if (target) {
        return false;
    }

    return entities.filter(entity => !entity.isProtein()).find(entity => equals(entity, pos)) === undefined;
};

export const findEntityById = (id: number, entities: Entity[]): Entity | undefined => {
    return entities.find(entity => entity.id === id);
};

export const cellCosts = new Map<EntityType, Resources>();
cellCosts.set('BASIC', { A: 1, B: 0, C: 0, D: 0 });
cellCosts.set('HARVESTER', { A: 0, B: 0, C: 1, D: 1 });
cellCosts.set('TENTACLE', { A: 0, B: 1, C: 1, D: 0 });
cellCosts.set('SPORER', { A: 0, B: 1, C: 0, D: 1 });
cellCosts.set('ROOT', { A: 1, B: 1, C: 1, D: 1 });

export const substract = (from: Resources, amount: Resources): Resources => {
    return {
        A: from.A - amount.A,
        B: from.B - amount.B,
        C: from.C - amount.C,
        D: from.D - amount.D,
    };
};

export const add = (from: Resources, amount: Resources): Resources => {
    return {
        A: from.A + amount.A,
        B: from.B + amount.B,
        C: from.C + amount.C,
        D: from.D + amount.D,
    };
};

export const isNegative = (res: Resources): boolean => {
    return res.A < 0 || res.B < 0 || res.C < 0 || res.D < 0;
};

export const canAfford = (type: EntityType, resources: Resources): boolean => {
    const cost = cellCosts.get(type);
    if (!cost) {
        return false;
    }

    return !isNegative(substract(resources, cost));
};

export const resourcesToString = (res: Resources): string => {
    const out: string[] = [];
    if (res.A > 0) { out.push(`${res.A}A`); }
    if (res.B > 0) { out.push(`${res.B}B`); }
    if (res.C > 0) { out.push(`${res.C}C`); }
    if (res.D > 0) { out.push(`${res.D}D`); }

    return out.join(', ');
};
