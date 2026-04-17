import assert from 'node:assert/strict';

import { rankUsersByScore } from '../src/lib/ranking.ts';

const ranked = rankUsersByScore([
  { id: 'u1', name: 'A', score: 20, rank: 5 },
  { id: 'u2', name: 'B', score: 50, rank: 3 },
  { id: 'u3', name: 'C', score: 20, rank: 1 },
]);

assert.deepEqual(
  ranked.map((user) => ({ id: user.id, rank: user.rank })),
  [
    { id: 'u2', rank: 1 },
    { id: 'u3', rank: 2 },
    { id: 'u1', rank: 3 },
  ],
);
