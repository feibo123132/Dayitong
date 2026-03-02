import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Music, User, Calendar } from 'lucide-react';
import { useEffect } from 'react';
import { useGuessMusicStore } from '../store/useGuessMusicStore';
import { useRankingStore } from '../store/useRankingStore';
import { useSongRequestStore } from '../store/useSongRequestStore';
import { useAuthStore } from '../store/useAuthStore';

let hasInitializedCloudData = false;

export const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Guard against duplicate init in React StrictMode (dev).
  useEffect(() => {
    if (hasInitializedCloudData) return;
    hasInitializedCloudData = true;

    // Initialize Auth first
    useAuthStore.getState().initAuth().then(() => {
      // Then fetch data
      void Promise.allSettled([
        useGuessMusicStore.getState().fetchUsers(),
        useRankingStore.getState().fetchUsers(),
        useSongRequestStore.getState().fetchRequests(),
      ]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-jieyou-bg pb-20">
      <div className="max-w-md mx-auto relative min-h-screen bg-white/50 shadow-2xl">
        {/* Top Status Bar (Placeholder for Mobile Style) */}
        {isHomePage && (
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <div className="font-bold text-lg text-jieyou-text">JIEYOU音乐工场</div>
            <div className="text-sm text-jieyou-mint">菜单</div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="p-4 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom Tab Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe">
          <div className="max-w-md mx-auto flex items-center justify-around h-16">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-jieyou-mint' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Home size={24} />
              <span className="text-[10px] font-medium">首页</span>
            </NavLink>
            <NavLink
              to="/activity"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-jieyou-mint' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Calendar size={24} />
              <span className="text-[10px] font-medium">活动</span>
            </NavLink>
            <NavLink
              to="/music"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-jieyou-mint' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Music size={24} />
              <span className="text-[10px] font-medium">音乐</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-jieyou-mint' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <User size={24} />
              <span className="text-[10px] font-medium">我的</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
};
