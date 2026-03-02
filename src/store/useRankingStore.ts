import { create } from 'zustand';
import { db, ensureAuth } from '../lib/cloudbase';

export interface HistoryRecord {
  id: string;
  date: string;
  reason: string;
  scoreChange: number;
  totalScore: number;
  deletedAt?: number; // Soft delete timestamp
}

export interface User {
  id: string; // Mapped from _id
  name: string;
  score: number;
  rank: number;
  history: HistoryRecord[];
}

interface RankingState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (name: string, score: number) => Promise<void>;
  updateUser: (id: string, name: string, score: number) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addHistoryRecord: (userId: string, record: Omit<HistoryRecord, 'id' | 'totalScore' | 'deletedAt'>) => Promise<void>;
  updateHistoryRecord: (userId: string, recordId: string, updates: Partial<Omit<HistoryRecord, 'id' | 'totalScore' | 'deletedAt'>>) => Promise<void>;
  deleteHistoryRecord: (userId: string, recordId: string) => Promise<void>; // Soft delete
  restoreHistoryRecord: (userId: string, recordId: string) => Promise<void>; // Restore
  permanentDeleteHistoryRecord: (userId: string, recordId: string) => Promise<void>; // Hard delete
  cleanupTrash: () => Promise<void>;
}

interface DbListResponse<T> {
  data: T[];
}

type RankingUserDoc = Omit<User, 'id'> & { _id: string };

const mapRankingUserDoc = (user: RankingUserDoc): User => ({
  ...user,
  id: user._id,
});

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

const INITIAL_USERS: Omit<User, 'id'>[] = [
  { 
    name: '吉他小王子', 
    score: 249, 
    rank: 1,
    history: [
      { id: 'h1', date: '2023-10-01', reason: '路演获得好评', scoreChange: 50, totalScore: 50 },
      { id: 'h2', date: '2023-10-05', reason: '参与听歌识曲', scoreChange: 30, totalScore: 80 },
      { id: 'h3', date: '2023-10-10', reason: '粉丝打赏', scoreChange: 169, totalScore: 249 }
    ]
  },
  { name: '民谣阿强', score: 239, rank: 2, history: [] },
  { name: '指弹大师', score: 206, rank: 3, history: [] },
  { name: '摇滚萝莉', score: 192, rank: 4, history: [] },
  { name: '和弦小白', score: 155, rank: 5, history: [] },
];

export const useRankingStore = create<RankingState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      await ensureAuth();
      const res = (await db.collection('Dayitong_ranking_users').get()) as DbListResponse<RankingUserDoc>;
      let users = res.data.map(mapRankingUserDoc);

      if (users.length === 0) {
        console.log('Initializing ranking_users with mock data...');
        const addPromises = INITIAL_USERS.map(user => db.collection('Dayitong_ranking_users').add(user));
        await Promise.all(addPromises);
        const newRes = (await db.collection('Dayitong_ranking_users').get()) as DbListResponse<RankingUserDoc>;
        users = newRes.data.map(mapRankingUserDoc);
      }

      // Sort and update rank
      users.sort((a, b) => b.score - a.score);
      const rankedUsers = users.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
      
      set({ users: rankedUsers, isLoading: false });
    } catch (error: unknown) {
      console.error('Fetch ranking users failed:', error);
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  addUser: async (name, score) => {
    try {
      await ensureAuth();
      const newUser = {
        name,
        score,
        rank: 0,
        history: []
      };
      await db.collection('Dayitong_ranking_users').add(newUser);
      get().fetchUsers();
    } catch (err) {
      console.error('Add user failed:', err);
    }
  },

  updateUser: async (id, name, score) => {
    try {
      await ensureAuth();
      await db.collection('Dayitong_ranking_users').doc(id).update({ name, score });
      get().fetchUsers();
    } catch (err) {
      console.error('Update user failed:', err);
    }
  },

  deleteUser: async (id) => {
    try {
      await ensureAuth();
      await db.collection('Dayitong_ranking_users').doc(id).remove();
      get().fetchUsers();
    } catch (err) {
      console.error('Delete user failed:', err);
    }
  },

  addHistoryRecord: async (userId, record) => {
    try {
      await ensureAuth();
      const user = get().users.find(u => u.id === userId);
      if (!user) return;

      const newScore = user.score + record.scoreChange;
      const newHistoryRecord: HistoryRecord = {
        id: `h${Date.now()}`,
        ...record,
        totalScore: newScore
      };
      
      const newHistory = [newHistoryRecord, ...user.history];
      
      await db.collection('Dayitong_ranking_users').doc(userId).update({
        score: newScore,
        history: newHistory
      });
      get().fetchUsers();
    } catch (err) {
      console.error('Add history failed:', err);
    }
  },

  updateHistoryRecord: async (userId, recordId, updates) => {
    try {
      await ensureAuth();
      const user = get().users.find(u => u.id === userId);
      if (!user) return;

      const recordIndex = user.history.findIndex(h => h.id === recordId);
      if (recordIndex === -1) return;

      const oldRecord = user.history[recordIndex];
      const scoreDiff = (updates.scoreChange ?? oldRecord.scoreChange) - oldRecord.scoreChange;
      const newScore = user.score + scoreDiff;

      const newHistory = [...user.history];
      newHistory[recordIndex] = {
        ...oldRecord,
        ...updates,
        totalScore: newScore // Note: Simplified logic
      };

      await db.collection('Dayitong_ranking_users').doc(userId).update({
        score: newScore,
        history: newHistory
      });
      get().fetchUsers();
    } catch (err) {
      console.error('Update history failed:', err);
    }
  },

  deleteHistoryRecord: async (userId, recordId) => {
    try {
      await ensureAuth();
      const user = get().users.find(u => u.id === userId);
      if (!user) return;

      const now = Date.now();
      const recordToDelete = user.history.find(h => h.id === recordId);
      if (!recordToDelete || recordToDelete.deletedAt) return;

      const newScore = user.score - recordToDelete.scoreChange;
      const newHistory = user.history.map(h => 
        h.id === recordId ? { ...h, deletedAt: now } : h
      );

      await db.collection('Dayitong_ranking_users').doc(userId).update({
        score: newScore,
        history: newHistory
      });
      get().fetchUsers();
    } catch (err) {
      console.error('Delete history failed:', err);
    }
  },

  restoreHistoryRecord: async (userId, recordId) => {
    try {
      await ensureAuth();
      const user = get().users.find(u => u.id === userId);
      if (!user) return;

      const recordToRestore = user.history.find(h => h.id === recordId);
      if (!recordToRestore || !recordToRestore.deletedAt) return;

      const newScore = user.score + recordToRestore.scoreChange;
      const newHistory = user.history.map(h => {
        if (h.id === recordId) {
          const restored = { ...h };
          delete restored.deletedAt;
          return restored;
        }
        return h;
      });

      await db.collection('Dayitong_ranking_users').doc(userId).update({
        score: newScore,
        history: newHistory
      });
      get().fetchUsers();
    } catch (err) {
      console.error('Restore history failed:', err);
    }
  },

  permanentDeleteHistoryRecord: async (userId, recordId) => {
    try {
      await ensureAuth();
      const user = get().users.find(u => u.id === userId);
      if (!user) return;

      const newHistory = user.history.filter(h => h.id !== recordId);
      // Score was already adjusted during soft delete

      await db.collection('Dayitong_ranking_users').doc(userId).update({
        history: newHistory
      });
      get().fetchUsers();
    } catch (err) {
      console.error('Permanent delete history failed:', err);
    }
  },

  cleanupTrash: async () => {
    try {
      await ensureAuth();
      const users = get().users;
      const now = Date.now();
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

      for (const user of users) {
        const hasExpiredTrash = user.history.some(h => h.deletedAt && now - h.deletedAt > SEVEN_DAYS);
        if (hasExpiredTrash) {
          const newHistory = user.history.filter(h => !(h.deletedAt && now - h.deletedAt > SEVEN_DAYS));
          await db.collection('Dayitong_ranking_users').doc(user.id).update({
            history: newHistory
          });
        }
      }
      get().fetchUsers();
    } catch (err) {
      console.error('Cleanup trash failed:', err);
    }
  }
}));
