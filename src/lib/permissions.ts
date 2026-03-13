import { useAuthStore } from '../store/useAuthStore';

export const ADMIN_EMAIL = '2421415030@qq.com';
export const EDIT_PERMISSION_DENIED_MESSAGE = '仅 2421415030@qq.com 可进行编辑操作';

const normalizeEmail = (email?: string | null) => (email ?? '').trim().toLowerCase();

export const isAdminEmail = (email?: string | null): boolean => normalizeEmail(email) === ADMIN_EMAIL;

export const isCurrentUserAdmin = (): boolean => {
  const email = useAuthStore.getState().user?.email;
  return isAdminEmail(email);
};
