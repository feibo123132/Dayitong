import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Heart,
  Menu,
  MessageCircleHeart,
  Music2,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Trophy,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGuessMusicStore } from '../store/useGuessMusicStore';
import { useProfileStore } from '../store/useProfileStore';
import { useRankingStore } from '../store/useRankingStore';
import { useSongRequestStore } from '../store/useSongRequestStore';

type ShortcutItem = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  path: string;
  iconColor: string;
  iconBg: string;
};

const FALLBACK_RECENT = [
  { id: 'f1', title: '手写的从前', subtitle: '校园点歌精选', likes: 66 },
  { id: 'f2', title: '晴天', subtitle: '今日热播', likes: 52 },
  { id: 'f3', title: '想去海边', subtitle: '晚风歌单', likes: 37 },
];

const FEATURED_PLAYLISTS = [
  { id: 'p1', title: '路演热歌', detail: '适合傍晚草坪表演' },
  { id: 'p2', title: '猜歌训练', detail: '常见旋律集中练习' },
  { id: 'p3', title: '治愈夜听', detail: '安静不抢戏的编排' },
];

export const MusicPage = () => {
  const navigate = useNavigate();
  const { name, avatarUrl, signature } = useProfileStore();
  const requests = useSongRequestStore((state) => state.requests);
  const guessUsers = useGuessMusicStore((state) => state.users);
  const rankingUsers = useRankingStore((state) => state.users);

  const totalLikes = requests.reduce((sum, item) => sum + item.likes, 0);
  const listenMinutes = 120 + requests.length * 9 + guessUsers.length * 4;
  const listeningDays = Math.max(1, Math.ceil(listenMinutes / 60 / 2));
  const recentSongs =
    requests.length > 0
      ? requests.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.songName,
          subtitle: item.artist || '校园音乐站',
          likes: item.likes,
        }))
      : FALLBACK_RECENT;
  const champion = rankingUsers[0];

  const shortcuts: ShortcutItem[] = [
    {
      id: 'like',
      label: '我喜欢',
      value: `${totalLikes}`,
      icon: Heart,
      path: '/song-request',
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-50',
    },
    {
      id: 'guess',
      label: '猜歌',
      value: `${guessUsers.length}人`,
      icon: Music2,
      path: '/guess-music-locations',
      iconColor: 'text-sky-500',
      iconBg: 'bg-sky-50',
    },
    {
      id: 'request',
      label: '点歌',
      value: `${requests.length}首`,
      icon: MessageCircleHeart,
      path: '/song-request',
      iconColor: 'text-violet-500',
      iconBg: 'bg-violet-50',
    },
    {
      id: 'ranking',
      label: '排行',
      value: champion ? `${champion.name}` : '查看',
      icon: Trophy,
      path: '/ranking',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50',
    },
    {
      id: 'activity',
      label: '活动',
      value: '进行中',
      icon: CalendarDays,
      path: '/activity',
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f3f6fb] pb-24">
      <section className="bg-gradient-to-b from-[#dbeeff] via-[#e6f3ff] to-[#f3f6fb] px-5 pt-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-end gap-5">
            <button className="text-2xl font-black text-slate-900">音乐</button>
            <button className="text-lg font-semibold text-slate-400">关注</button>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <button aria-label="搜索" className="p-1">
              <Search size={19} />
            </button>
            <button aria-label="通知" className="p-1">
              <Bell size={19} />
            </button>
            <button aria-label="菜单" className="p-1">
              <Menu size={19} />
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-3xl bg-white/85 p-4 shadow-[0_8px_20px_rgba(31,70,114,0.08)] backdrop-blur">
          <div className="flex items-center">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-200 to-blue-300 shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt="头像" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound size={30} className="text-white" />
                </div>
              )}
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="truncate text-lg font-bold text-slate-900">{name}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{signature}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">{listenMinutes}</p>
              <p className="text-xs text-slate-500">本周听歌分钟</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {shortcuts.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="cursor-pointer rounded-2xl bg-white p-2.5 text-center shadow-[0_4px_12px_rgba(15,23,42,0.05)] active:scale-95"
            >
              <span className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${item.iconBg}`}>
                <item.icon size={18} className={item.iconColor} />
              </span>
              <p className="mt-1 text-xs font-semibold text-slate-700">{item.label}</p>
              <p className="truncate text-[11px] text-slate-400">{item.value}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-2">
        <div className="rounded-3xl bg-white px-4 py-4 shadow-sm">
          <button
            onClick={() => navigate('/song-request')}
            className="mb-3 flex w-full cursor-pointer items-center justify-between text-left"
          >
            <h3 className="text-base font-bold text-slate-900">最近播放</h3>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
          <div className="space-y-3">
            {recentSongs.map((song) => (
              <button
                key={song.id}
                onClick={() => navigate('/song-request')}
                className="flex w-full cursor-pointer items-center rounded-2xl bg-slate-50 px-3 py-2.5 text-left"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#a9d6ff] to-[#d9f1ff]" />
                <div className="ml-3 min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{song.title}</p>
                  <p className="truncate text-xs text-slate-500">{song.subtitle}</p>
                </div>
                <p className="text-xs text-slate-400">♥ {song.likes}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pt-3">
        <div className="rounded-3xl bg-white px-4 py-4 shadow-sm">
          <button
            onClick={() => navigate('/music')}
            className="mb-3 flex w-full cursor-pointer items-center justify-between text-left"
          >
            <h3 className="text-base font-bold text-slate-900">歌单</h3>
            <span className="flex items-center gap-1 text-sm text-slate-400">
              {FEATURED_PLAYLISTS.length}
              <ChevronRight size={16} className="text-slate-300" />
            </span>
          </button>
          <div className="grid grid-cols-3 gap-2.5">
            {FEATURED_PLAYLISTS.map((playlist, index) => (
              <button
                key={playlist.id}
                onClick={() => navigate('/song-request')}
                className="cursor-pointer overflow-hidden rounded-2xl bg-slate-50 text-left active:scale-95"
              >
                <div className="h-20 bg-gradient-to-br from-[#b5ddff] to-[#dff4ff] px-2 py-2 text-right text-xs font-semibold text-white/90">
                  0{index + 1}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-semibold text-slate-800">{playlist.title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{playlist.detail}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pt-3">
        <div className="rounded-3xl bg-white px-4 py-4 shadow-sm">
          <button
            onClick={() => navigate('/guess-music-locations')}
            className="flex w-full cursor-pointer items-center justify-between text-left"
          >
            <h3 className="text-base font-bold text-slate-900">听歌统计</h3>
            <ChevronRight size={16} className="text-slate-300" />
          </button>

          <div className="mt-3 inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-500">
            <span className="rounded-lg px-3 py-1">日</span>
            <span className="rounded-lg bg-white px-3 py-1 text-slate-800 shadow-sm">周</span>
            <span className="rounded-lg px-3 py-1">月</span>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-black text-slate-900">
                {listenMinutes}
                <span className="ml-1 text-base font-semibold text-slate-500">分钟</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">超过 {listeningDays} 天的平均听歌时长</p>
            </div>
            <Clock3 size={32} className="text-[#96d5ff]" />
          </div>

          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-[#7ad3ff] to-[#70e0c0]" />
          </div>
        </div>
      </section>

      <section className="px-4 pt-3">
        <div className="rounded-3xl border border-[#f2e7da] bg-[#fff8ef] px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {recentSongs[0]?.title || '校园随机播放'}
              </p>
              <p className="truncate text-xs text-slate-500">{recentSongs[0]?.subtitle || 'JIEYOU FM'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-slate-400">
                <SkipBack size={16} />
              </button>
              <button className="rounded-full bg-slate-900 p-2 text-white">
                <Play size={16} fill="currentColor" />
              </button>
              <button className="p-1.5 text-slate-400">
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
