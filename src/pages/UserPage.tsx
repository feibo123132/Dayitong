import { ChevronRight, CircleEllipsis, Heart, MessageSquareHeart, Music2, Settings, Smile, SquareLibrary, Trophy, UserRound } from 'lucide-react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSongRequestStore } from '../store/useSongRequestStore';

type MenuItem = {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
  path?: string;
  extra?: string;
};

const MENU_GROUPS: MenuItem[][] = [
  [
    {
      id: 'service',
      label: '服务',
      icon: CircleEllipsis,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
      path: '/roadshow',
    },
  ],
  [
    {
      id: 'points',
      label: '我的积分',
      icon: Trophy,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      path: '/ranking',
    },
    {
      id: 'requests',
      label: '点歌情况',
      icon: MessageSquareHeart,
      iconBg: 'bg-pink-50',
      iconColor: 'text-pink-500',
      path: '/song-request',
    },
    {
      id: 'guess',
      label: '听歌识曲',
      icon: Smile,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-500',
      path: '/guess-music-locations',
    },
  ],
  [
    {
      id: 'favorites',
      label: '收藏',
      icon: Heart,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-400',
      extra: '敬请期待',
    },
    {
      id: 'station',
      label: '音乐站',
      icon: Music2,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      path: '/music',
    },
    {
      id: 'apps',
      label: '应用广场',
      icon: SquareLibrary,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      path: '/app-store',
    },
  ],
  [
    {
      id: 'settings',
      label: '设置',
      icon: Settings,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-500',
      extra: '开发中',
    },
  ],
];

export const UserPage = () => {
  const navigate = useNavigate();
  const requestCount = useSongRequestStore((state) => state.requests.length);

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24">
      <section className="bg-white px-5 py-6 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-200 to-cyan-300 flex items-center justify-center shadow-sm">
            <UserRound size={30} className="text-white" />
          </div>
          <div className="flex-1 ml-4 min-w-0">
            <h2 className="text-2xl font-semibold text-slate-800 leading-tight">JIEYOU 用户</h2>
            <p className="text-slate-500 mt-1 truncate">邮箱号：hello@jieyou.cn</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">
                😊 Emoji
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-50 text-pink-600">
                点歌 {requestCount} 条
              </span>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300" />
        </div>
      </section>

      <div className="mt-3 space-y-3">
        {MENU_GROUPS.map((group, groupIndex) => (
          <section key={groupIndex} className="bg-white border-y border-gray-100">
            {group.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === group.length - 1;
              return (
                <button
                  key={item.id}
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full flex items-center px-5 py-4 text-left transition-colors ${
                    item.path ? 'hover:bg-gray-50 active:bg-gray-100' : 'cursor-default'
                  } ${!isLast ? 'border-b border-gray-100' : ''}`}
                >
                  <span className={`w-7 h-7 rounded-md ${item.iconBg} flex items-center justify-center mr-3`}>
                    <Icon size={16} className={item.iconColor} />
                  </span>
                  <span className="text-[17px] text-slate-800">{item.label}</span>
                  <span className="ml-auto flex items-center gap-1">
                    {item.extra && <span className="text-sm text-slate-400">{item.extra}</span>}
                    <ChevronRight size={18} className="text-slate-300" />
                  </span>
                </button>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
};
