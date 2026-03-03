import { create } from 'zustand';
import { db, ensureAuth } from '../lib/cloudbase';

export type ActivityTaskId = 'checkin' | 'guess-song' | 'festival-message';

type ActivityProgressFields = {
  completedTaskIds: ActivityTaskId[];
  score: number;
};

interface ActivityProgressDoc extends ActivityProgressFields {
  _id: string;
  uid: string;
  activityId: string;
  createdAt: number;
  updatedAt: number;
}

interface ActivityState extends ActivityProgressFields {
  currentUid: string | null;
  currentActivityId: string | null;
  isLoading: boolean;
  error: string | null;
  loadProgress: (uid: string, activityId: string) => Promise<void>;
  completeTask: (taskId: ActivityTaskId, points: number) => Promise<void>;
  resetProgress: () => void;
}

const ACTIVITY_PROGRESS_COLLECTION = 'Dayitong_activity_progress';

const DEFAULT_PROGRESS: ActivityProgressFields = {
  completedTaskIds: [],
  score: 0,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
};

const normalizeDbData = <T>(value: unknown): T[] => {
  if (typeof value !== 'object' || value === null || !('data' in value)) return [];
  const data = (value as { data?: unknown }).data;
  return Array.isArray(data) ? (data as T[]) : [];
};

const sanitizeTaskIds = (value: unknown): ActivityTaskId[] => {
  if (!Array.isArray(value)) return [];
  const allowSet = new Set<ActivityTaskId>(['checkin', 'guess-song', 'festival-message']);
  return value.filter((item): item is ActivityTaskId => typeof item === 'string' && allowSet.has(item as ActivityTaskId));
};

const getCollection = () => db.collection(ACTIVITY_PROGRESS_COLLECTION);

const upsertProgress = async (uid: string, activityId: string, progress: ActivityProgressFields): Promise<void> => {
  await ensureAuth();

  const collection = getCollection();
  const existing = await collection.where({ uid, activityId }).limit(1).get();
  const existingData = normalizeDbData<ActivityProgressDoc>(existing);
  const now = Date.now();

  if (existingData.length > 0) {
    await collection.doc(existingData[0]._id).update({
      ...progress,
      updatedAt: now,
    });
    return;
  }

  await collection.add({
    uid,
    activityId,
    ...progress,
    createdAt: now,
    updatedAt: now,
  });
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  ...DEFAULT_PROGRESS,
  currentUid: null,
  currentActivityId: null,
  isLoading: false,
  error: null,

  loadProgress: async (uid, activityId) => {
    set({ currentUid: uid, currentActivityId: activityId, isLoading: true, error: null });

    try {
      await ensureAuth();
      const collection = getCollection();
      const res = await collection.where({ uid, activityId }).limit(1).get();
      const data = normalizeDbData<ActivityProgressDoc>(res);

      if (data.length === 0) {
        await upsertProgress(uid, activityId, DEFAULT_PROGRESS);
        set({ ...DEFAULT_PROGRESS, isLoading: false });
        return;
      }

      const doc = data[0];
      set({
        completedTaskIds: sanitizeTaskIds(doc.completedTaskIds),
        score: typeof doc.score === 'number' ? doc.score : 0,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: getErrorMessage(error, '加载活动进度失败'),
      });
    }
  },

  completeTask: async (taskId, points) => {
    const currentState = get();
    if (currentState.completedTaskIds.includes(taskId)) return;

    const nextProgress: ActivityProgressFields = {
      completedTaskIds: [...currentState.completedTaskIds, taskId],
      score: currentState.score + points,
    };

    set({ ...nextProgress, error: null });

    const uid = get().currentUid;
    const activityId = get().currentActivityId;
    if (!uid || !activityId) return;

    try {
      await upsertProgress(uid, activityId, nextProgress);
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '保存活动进度失败') });
    }
  },

  resetProgress: () => {
    set({
      ...DEFAULT_PROGRESS,
      currentUid: null,
      currentActivityId: null,
      isLoading: false,
      error: null,
    });
  },
}));
