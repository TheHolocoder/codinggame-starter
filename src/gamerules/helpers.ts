import { equals, Point } from '../../libs/utils';
import { Entity } from './entity';

export const findEntityAtPosition = (pos: Point, entities: Entity[]): Entity | undefined => {
    return entities.find(entity => equals(entity, pos));
};

export const findEntityById = (id: number, entities: Entity[]): Entity | undefined => {
    return entities.find(entity => entity.id === id);
};
