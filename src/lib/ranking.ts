type RankableUser = {
  name: string;
  score: number;
  rank: number;
};

const toValidRank = (rank: number): number =>
  Number.isFinite(rank) && rank > 0 ? rank : Number.MAX_SAFE_INTEGER;

export const rankUsersByScore = <T extends RankableUser>(users: T[]): T[] =>
  [...users]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const rankA = toValidRank(a.rank);
      const rankB = toValidRank(b.rank);
      if (rankA !== rankB) return rankA - rankB;

      return a.name.localeCompare(b.name);
    })
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
