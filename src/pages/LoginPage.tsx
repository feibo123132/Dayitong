import { useEffect, useMemo, useState } from 'react';
import { UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  if (name.length <= 2) return `${name[0] ?? ''}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
};

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { sendCode, loginWithCode, error, user, resetError } = useAuthStore();
  const navigate = useNavigate();

  const accountLabel = useMemo(() => {
    if (email) return maskEmail(email);
    if (user?.email) return maskEmail(user.email);
    return '邮箱号登录';
  }, [email, user?.email]);

  useEffect(() => {
    if (user && !user.isAnonymous) {
      navigate('/profile');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    resetError();
    setIsSendingCode(true);
    try {
      const success = await sendCode(email);
      if (success) {
        setCountdown(60);
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();

    setIsLoggingIn(true);
    try {
      await loginWithCode(email, code);
      navigate('/profile');
    } catch {
      // Error text is shown by store.
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] px-6 pb-10 flex flex-col">
      <div className="pt-14 text-center">
        <div className="w-24 h-24 rounded-md bg-gradient-to-br from-amber-200 to-yellow-300 mx-auto flex items-center justify-center shadow-sm">
          <UserRound size={42} className="text-white" />
        </div>
        <div className="mt-6 text-[40px] leading-none tracking-tight text-gray-900 font-medium">{accountLabel}</div>
      </div>

      <form onSubmit={handleLogin} className="mt-12">
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="flex items-center px-4 py-4 border-b border-gray-200">
            <label className="w-24 text-gray-800 text-[18px]">邮箱号</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[18px] text-gray-700 placeholder:text-gray-400"
              placeholder="请输入邮箱地址"
            />
          </div>

          <div className="flex items-center px-4 py-4">
            <label className="w-24 text-gray-800 text-[18px]">验证码</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[18px] text-gray-700 placeholder:text-gray-400"
              placeholder="请输入验证码"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSendCode()}
          disabled={isSendingCode || countdown > 0}
          className="mt-4 text-[28px] leading-none text-[#576b95] disabled:text-gray-400"
        >
          {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s 后重新发送` : '发送邮箱验证码'}
        </button>

        {error && <div className="mt-4 text-sm text-red-500">{error}</div>}

        <div className="mt-24">
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full h-16 rounded-2xl bg-[#07c160] text-white text-3xl font-semibold disabled:opacity-50"
          >
            {isLoggingIn ? '登录中...' : '登录'}
          </button>
        </div>
      </form>
    </div>
  );
};
