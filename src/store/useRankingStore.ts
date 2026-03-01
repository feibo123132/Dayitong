import { create } from 'zustand';

export interface HistoryRecord {
  id: string;
  date: string;
  reason: string;
  scoreChange: number;
  totalScore: number;
  deletedAt?: number; // Soft delete timestamp
}

export interface User {
  id: string;
  name: string;
  score: number;
  rank: number;
  history: HistoryRecord[];
}

interface RankingState {
  users: User[];
  addUser: (name: string, score: number) => void;
  updateUser: (id: string, name: string, score: number) => void;
  deleteUser: (id: string) => void;
  addHistoryRecord: (userId: string, record: Omit<HistoryRecord, 'id' | 'totalScore' | 'deletedAt'>) => void;
  updateHistoryRecord: (userId: string, recordId: string, updates: Partial<Omit<HistoryRecord, 'id' | 'totalScore' | 'deletedAt'>>) => void;
  deleteHistoryRecord: (userId: string, recordId: string) => void; // Soft delete
  restoreHistoryRecord: (userId: string, recordId: string) => void; // Restore
  permanentDeleteHistoryRecord: (userId: string, recordId: string) => void; // Hard delete
  cleanupTrash: () => void;
}

const INITIAL_USERS: User[] = [
  { 
    id: 'u1', 
    name: '吉他小王子', 
    score: 249, 
    rank: 1,
    history: [
      { id: 'h1', date: '2023-10-01', reason: '路演获得好评', scoreChange: 50, totalScore: 50 },
      { id: 'h2', date: '2023-10-05', reason: '参与听歌识曲', scoreChange: 30, totalScore: 80 },
      { id: 'h3', date: '2023-10-10', reason: '粉丝打赏', scoreChange: 169, totalScore: 249 }
    ]
  },
  { id: 'u2', name: '民谣阿强', score: 239, rank: 2, history: [] },
  { id: 'u3', name: '指弹大师', score: 206, rank: 3, history: [] },
  { id: 'u4', name: '摇滚萝莉', score: 192, rank: 4, history: [] },
  { id: 'u5', name: '和弦小白', score: 155, rank: 5, history: [] },
];

export const useRankingStore = create<RankingState>((set) => ({
  users: INITIAL_USERS,
  
  addUser: (name, score) => set((state) => {
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      score,
      rank: 0,
      history: []
    };
    const newUsers = [...state.users, newUser];
    
    // Sort and update rank
    newUsers.sort((a, b) => b.score - a.score);
    const rankedUsers = newUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    return { users: rankedUsers };
  }),

  updateUser: (id, name, score) => set((state) => {
    const newUsers = state.users.map(user => 
      user.id === id ? { ...user, name, score } : user
    );
    
    // Sort and update rank
    newUsers.sort((a, b) => b.score - a.score);
    const rankedUsers = newUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    return { users: rankedUsers };
  }),

  deleteUser: (id) => set((state) => {
    const newUsers = state.users.filter(user => user.id !== id);
    
    // Sort and update rank
    newUsers.sort((a, b) => b.score - a.score);
    const rankedUsers = newUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    return { users: rankedUsers };
  }),

  addHistoryRecord: (userId, record) => set((state) => {
    const newUsers = state.users.map(user => {
      if (user.id === userId) {
        const newScore = user.score + record.scoreChange;
        const newHistoryRecord: HistoryRecord = {
          id: `h${Date.now()}`,
          ...record,
          totalScore: newScore
        };
        return {
          ...user,
          score: newScore,
          history: [newHistoryRecord, ...user.history]
        };
      }
      return user;
    });

    // Sort and update rank
    newUsers.sort((a, b) => b.score - a.score);
    const rankedUsers = newUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    return { users: rankedUsers };
  }),

  updateHistoryRecord: (userId, recordId, updates) => set((state) => {
    const newUsers = state.users.map(user => {
      if (user.id === userId) {
        const recordIndex = user.history.findIndex(h => h.id === recordId);
        if (recordIndex === -1) return user;

        const oldRecord = user.history[recordIndex];
        const scoreDiff = (updates.scoreChange ?? oldRecord.scoreChange) - oldRecord.scoreChange;
        const newScore = user.score + scoreDiff;

        const newHistory = [...user.history];
        newHistory[recordIndex] = {
          ...oldRecord,
          ...updates,
          totalScore: newScore // Note: This simplifies totalScore history tracking. Ideally totalScore of subsequent records should also update if we want strict ledger consistency.
        };

        return {
          ...user,
          score: newScore,
          history: newHistory
        };
      }
      return user;
    });

    // Sort and update rank
    newUsers.sort((a, b) => b.score - a.score);
    const rankedUsers = newUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    return { users: rankedUsers };
  }),

  deleteHistoryRecord: (userId, recordId) => set((state) => {
    const now = Date.now();
    const newUsers = state.users.map(user => {
      if (user.id === userId) {
        const recordToDelete = user.history.find(h => h.id === recordId);
        if (!recordToDelete || recordToDelete.deletedAt) return user;

        const newScore = user.score - recordToDelete.scoreChange;
        // Soft delete: mark with timestamp but keep in array
        const newHistory = user.history.map(h => 
          h.id === recordId ? { ...h, deletedAt: now } : h
        );
        
        return {
          ...user,
          score: newScore,
          history: newHistory
        };
      }
      return user;
    });

    // Sort and update rank
    newUsers.sort((a, b) => b.score - a.score);
    const rankedUsers = newUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    return { users: rankedUsers };
  }),

  restoreHistoryRecord: (userId, recordId) => set((state) => {
    const newUsers = state.users.map(user => {
      if (user.id === userId) {
        const recordToRestore = user.history.find(h => h.id === recordId);
        if (!recordToRestore || !recordToRestore.deletedAt) return user;

        const newScore = user.score + recordToRestore.scoreChange;
        // Restore: remove deletedAt
        const newHistory = user.history.map(h => 
          h.id === recordId ? { ...h, deletedAt: undefined } : h
        );
        
        return {
          ...user,
          score: newScore,
          history: newHistory
        };
      }
      return user;
    });

    // Sort and update rank
    newUsers.sort((a, b) => b.score - a.score);
    const rankedUsers = newUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    return { users: rankedUsers };
  }),

  permanentDeleteHistoryRecord: (userId, recordId) => set((state) => {
    const newUsers = state.users.map(user => {
      if (user.id === userId) {
        const newHistory = user.history.filter(h => h.id !== recordId);
        return { ...user, history: newHistory };
      }
      return user;
    });
    return { users: newUsers };
  }),

  cleanupTrash: () => set((state) => {
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    
    const newUsers = state.users.map(user => {
      const newHistory = user.history.filter(h => 
        !h.deletedAt || (now - h.deletedAt <= SEVEN_DAYS)
      );
      return { ...user, history: newHistory };
    });
    
    return { users: newUsers };
  })
}));
