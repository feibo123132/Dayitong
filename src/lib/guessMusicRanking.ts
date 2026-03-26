export const SONGS_PER_ROUND = 4;

const TABLE_SIDE_PADDING = 32;
const RANK_COLUMN_WIDTH = 44;
const NAME_COLUMN_MIN_WIDTH = 120;
const COUNT_COLUMN_WIDTH = 60;
const RATE_COLUMN_WIDTH = 60;
const PARTICIPATION_COLUMN_WIDTH = 72;
const ACTION_COLUMN_WIDTH = 32;

export type GuessMusicRankSectionKey = 'top10' | 'top50' | 'top200';

export interface GuessMusicRankSection<T> {
  key: GuessMusicRankSectionKey;
  title: string;
  minRank: number;
  maxRank: number;
  users: T[];
}

export interface GuessMusicTableMetrics {
  tableMinWidth: number;
  actionColumnWidth: number;
  templateColumns: string;
  columns: Array<
    | { key: 'rank'; width: number }
    | { key: 'name'; minWidth: number }
    | { key: 'count'; width: number }
    | { key: 'rate'; width: number }
    | { key: 'participationCount'; width: number }
  >;
}

const GUESS_MUSIC_RANK_SECTIONS: Array<Omit<GuessMusicRankSection<never>, 'users'>> = [
  { key: 'top10', title: '1-10名', minRank: 1, maxRank: 10 },
  { key: 'top50', title: '11-50名', minRank: 11, maxRank: 50 },
  { key: 'top200', title: '51-200名', minRank: 51, maxRank: 200 },
];

export const calculateGuessMusicRate = (count: number, participationCount: number, songsPerRound = SONGS_PER_ROUND): string => {
  if (participationCount <= 0 || songsPerRound <= 0) return '0%';

  const totalSongs = participationCount * songsPerRound;
  const validCount = Math.min(Math.max(count, 0), totalSongs);
  return `${Math.round((validCount / totalSongs) * 100)}%`;
};

export const getGuessMusicTableMetrics = (editable: boolean): GuessMusicTableMetrics => {
  const actionColumnWidth = editable ? ACTION_COLUMN_WIDTH : 0;
  const columns: GuessMusicTableMetrics['columns'] = [
    { key: 'rank', width: RANK_COLUMN_WIDTH },
    { key: 'name', minWidth: NAME_COLUMN_MIN_WIDTH },
    { key: 'count', width: COUNT_COLUMN_WIDTH },
    { key: 'rate', width: RATE_COLUMN_WIDTH },
    { key: 'participationCount', width: PARTICIPATION_COLUMN_WIDTH },
  ];

  const tableMinWidth =
    TABLE_SIDE_PADDING +
    RANK_COLUMN_WIDTH +
    NAME_COLUMN_MIN_WIDTH +
    COUNT_COLUMN_WIDTH +
    RATE_COLUMN_WIDTH +
    PARTICIPATION_COLUMN_WIDTH +
    actionColumnWidth;

  const templateColumns = [
    `${RANK_COLUMN_WIDTH}px`,
    `minmax(${NAME_COLUMN_MIN_WIDTH}px, 1fr)`,
    `${COUNT_COLUMN_WIDTH}px`,
    `${RATE_COLUMN_WIDTH}px`,
    `${PARTICIPATION_COLUMN_WIDTH}px`,
    ...(editable ? [`${ACTION_COLUMN_WIDTH}px`] : []),
  ].join(' ');

  return {
    tableMinWidth,
    actionColumnWidth,
    templateColumns,
    columns,
  };
};

export const getGuessMusicRankSections = <T extends { rank: number }>(users: T[]): GuessMusicRankSection<T>[] =>
  GUESS_MUSIC_RANK_SECTIONS.map((section) => ({
    ...section,
    users: users.filter((user) => user.rank >= section.minRank && user.rank <= section.maxRank),
  }));
