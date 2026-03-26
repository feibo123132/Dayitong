import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateGuessMusicRate,
  getGuessMusicTableMetrics,
} from '../src/lib/guessMusicRanking.ts';

test('calculateGuessMusicRate uses 4 songs per participation by default', () => {
  assert.equal(calculateGuessMusicRate(3, 1), '75%');
  assert.equal(calculateGuessMusicRate(0, 1), '0%');
});

test('calculateGuessMusicRate caps the score by the available songs', () => {
  assert.equal(calculateGuessMusicRate(9, 2), '100%');
});

test('getGuessMusicTableMetrics keeps existing columns stable while appending participation column', () => {
  assert.deepEqual(getGuessMusicTableMetrics(false), {
    tableMinWidth: 388,
    actionColumnWidth: 0,
    templateColumns: '44px minmax(120px, 1fr) 60px 60px 72px',
    columns: [
      { key: 'rank', width: 44 },
      { key: 'name', minWidth: 120 },
      { key: 'count', width: 60 },
      { key: 'rate', width: 60 },
      { key: 'participationCount', width: 72 },
    ],
  });
});
