import { create } from 'zustand';
import { db, ensureAuth } from '../lib/cloudbase';
import { EDIT_PERMISSION_DENIED_MESSAGE, isCurrentUserAdmin } from '../lib/permissions';

export type EditableProfileField = 'name' | 'gender' | 'hobby' | 'signature';

type ProfileFields = {
  name: string;
  gender: string;
  hobby: string;
  signature: string;
  avatarUrl: string | null;
};

interface ProfileDoc extends ProfileFields {
  _id: string;
  uid: string;
  createdAt: number;
  updatedAt: number;
}

interface DbListResponse<T> {
  data: T[];
}

interface ProfileState extends ProfileFields {
  currentUid: string | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: (uid: string) => Promise<void>;
  resetProfile: () => void;
  updateField: (field: EditableProfileField, value: string) => Promise<void>;
  updateAvatar: (avatarUrl: string | null) => Promise<void>;
}

const PROFILE_COLLECTION = 'Dayitong_user_profiles';

const BASE_DEFAULT_PROFILE: ProfileFields = {
  name: 'JIEYOU',
  gender: '男',
  hobby: '音乐、电影、旅行',
  signature: '愿音乐陪你解忧。',
  avatarUrl: null,
};

const readLegacyLocalProfile = (): ProfileFields | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('jieyou-profile-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: Partial<ProfileFields> };
    const state = parsed.state;
    if (!state) return null;
    return {
      name: typeof state.name === 'string' && state.name ? state.name : BASE_DEFAULT_PROFILE.name,
      gender: typeof state.gender === 'string' && state.gender ? state.gender : BASE_DEFAULT_PROFILE.gender,
      hobby: typeof state.hobby === 'string' && state.hobby ? state.hobby : BASE_DEFAULT_PROFILE.hobby,
      signature:
        typeof state.signature === 'string' && state.signature ? state.signature : BASE_DEFAULT_PROFILE.signature,
      avatarUrl: typeof state.avatarUrl === 'string' ? state.avatarUrl : null,
    };
  } catch {
    return null;
  }
};

const LEGACY_LOCAL_PROFILE = readLegacyLocalProfile();
const DEFAULT_PROFILE: ProfileFields = LEGACY_LOCAL_PROFILE ?? BASE_DEFAULT_PROFILE;

const pickProfileFields = (state: ProfileFields): ProfileFields => ({
  name: state.name,
  gender: state.gender,
  hobby: state.hobby,
  signature: state.signature,
  avatarUrl: state.avatarUrl,
});

const mapDocToFields = (doc: Partial<ProfileDoc>): ProfileFields => ({
  name: typeof doc.name === 'string' && doc.name ? doc.name : DEFAULT_PROFILE.name,
  gender: typeof doc.gender === 'string' && doc.gender ? doc.gender : DEFAULT_PROFILE.gender,
  hobby: typeof doc.hobby === 'string' && doc.hobby ? doc.hobby : DEFAULT_PROFILE.hobby,
  signature: typeof doc.signature === 'string' && doc.signature ? doc.signature : DEFAULT_PROFILE.signature,
  avatarUrl: typeof doc.avatarUrl === 'string' ? doc.avatarUrl : null,
});

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

const getProfileCollection = () => db.collection(PROFILE_COLLECTION);

const upsertProfileByUid = async (uid: string, fields: ProfileFields): Promise<void> => {
  await ensureAuth();

  const collection = getProfileCollection();
  const existing = (await collection.where({ uid }).limit(1).get()) as DbListResponse<ProfileDoc>;
  const now = Date.now();

  if (existing.data.length > 0) {
    await collection.doc(existing.data[0]._id).update({
      ...fields,
      updatedAt: now,
    });
    return;
  }

  await collection.add({
    uid,
    ...fields,
    createdAt: now,
    updatedAt: now,
  });
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  ...DEFAULT_PROFILE,
  currentUid: null,
  isLoading: false,
  error: null,

  loadProfile: async (uid) => {
    set({ isLoading: true, error: null, currentUid: uid });

    try {
      await ensureAuth();
      const collection = getProfileCollection();
      const res = (await collection.where({ uid }).limit(1).get()) as DbListResponse<ProfileDoc>;

      if (res.data.length === 0) {
        if (isCurrentUserAdmin()) {
          await upsertProfileByUid(uid, DEFAULT_PROFILE);
        }
        set({ ...DEFAULT_PROFILE, isLoading: false });
        return;
      }

      const fields = mapDocToFields(res.data[0]);
      set({ ...fields, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, '加载个人资料失败'),
        isLoading: false,
      });
    }
  },

  resetProfile: () => {
    set({
      ...DEFAULT_PROFILE,
      currentUid: null,
      isLoading: false,
      error: null,
    });
  },

  updateField: async (field, value) => {
    if (!isCurrentUserAdmin()) {
      set({ error: EDIT_PERMISSION_DENIED_MESSAGE });
      return;
    }
    set((state) => ({
      ...state,
      [field]: value,
      error: null,
    }));

    const uid = get().currentUid;
    if (!uid) return;

    try {
      const profile = pickProfileFields(get());
      await upsertProfileByUid(uid, profile);
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '保存个人资料失败') });
    }
  },

  updateAvatar: async (avatarUrl) => {
    if (!isCurrentUserAdmin()) {
      set({ error: EDIT_PERMISSION_DENIED_MESSAGE });
      return;
    }
    set((state) => ({
      ...state,
      avatarUrl,
      error: null,
    }));

    const uid = get().currentUid;
    if (!uid) return;

    try {
      const profile = pickProfileFields(get());
      await upsertProfileByUid(uid, profile);
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '保存头像失败') });
    }
  },
}));
