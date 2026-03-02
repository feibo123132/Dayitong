import { create } from 'zustand';
import { db, ensureAuth } from '../lib/cloudbase';

export interface SongRequest {
  id: string; // Mapped from _id
  songName: string;
  artist?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'playing';
  likes: number;
  createdAt: number;
}

interface SongRequestState {
  requests: SongRequest[];
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  addRequest: (songName: string, artist?: string, message?: string) => Promise<void>;
  likeRequest: (id: string) => Promise<void>;
  updateStatus: (id: string, status: SongRequest['status']) => Promise<void>;
  updateRequest: (id: string, data: Partial<SongRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

const INITIAL_REQUESTS: Omit<SongRequest, 'id'>[] = [
  {
    songName: '晴天',
    artist: '周杰伦',
    message: '想听这首歌怀念一下高中时光~',
    status: 'playing',
    likes: 128,
    createdAt: Date.now() - 1000 * 60 * 5 // 5 mins ago
  },
  {
    songName: '乌梅子酱',
    artist: '李荣浩',
    message: '送给我的女朋友，希望她天天开心！',
    status: 'accepted',
    likes: 85,
    createdAt: Date.now() - 1000 * 60 * 15 // 15 mins ago
  },
  {
    songName: '想去海边',
    artist: '夏日入侵企画',
    message: '有没有一起去海边的朋友？',
    status: 'pending',
    likes: 42,
    createdAt: Date.now() - 1000 * 60 * 30 // 30 mins ago
  }
];

export const useSongRequestStore = create<SongRequestState>((set, get) => ({
  requests: [],
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      await ensureAuth();
      const res = await db.collection('Dayitong_song_requests').orderBy('createdAt', 'desc').get();
      let requests = res.data.map((r: any) => ({ ...r, id: r._id })) as SongRequest[];

      if (requests.length === 0) {
        console.log('Initializing song_requests with mock data...');
        const addPromises = INITIAL_REQUESTS.map(req => db.collection('Dayitong_song_requests').add(req));
        await Promise.all(addPromises);
        const newRes = await db.collection('Dayitong_song_requests').orderBy('createdAt', 'desc').get();
        requests = newRes.data.map((r: any) => ({ ...r, id: r._id })) as SongRequest[];
      }
      
      // Sort manually just in case, though orderBy should work
      requests.sort((a, b) => b.createdAt - a.createdAt);

      set({ requests, isLoading: false });
    } catch (err: any) {
      console.error('Fetch requests failed:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  addRequest: async (songName, artist, message) => {
    try {
      await ensureAuth();
      const newRequest = {
        songName,
        artist,
        message,
        status: 'pending',
        likes: 0,
        createdAt: Date.now()
      };
      await db.collection('Dayitong_song_requests').add(newRequest);
      get().fetchRequests();
    } catch (err) {
      console.error('Add request failed:', err);
    }
  },

  likeRequest: async (id) => {
    try {
      await ensureAuth();
      const command = db.command;
      await db.collection('Dayitong_song_requests').doc(id).update({
        likes: command.inc(1)
      });
      get().fetchRequests();
    } catch (err) {
      console.error('Like request failed:', err);
    }
  },

  updateStatus: async (id, status) => {
    try {
      await ensureAuth();
      await db.collection('Dayitong_song_requests').doc(id).update({ status });
      get().fetchRequests();
    } catch (err) {
      console.error('Update status failed:', err);
    }
  },

  updateRequest: async (id, data) => {
    try {
      await ensureAuth();
      await db.collection('Dayitong_song_requests').doc(id).update(data);
      get().fetchRequests();
    } catch (err) {
      console.error('Update request failed:', err);
    }
  },

  deleteRequest: async (id) => {
    try {
      await ensureAuth();
      await db.collection('Dayitong_song_requests').doc(id).remove();
      get().fetchRequests();
    } catch (err) {
      console.error('Delete request failed:', err);
    }
  }
}));
