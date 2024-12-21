import { expect, test } from 'vitest';

import { writeGameState } from '../src/parsing/output';

test('game setup writing', () => {
    const state = {};
    const result = writeGameState(state);

    // complete this
    expect(result).toEqual('TODO');
});
