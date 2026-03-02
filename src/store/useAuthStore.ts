import { create } from 'zustand';
import { auth } from '../lib/cloudbase';

interface User {
  uid: string;
  email?: string;
  isAnonymous?: boolean;
}

interface VerificationInfo {
  verification_id: string;
  is_user: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  verificationContext: VerificationInfo | null;

  initAuth: () => Promise<void>;
  sendCode: (email: string) => Promise<boolean>;
  loginWithCode: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  resetError: () => void;
}

interface LoginStateWithUser {
  user: User;
}

const isLoginStateWithUser = (value: unknown): value is LoginStateWithUser => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('user' in value)) {
    return false;
  }
  const maybeUser = (value as { user?: unknown }).user;
  if (typeof maybeUser !== 'object' || maybeUser === null) {
    return false;
  }
  return typeof (maybeUser as { uid?: unknown }).uid === 'string';
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  verificationContext: null,

  initAuth: async () => {
    set({ isLoading: true });

    auth.onLoginStateChanged((loginState: unknown) => {
      if (isLoginStateWithUser(loginState)) {
        set({ user: loginState.user, isLoading: false });
        return;
      }
      set({ user: null, isLoading: false });
    });

    const loginState = await auth.getLoginState();
    if (isLoginStateWithUser(loginState)) {
      set({ user: loginState.user, isLoading: false });
      return;
    }
    set({ isLoading: false });
  },

  sendCode: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('请输入有效的邮箱地址');
      }

      const context = await auth.getVerification({ email });
      if (typeof context.verification_id === 'string' && typeof context.is_user === 'boolean') {
        set({
          verificationContext: {
            verification_id: context.verification_id,
            is_user: context.is_user,
          },
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '发送验证码失败'), isLoading: false });
      return false;
    }
  },

  loginWithCode: async (email: string, code: string) => {
    set({ isLoading: true, error: null });
    const context = get().verificationContext;

    if (!context) {
      set({ error: '验证码上下文已失效，请重新发送验证码', isLoading: false });
      return;
    }

    try {
      await auth.signInWithEmail({
        email,
        verificationCode: code,
        verificationInfo: context,
      });
      set({ verificationContext: null });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '登录失败，请检查验证码'), isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await auth.signOut();
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '退出登录失败'), isLoading: false });
    }
  },

  resetError: () => set({ error: null }),
}));
