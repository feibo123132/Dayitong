import { create } from 'zustand';
import { db, ensureAuth } from '../lib/cloudbase';
import { EDIT_PERMISSION_DENIED_MESSAGE, isCurrentUserAdmin } from '../lib/permissions';

const SONG_REQUEST_COLLECTION = 'Dayitong_song_requests';
export const TRASH_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export interface SongRequest {
  id: string; // Mapped from _id
  songName: string;
  artist?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'playing';
  likes: number;
  createdAt: number;
  deletedAt?: number;
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
  deleteRequest: (id: string) => Promise<void>; // Soft delete
  restoreRequest: (id: string) => Promise<void>;
  permanentDeleteRequest: (id: string) => Promise<void>;
  cleanupTrash: () => Promise<void>;
}

interface DbListResponse<T> {
  data: T[];
}

type SongRequestDoc = Omit<SongRequest, 'id'> & { _id: string };

const mapSongRequestDoc = (request: SongRequestDoc): SongRequest => ({
  ...request,
  id: request._id,
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
      const res = (await db.collection(SONG_REQUEST_COLLECTION).orderBy('createdAt', 'desc').get()) as DbListResponse<SongRequestDoc>;
      let requests = res.data.map(mapSongRequestDoc);

      if (requests.length === 0 && isCurrentUserAdmin()) {
        console.log('Initializing song_requests with mock data...');
        const addPromises = INITIAL_REQUESTS.map((req) => db.collection(SONG_REQUEST_COLLECTION).add(req));
        await Promise.all(addPromises);
        const newRes = (await db.collection(SONG_REQUEST_COLLECTION).orderBy('createdAt', 'desc').get()) as DbListResponse<SongRequestDoc>;
        requests = newRes.data.map(mapSongRequestDoc);
      }
      
      // Sort manually just in case, though orderBy should work
      requests.sort((a, b) => b.createdAt - a.createdAt);

      set({ requests, isLoading: false });
    } catch (error: unknown) {
      console.error('Fetch requests failed:', error);
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  addRequest: async (songName, artist, message) => {
    if (!isCurrentUserAdmin()) {
      set({ error: EDIT_PERMISSION_DENIED_MESSAGE });
      return;
    }
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
      await db.collection(SONG_REQUEST_COLLECTION).add(newRequest);
      get().fetchRequests();
    } catch (err) {
      console.error('Add request failed:', err);
    }
  },

  likeRequest: async (id) => {
    if (!isCurrentUserAdmin()) {
      set({ error: EDIT_PERMISSION_DENIED_MESSAGE });
      return;
    }
    try {
      await ensureAuth();
      const target = get().requests.find((item) => item.id === id);
      if (!target || target.deletedAt) return;

      const command = db.command;
      await db.collection(SONG_REQUEST_COLLECTION).doc(id).update({
        likes: command.inc(1)
      });
      get().fetchRequests();
    } catch (err) {
      console.error('Like request failed:', err);
    }
  },

  updateStatus: async (id, status) => {
    if (!isCurrentUserAdmin()) {
      set({ error: EDIT_PERMISSION_DENIED_MESSAGE });
      return;
    }
    try {
      await ensureAuth();
      const target = get().requests.find((item) => item.id === id);
      if (!target || target.deletedAt) return;

      await db.collection(SONG_REQUEST_COLLECTION).doc(id).update({ status });
      get().fetchRequests();
    } catch (err) {
      console.error('Update status failed:', err);
    }
  },

  updateRequest: async (id, data) => {
    if (!isCurrentUserAdmin()) {
      set({ error: EDIT_PERMISSION_DENIED_MESSAGE });
      return;
    }
    try {
      await ensureAuth();
      const target = get().requests.find((item) => item.id === id);
      if (!target || target.deletedAt) return;

      const safeData = { ...data };
      delete safeData.id;
      await db.collection(SONG_REQUEST_COLLECTION).doc(id).update(safeData);
      get().fetchRequests();
    } catch (err) {
      console.error('Update request failed:', err);
    }
  },

  deleteRequest: async (id) => {
    if (!isCurrentUserAdmin()) {
      set({ error: EDIT_PERMISSION_DENIED_MESSAGE });
      return;
    }
    const now = Date.now();
    const previous = get().requests;
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === id ? { ...request, deletedAt: now } : request
      ),
    }));

    try {
      await ensureAuth();
      await db.collection(SONG_REQUEST_COLLECTION).doc(id).update({ deletedAt: now });
    } catch (err) {
      console.error('Delete request failed:', err);
      set({ requests: previous });
      await get().fetchRequests();
    }
  },

  restoreRequest: async (id) => {
    if (!isCurrentUserAdmin()) {
      set({ error: EDIT_PERMISSION_DENIED_MESSAGE });
      return;
    }
    const previous = get().requests;
    set((state) => ({
      requests: state.requests.map((request) => {
        if (request.id !== id) return request;
        const restored = { ...request };
        delete restored.deletedAt;
        return restored;
      }),
    }));

    try {
      await ensureAuth();
      const command = db.command;
      await db.collection(SONG_REQUEST_COLLECTION).doc(id).update({
        deletedAt: command.remove(),
      });
    } catch (err) {
      console.error('Restore request failed:', err);
      set({ requests: previous });
      await get().fetchRequests();
    }
  },

  permanentDeleteRequest: async (id) => {
    if (!isCurrentUserAdmin()) {
      set({ error: EDIT_PERMISSION_DENIED_MESSAGE });
      return;
    }
    const previous = get().requests;
    set((state) => ({
      requests: state.requests.filter((request) => request.id !== id),
    }));

    try {
      await ensureAuth();
      await db.collection(SONG_REQUEST_COLLECTION).doc(id).remove();
    } catch (err) {
      console.error('Permanent delete request failed:', err);
      set({ requests: previous });
      await get().fetchRequests();
    }
  },

  cleanupTrash: async () => {
    if (!isCurrentUserAdmin()) {
      return;
    }
    try {
      await ensureAuth();
      const now = Date.now();
      const res = (await db.collection(SONG_REQUEST_COLLECTION).get()) as DbListResponse<SongRequestDoc>;

      const expiredIds = res.data
        .filter((request) => typeof request.deletedAt === 'number' && now - request.deletedAt > TRASH_RETENTION_MS)
        .map((request) => request._id);

      if (expiredIds.length === 0) {
        return;
      }

      await Promise.allSettled(expiredIds.map((id) => db.collection(SONG_REQUEST_COLLECTION).doc(id).remove()));
      const expiredIdSet = new Set(expiredIds);
      set((state) => ({
        requests: state.requests.filter((request) => !expiredIdSet.has(request.id)),
      }));
    } catch (err) {
      console.error('Cleanup song request trash failed:', err);
    }
  },
}));
