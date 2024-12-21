import { expect, test } from 'vitest';

import { readGameSetup } from '../src/parsing/input';

test('game setup parsing', () => {
    const setup = '18 9\n32\n3 0 D -1 0 X 0 0\n14 0 B -1 0 X 0 0\n16 0 WALL -1 0 X 0 0\n1 1 A -1 0 X 0 0\n14 1 B -1 0 X 0 0\n15 1 A -1 0 X 0 0\n0 2 ROOT 1 1 N 0 1\n4 2 D -1 0 X 0 0\n9 2 C -1 0 X 0 0\n13 2 C -1 0 X 0 0\n15 2 A -1 0 X 0 0\n4 3 B -1 0 X 0 0\n7 3 A -1 0 X 0 0\n0 4 B -1 0 X 0 0\n1 4 WALL -1 0 X 0 0\n6 4 C -1 0 X 0 0\n11 4 C -1 0 X 0 0\n16 4 WALL -1 0 X 0 0\n17 4 B -1 0 X 0 0\n10 5 A -1 0 X 0 0\n13 5 B -1 0 X 0 0\n2 6 A -1 0 X 0 0\n4 6 C -1 0 X 0 0\n8 6 C -1 0 X 0 0\n13 6 D -1 0 X 0 0\n17 6 ROOT 0 2 N 0 2\n2 7 A -1 0 X 0 0\n3 7 B -1 0 X 0 0\n16 7 A -1 0 X 0 0\n1 8 WALL -1 0 X 0 0\n3 8 B -1 0 X 0 0\n14 8 D -1 0 X 0 0\n7 3 8 7\n7 3 8 7\n1';
    const result = readGameSetup(() => setup);

    // complete this
    expect(result).toEqual(false);
});

test('game test parsing', () => {
    const state = '';
    const result = readGameSetup(() => state);

    // complete this
    expect(result).toEqual(false);
});
