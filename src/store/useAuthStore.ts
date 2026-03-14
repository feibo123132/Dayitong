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

interface PasswordSetupResult {
  autoLoggedIn: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  verificationContext: VerificationInfo | null;
  passwordVerificationContext: VerificationInfo | null;

  initAuth: () => Promise<void>;
  sendCode: (email: string) => Promise<boolean>;
  loginWithCode: (email: string, code: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  requestPasswordSetup: (email: string) => Promise<boolean>;
  confirmPasswordSetup: (email: string, code: string, newPassword: string) => Promise<PasswordSetupResult>;
  logout: () => Promise<void>;
  resetError: () => void;
}

interface LoginStateWithUser {
  user: User;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const extractSdkErrorMessage = (result: unknown, fallback: string): string => {
  if (!result || typeof result !== 'object') {
    return fallback;
  }
  const maybeError = (result as { error?: unknown }).error;
  if (maybeError && typeof maybeError === 'object') {
    const withMessage = maybeError as { message?: unknown; code?: unknown };
    if (typeof withMessage.message === 'string' && withMessage.message.trim()) {
      return withMessage.message;
    }
    if (typeof withMessage.code === 'string' && withMessage.code.trim()) {
      return withMessage.code;
    }
  }
  return fallback;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toStoreUser = (rawUser: unknown): User | null => {
  if (!rawUser || typeof rawUser !== 'object') {
    return null;
  }

  const data = rawUser as {
    uid?: unknown;
    id?: unknown;
    email?: unknown;
    isAnonymous?: unknown;
    is_anonymous?: unknown;
    user_metadata?: {
      uid?: unknown;
    };
  };

  const uid =
    typeof data.uid === 'string' && data.uid
      ? data.uid
      : typeof data.user_metadata?.uid === 'string' && data.user_metadata.uid
      ? data.user_metadata.uid
      : typeof data.id === 'string' && data.id
      ? data.id
      : '';

  if (!uid) {
    return null;
  }

  return {
    uid,
    email: typeof data.email === 'string' ? data.email : undefined,
    isAnonymous:
      typeof data.isAnonymous === 'boolean'
        ? data.isAnonymous
        : typeof data.is_anonymous === 'boolean'
        ? data.is_anonymous
        : undefined,
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  verificationContext: null,
  passwordVerificationContext: null,

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
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
        throw new Error('请输入有效的邮箱地址');
      }

      const context = await auth.getVerification({ email: normalizedEmail });
      if (typeof context.verification_id === 'string' && context.verification_id.trim()) {
        set({
          verificationContext: {
            verification_id: context.verification_id,
            is_user: typeof context.is_user === 'boolean' ? context.is_user : false,
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
        email: normalizeEmail(email),
        verificationCode: code,
        verificationInfo: context,
      });
      set({ verificationContext: null });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '登录失败，请检查验证码'), isLoading: false });
      throw error;
    }
  },

  loginWithPassword: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
        throw new Error('请输入有效的邮箱地址');
      }
      if (!password) {
        throw new Error('请输入密码');
      }

      const result = await auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (result?.error) {
        throw new Error(extractSdkErrorMessage(result, '邮箱或密码错误'));
      }

      const directUser = toStoreUser((result as { data?: { user?: unknown } })?.data?.user);
      if (directUser) {
        set({ user: directUser, isLoading: false, error: null });
        return;
      }

      const loginState = await auth.getLoginState();
      if (isLoginStateWithUser(loginState)) {
        set({ user: loginState.user, isLoading: false, error: null });
        return;
      }

      set({ isLoading: false, error: null });
    } catch (error: unknown) {
      const message = getErrorMessage(error, '密码登录失败');
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  requestPasswordSetup: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
        throw new Error('请输入有效的邮箱地址');
      }

      const context = await auth.getVerification({
        email: normalizedEmail,
        usage: 'reset_password',
      });

      if (typeof context.verification_id === 'string' && context.verification_id.trim()) {
        set({
          passwordVerificationContext: {
            verification_id: context.verification_id,
            is_user: typeof context.is_user === 'boolean' ? context.is_user : false,
          },
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '发送设置密码验证码失败'), isLoading: false });
      return false;
    }
  },

  confirmPasswordSetup: async (email: string, code: string, newPassword: string) => {
    set({ isLoading: true, error: null });

    const context = get().passwordVerificationContext;
    if (!context) {
      set({ error: '设置密码验证码上下文已失效，请重新发送验证码', isLoading: false });
      throw new Error('Missing verification context');
    }

    try {
      const normalizedEmail = normalizeEmail(email);
      const verified = await auth.verify({
        verification_id: context.verification_id,
        verification_code: code,
      });

      if (!verified.verification_token) {
        throw new Error('验证码验证失败，请重新获取');
      }

      await auth.resetPassword({
        email: normalizedEmail,
        new_password: newPassword,
        verification_token: verified.verification_token,
      });

      const loginResult = await auth.signInWithPassword({
        email: normalizedEmail,
        password: newPassword,
      });

      if (loginResult?.error) {
        throw new Error(extractSdkErrorMessage(loginResult, '密码设置成功，但自动登录失败')); 
      }

      const directUser = toStoreUser((loginResult as { data?: { user?: unknown } })?.data?.user);
      if (directUser) {
        set({
          user: directUser,
          passwordVerificationContext: null,
          verificationContext: null,
          isLoading: false,
          error: null,
        });
      } else {
        const loginState = await auth.getLoginState();
        if (isLoginStateWithUser(loginState)) {
          set({
            user: loginState.user,
            passwordVerificationContext: null,
            verificationContext: null,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            passwordVerificationContext: null,
            verificationContext: null,
            isLoading: false,
            error: null,
          });
        }
      }

      return { autoLoggedIn: true };
    } catch (error: unknown) {
      const message = getErrorMessage(error, '设置密码失败');
      set({ error: message, isLoading: false });
      throw new Error(message);
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
