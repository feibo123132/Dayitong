import { create } from 'zustand';
import type { HistoryRecord } from '../types/history';
import { db, ensureAuth } from '../lib/cloudbase';

export type { HistoryRecord };

export interface GuessUser {
  id: string; // Mapped from _id
  name: string;
  count: number; // 答对数
  participationCount: number; // 参与次数
  rate: string; // 答对率 (百分比字符串)
  rank: number;
  history: HistoryRecord[];
}

interface GuessMusicState {
  users: GuessUser[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (name: string, count: number, participationCount: number) => Promise<void>;
  updateUser: (id: string, name: string, count: number, participationCount: number) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUserHistory: (userId: string, historyId: string, data: Partial<HistoryRecord>) => Promise<void>;
}

// 每次参与答题总数固定为 4 首
const SONGS_PER_ROUND = 4;

// Mock history data
const MOCK_HISTORY_DATA: Record<string, HistoryRecord[]> = {
  '1': [
    { id: 'h1', date: '2023-10-01', location: '广西一颗蛋🥚', weather: '晴朗', festival: '国庆节', mood: '兴奋', score: 4, total: 4 },
    { id: 'h2', date: '2023-10-02', location: '广西一颗蛋🥚', weather: '多云', mood: '开心', score: 3, total: 4 },
    { id: 'h3', date: '2023-10-05', location: '校园广场', weather: '小雨', mood: '平静', score: 3, total: 4 },
  ],
  '2': [
    { id: 'h4', date: '2023-09-20', location: '艺术学院', weather: '晴', mood: '激动', score: 4, total: 4 },
    { id: 'h5', date: '2023-09-25', location: '广西一颗蛋🥚', weather: '阴', mood: '期待', score: 3, total: 4 },
  ]
};

const calculateRate = (count: number, participationCount: number): string => {
  if (participationCount === 0) return '0%';
  const totalSongs = participationCount * SONGS_PER_ROUND;
  // 答对数不能超过总题目数 (容错处理)
  const validCount = Math.min(count, totalSongs);
  return `${Math.round((validCount / totalSongs) * 100)}%`;
};

const sortAndRankUsers = (users: GuessUser[]): GuessUser[] => {
  // 排序规则：答对数越多越靠前；答对数相同，答对率越高越靠前
  const sortedUsers = [...users].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    // 答对率比较 (去除 % 后转数字)
    const rateA = parseFloat(a.rate);
    const rateB = parseFloat(b.rate);
    return rateB - rateA;
  });

  return sortedUsers.map((user, index) => ({
    ...user,
    rank: index + 1
  }));
};

const INITIAL_USERS: Omit<GuessUser, 'id'>[] = [
  { name: 'JIEYOU', count: 30, participationCount: 10, rate: '75%', rank: 1, history: [] },
  { name: '小橘同学', count: 28, participationCount: 8, rate: '88%', rank: 2, history: [] },
  { name: '吉他手阿泽', count: 25, participationCount: 7, rate: '89%', rank: 3, history: [] },
  { name: '听歌达人小夏', count: 22, participationCount: 6, rate: '92%', rank: 4, history: [] },
  { name: '校园歌神', count: 20, participationCount: 6, rate: '83%', rank: 5, history: [] },
].map((user, index) => {
  // Map mock history (using index + 1 as original ID logic)
  const originalId = (index + 1).toString();
  const history = MOCK_HISTORY_DATA[originalId] || [];
  return { ...user, history };
});

export const useGuessMusicStore = create<GuessMusicState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      await ensureAuth();
      const res = await db.collection('Dayitong_guess_users').get();
      
      let users = res.data.map((u: any) => ({ ...u, id: u._id })) as GuessUser[];

      // Initialize with mock data if empty
      if (users.length === 0) {
        console.log('Initializing guess_users with mock data...');
        const addPromises = INITIAL_USERS.map(user => db.collection('Dayitong_guess_users').add(user));
        await Promise.all(addPromises);
        // Fetch again
        const newRes = await db.collection('Dayitong_guess_users').get();
        users = newRes.data.map((u: any) => ({ ...u, id: u._id })) as GuessUser[];
      }

      const sortedUsers = sortAndRankUsers(users);
      set({ users: sortedUsers, isLoading: false });
    } catch (err: any) {
      console.error('Fetch users failed:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  addUser: async (name, count, participationCount) => {
    try {
      await ensureAuth();
      const newUser = {
        name,
        count,
        participationCount,
        rate: calculateRate(count, participationCount),
        rank: 0,
        history: []
      };
      await db.collection('Dayitong_guess_users').add(newUser);
      get().fetchUsers();
    } catch (err) {
      console.error('Add user failed:', err);
    }
  },

  updateUser: async (id, name, count, participationCount) => {
    try {
      await ensureAuth();
      const updates = {
        name,
        count,
        participationCount,
        rate: calculateRate(count, participationCount)
      };
      await db.collection('Dayitong_guess_users').doc(id).update(updates);
      get().fetchUsers();
    } catch (err) {
      console.error('Update user failed:', err);
    }
  },

  deleteUser: async (id) => {
    try {
      await ensureAuth();
      await db.collection('Dayitong_guess_users').doc(id).remove();
      get().fetchUsers();
    } catch (err) {
      console.error('Delete user failed:', err);
    }
  },

  updateUserHistory: async (userId, historyId, data) => {
    try {
      await ensureAuth();
      const user = get().users.find(u => u.id === userId);
      if (!user) return;

      const newHistory = user.history.map(h => 
        h.id === historyId ? { ...h, ...data } : h
      );

      await db.collection('Dayitong_guess_users').doc(userId).update({
        history: newHistory
      });
      get().fetchUsers();
    } catch (err) {
      console.error('Update history failed:', err);
    }
  }
}));
