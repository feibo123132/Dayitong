import { create } from 'zustand';
import type { HistoryRecord } from '../types/history';
import { db, ensureAuth } from '../lib/cloudbase';

export type { HistoryRecord };

export type GuessLocationKey = 'gx-egg' | 'nanhu' | 'gx-garden';

export interface GuessUser {
  id: string;
  name: string;
  count: number;
  participationCount: number;
  rate: string;
  rank: number;
  history: HistoryRecord[];
}

type LocalLocationKey = Exclude<GuessLocationKey, 'gx-egg'>;

interface GuessMusicState {
  users: GuessUser[];
  activeLocation: GuessLocationKey;
  localUsersByLocation: Record<LocalLocationKey, GuessUser[]>;
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  setActiveLocation: (location: GuessLocationKey) => Promise<void>;
  addUser: (name: string, count: number, participationCount: number) => Promise<void>;
  updateUser: (id: string, name: string, count: number, participationCount: number) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUserHistory: (userId: string, historyId: string, data: Partial<HistoryRecord>) => Promise<void>;
}

type GuessUserDoc = Omit<GuessUser, 'id'> & { _id: string };

const DEFAULT_LOCATION: GuessLocationKey = 'gx-egg';
const SONGS_PER_ROUND = 4;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return '未知错误';
};

const normalizeDbData = <T>(value: unknown): T[] => {
  if (typeof value !== 'object' || value === null || !('data' in value)) return [];
  const data = (value as { data?: unknown }).data;
  return Array.isArray(data) ? (data as T[]) : [];
};

const mapGuessUserDoc = (user: GuessUserDoc): GuessUser => ({
  ...user,
  id: user._id,
});

const calculateRate = (count: number, participationCount: number): string => {
  if (participationCount === 0) return '0%';
  const totalSongs = participationCount * SONGS_PER_ROUND;
  const validCount = Math.min(count, totalSongs);
  return `${Math.round((validCount / totalSongs) * 100)}%`;
};

const sortAndRankUsers = (users: GuessUser[]): GuessUser[] => {
  const sortedUsers = [...users].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    const rateA = Number.parseFloat(a.rate);
    const rateB = Number.parseFloat(b.rate);
    return rateB - rateA;
  });

  return sortedUsers.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));
};

const GX_EGG_HISTORY_DATA: Record<string, HistoryRecord[]> = {
  '1': [
    { id: 'h1', date: '2023-10-01', location: '广西一颗蛋🥚', weather: '晴朗', festival: '国庆节', mood: '兴奋', score: 4, total: 4 },
    { id: 'h2', date: '2023-10-02', location: '广西一颗蛋🥚', weather: '多云', mood: '开心', score: 3, total: 4 },
    { id: 'h3', date: '2023-10-05', location: '校园广场', weather: '小雨', mood: '平静', score: 3, total: 4 },
  ],
  '2': [
    { id: 'h4', date: '2023-09-20', location: '艺术学院', weather: '晴', mood: '激动', score: 4, total: 4 },
    { id: 'h5', date: '2023-09-25', location: '广西一颗蛋🥚', weather: '阴', mood: '期待', score: 3, total: 4 },
  ],
};

const GX_EGG_INITIAL_USERS: Omit<GuessUser, 'id'>[] = [
  { name: 'JIEYOU', count: 30, participationCount: 10, rate: '75%', rank: 1, history: [] },
  { name: '小橘同学', count: 28, participationCount: 8, rate: '88%', rank: 2, history: [] },
  { name: '吉他手阿泽', count: 25, participationCount: 7, rate: '89%', rank: 3, history: [] },
  { name: '听歌达人小夏', count: 22, participationCount: 6, rate: '92%', rank: 4, history: [] },
  { name: '校园歌神', count: 20, participationCount: 6, rate: '83%', rank: 5, history: [] },
].map((user, index) => {
  const history = GX_EGG_HISTORY_DATA[(index + 1).toString()] ?? [];
  return { ...user, history };
});

const NANHU_INITIAL_USERS: GuessUser[] = sortAndRankUsers([
  {
    id: 'nanhu-u1',
    name: '南湖夜跑王',
    count: 27,
    participationCount: 8,
    rate: calculateRate(27, 8),
    rank: 1,
    history: [
      { id: 'nh-h1', date: '2026-02-18', location: '南湖', weather: '晴', mood: '轻松', score: 4, total: 4 },
      { id: 'nh-h2', date: '2026-02-22', location: '南湖', weather: '多云', mood: '开心', score: 3, total: 4 },
    ],
  },
  {
    id: 'nanhu-u2',
    name: '湖畔吉他手',
    count: 24,
    participationCount: 7,
    rate: calculateRate(24, 7),
    rank: 2,
    history: [
      { id: 'nh-h3', date: '2026-02-21', location: '南湖', weather: '阴', mood: '专注', score: 4, total: 4 },
      { id: 'nh-h4', date: '2026-02-24', location: '南湖', weather: '小雨', mood: '平静', score: 2, total: 4 },
    ],
  },
  {
    id: 'nanhu-u3',
    name: '薄荷汽水',
    count: 19,
    participationCount: 6,
    rate: calculateRate(19, 6),
    rank: 3,
    history: [{ id: 'nh-h5', date: '2026-02-25', location: '南湖', weather: '晴', mood: '兴奋', score: 3, total: 4 }],
  },
  {
    id: 'nanhu-u4',
    name: '风铃同学',
    count: 16,
    participationCount: 5,
    rate: calculateRate(16, 5),
    rank: 4,
    history: [{ id: 'nh-h6', date: '2026-02-26', location: '南湖', weather: '多云', mood: '惬意', score: 3, total: 4 }],
  },
]);

const GX_GARDEN_INITIAL_USERS: GuessUser[] = sortAndRankUsers([
  {
    id: 'gxg-u1',
    name: '菜园麦霸',
    count: 26,
    participationCount: 9,
    rate: calculateRate(26, 9),
    rank: 1,
    history: [
      { id: 'gxg-h1', date: '2026-02-17', location: '广西菜园', weather: '晴', mood: '兴奋', score: 4, total: 4 },
      { id: 'gxg-h2', date: '2026-02-20', location: '广西菜园', weather: '多云', mood: '开心', score: 3, total: 4 },
    ],
  },
  {
    id: 'gxg-u2',
    name: '青苗乐队',
    count: 23,
    participationCount: 7,
    rate: calculateRate(23, 7),
    rank: 2,
    history: [{ id: 'gxg-h3', date: '2026-02-19', location: '广西菜园', weather: '阴', mood: '放松', score: 4, total: 4 }],
  },
  {
    id: 'gxg-u3',
    name: '甜玉米',
    count: 18,
    participationCount: 6,
    rate: calculateRate(18, 6),
    rank: 3,
    history: [{ id: 'gxg-h4', date: '2026-02-23', location: '广西菜园', weather: '晴', mood: '满足', score: 3, total: 4 }],
  },
  {
    id: 'gxg-u4',
    name: '晚风小分队',
    count: 14,
    participationCount: 5,
    rate: calculateRate(14, 5),
    rank: 4,
    history: [{ id: 'gxg-h5', date: '2026-02-27', location: '广西菜园', weather: '小雨', mood: '温暖', score: 2, total: 4 }],
  },
]);

const loadGxEggUsers = async (): Promise<GuessUser[]> => {
  await ensureAuth();
  const collection = db.collection('Dayitong_guess_users');
  const res = await collection.get();
  let users = normalizeDbData<GuessUserDoc>(res).map(mapGuessUserDoc);

  if (users.length === 0) {
    await Promise.all(GX_EGG_INITIAL_USERS.map((user) => collection.add(user)));
    const newRes = await collection.get();
    users = normalizeDbData<GuessUserDoc>(newRes).map(mapGuessUserDoc);
  }

  return sortAndRankUsers(users);
};

const buildLocalUsers = (): Record<LocalLocationKey, GuessUser[]> => ({
  nanhu: NANHU_INITIAL_USERS,
  'gx-garden': GX_GARDEN_INITIAL_USERS,
});

export const useGuessMusicStore = create<GuessMusicState>((set, get) => ({
  users: [],
  activeLocation: DEFAULT_LOCATION,
  localUsersByLocation: buildLocalUsers(),
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    const location = get().activeLocation;
    await get().setActiveLocation(location);
  },

  setActiveLocation: async (location) => {
    set({ isLoading: true, error: null, activeLocation: location });
    try {
      if (location === 'gx-egg') {
        const users = await loadGxEggUsers();
        set({ users, isLoading: false });
        return;
      }

      const localUsers = get().localUsersByLocation[location];
      set({ users: sortAndRankUsers(localUsers), isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  addUser: async (name, count, participationCount) => {
    const location = get().activeLocation;
    if (location === 'gx-egg') {
      try {
        await ensureAuth();
        await db.collection('Dayitong_guess_users').add({
          name,
          count,
          participationCount,
          rate: calculateRate(count, participationCount),
          rank: 0,
          history: [],
        });
        await get().setActiveLocation('gx-egg');
      } catch (error: unknown) {
        set({ error: getErrorMessage(error) });
      }
      return;
    }

    const newUser: GuessUser = {
      id: `${location}-${Date.now()}`,
      name,
      count,
      participationCount,
      rate: calculateRate(count, participationCount),
      rank: 0,
      history: [],
    };

    set((state) => {
      const nextUsers = sortAndRankUsers([...state.users, newUser]);
      return {
        users: nextUsers,
        localUsersByLocation: {
          ...state.localUsersByLocation,
          [location]: nextUsers,
        },
      };
    });
  },

  updateUser: async (id, name, count, participationCount) => {
    const location = get().activeLocation;
    if (location === 'gx-egg') {
      try {
        await ensureAuth();
        await db.collection('Dayitong_guess_users').doc(id).update({
          name,
          count,
          participationCount,
          rate: calculateRate(count, participationCount),
        });
        await get().setActiveLocation('gx-egg');
      } catch (error: unknown) {
        set({ error: getErrorMessage(error) });
      }
      return;
    }

    set((state) => {
      const nextUsers = sortAndRankUsers(
        state.users.map((user) =>
          user.id === id
            ? {
                ...user,
                name,
                count,
                participationCount,
                rate: calculateRate(count, participationCount),
              }
            : user,
        ),
      );
      return {
        users: nextUsers,
        localUsersByLocation: {
          ...state.localUsersByLocation,
          [location]: nextUsers,
        },
      };
    });
  },

  deleteUser: async (id) => {
    const location = get().activeLocation;
    if (location === 'gx-egg') {
      try {
        await ensureAuth();
        await db.collection('Dayitong_guess_users').doc(id).remove();
        await get().setActiveLocation('gx-egg');
      } catch (error: unknown) {
        set({ error: getErrorMessage(error) });
      }
      return;
    }

    set((state) => {
      const nextUsers = sortAndRankUsers(state.users.filter((user) => user.id !== id));
      return {
        users: nextUsers,
        localUsersByLocation: {
          ...state.localUsersByLocation,
          [location]: nextUsers,
        },
      };
    });
  },

  updateUserHistory: async (userId, historyId, data) => {
    const location = get().activeLocation;
    const currentUser = get().users.find((user) => user.id === userId);
    if (!currentUser) return;

    const nextHistory = currentUser.history.map((history) => (history.id === historyId ? { ...history, ...data } : history));

    if (location === 'gx-egg') {
      try {
        await ensureAuth();
        await db.collection('Dayitong_guess_users').doc(userId).update({ history: nextHistory });
        await get().setActiveLocation('gx-egg');
      } catch (error: unknown) {
        set({ error: getErrorMessage(error) });
      }
      return;
    }

    set((state) => {
      const nextUsers = sortAndRankUsers(
        state.users.map((user) => (user.id === userId ? { ...user, history: nextHistory } : user)),
      );
      return {
        users: nextUsers,
        localUsersByLocation: {
          ...state.localUsersByLocation,
          [location]: nextUsers,
        },
      };
    });
  },
}));
