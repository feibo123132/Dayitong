import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleSwitchAccount = async () => {
    if (user) {
      await logout();
    }
    navigate('/login');
  };

  const handleLogout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (window.confirm('确定要退出登录吗？')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24">
      <header className="bg-white px-4 py-3 flex items-center border-b border-gray-100 sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={22} className="text-gray-600" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 pr-7">设置</h1>
      </header>

      <div className="h-8" />

      <section className="bg-white border-y border-gray-100">
        <button
          onClick={handleSwitchAccount}
          className="w-full text-center py-4 text-[20px] text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100"
        >
          切换账号
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-center py-4 text-[20px] text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          退出登录
        </button>
      </section>
    </div>
  );
};
