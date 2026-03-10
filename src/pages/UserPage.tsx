﻿﻿﻿﻿﻿import {
  ChevronRight,
  MessageSquareHeart,
  Music,
  Settings,
  Smile,
  SquareLibrary,
  Trophy,
  UserRound,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';

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
      id: 'original-music',
      label: '原创音乐盒',
      icon: Music,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-400',
      path: '/original-music-box',
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
      path: '/settings',
    },
  ],
];

export const UserPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { name, avatarUrl } = useProfileStore();
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24">
      <section className="bg-white px-5 py-6 border-b border-gray-100">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => avatarUrl && setIsAvatarPreviewOpen(true)}
            className="w-20 h-20 min-w-20 overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-teal-200 to-cyan-300 flex items-center justify-center shadow-sm cursor-pointer"
            aria-label="预览头像"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="头像" className="w-full h-full rounded-2xl object-cover object-center" />
            ) : (
              <UserRound size={34} className="text-white" />
            )}
          </button>
          <div className="ml-4 flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            <p className="text-sm text-gray-500 mt-1 truncate">{user?.email || `ID: ${user?.uid?.slice(0, 8) || 'Unknown'}`}</p>
          </div>
          <button
            onClick={() => navigate('/profile-info')}
            className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none"
            aria-label="个人资料"
          >
            →
          </button>
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

      <ImagePreviewModal
        open={isAvatarPreviewOpen}
        src={avatarUrl}
        alt={`${name} 的头像`}
        onClose={() => setIsAvatarPreviewOpen(false)}
      />
    </div>
  );
};
