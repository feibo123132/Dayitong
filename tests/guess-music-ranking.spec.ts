import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  calculateGuessMusicRate,
  getGuessMusicRankSections,
  getGuessMusicTableMetrics,
} from '../src/lib/guessMusicRanking.ts';

assert.equal(calculateGuessMusicRate(3, 1), '75%');
assert.equal(calculateGuessMusicRate(0, 1), '0%');
assert.equal(calculateGuessMusicRate(9, 2), '100%');

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

assert.deepEqual(
  getGuessMusicRankSections([
    { id: 'u1', rank: 1 },
    { id: 'u2', rank: 10 },
    { id: 'u3', rank: 11 },
    { id: 'u4', rank: 50 },
    { id: 'u5', rank: 51 },
    { id: 'u6', rank: 200 },
    { id: 'u7', rank: 201 },
  ]).map((section) => ({
    key: section.key,
    title: section.title,
    ids: section.users.map((user) => user.id),
  })),
  [
    { key: 'top10', title: '1-10名', ids: ['u1', 'u2'] },
    { key: 'top50', title: '11-50名', ids: ['u3', 'u4'] },
    { key: 'top200', title: '51-200名', ids: ['u5', 'u6'] },
  ],
);

const guessMusicPageSource = fs.readFileSync(
  path.resolve(import.meta.dirname, '../src/pages/GuessMusicPage.tsx'),
  'utf8',
);

const horizontalScrollContainers = guessMusicPageSource.match(/overflow-x-auto/g) ?? [];

assert.equal(horizontalScrollContainers.length, 1);
