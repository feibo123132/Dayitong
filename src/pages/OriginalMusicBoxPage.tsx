import { ArrowLeft, Menu, Play, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type SongItem = {
  id: string;
  title: string;
  duration: string;
  intro: string;
  style: string;
  coverClassName: string;
};

const SONG_LIST: SongItem[] = [
  {
    id: 'song-1',
    title: '晚风写信',
    duration: '03:42',
    intro: '给深夜留一盏温柔小灯，和你慢慢把心事说完。',
    style: '治愈民谣',
    coverClassName: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'song-2',
    title: '海边的答案',
    duration: '04:06',
    intro: '当潮声退去，答案会在脚印之间悄悄出现。',
    style: '清新流行',
    coverClassName: 'from-cyan-400 to-sky-500',
  },
  {
    id: 'song-3',
    title: '银河慢跑',
    duration: '03:18',
    intro: '把焦虑折成纸飞机，交给今晚的星空保管。',
    style: '电子独立',
    coverClassName: 'from-violet-400 to-indigo-500',
  },
  {
    id: 'song-4',
    title: '雨停之后',
    duration: '04:23',
    intro: '雨停后的街道有新的呼吸，也有新的勇气。',
    style: '城市抒情',
    coverClassName: 'from-slate-400 to-blue-500',
  },
  {
    id: 'song-5',
    title: '把春天带回家',
    duration: '03:51',
    intro: '愿每一次出发，都能带着轻快与明亮回来。',
    style: '暖调摇滚',
    coverClassName: 'from-orange-400 to-rose-500',
  },
];

export const OriginalMusicBoxPage = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  const handlePlay = (songId: string) => {
    setPlayingSongId((current) => (current === songId ? null : songId));
  };

  return (
    <div className="min-h-screen bg-slate-50 -mx-4 -mt-4">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="返回"
          >
            <ArrowLeft size={22} className="mx-auto" />
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-slate-900">原创音乐盒</h1>

          <button
            type="button"
            onClick={() => setShowMenu((value) => !value)}
            className="h-10 w-10 rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="菜单"
          >
            <Menu size={22} className="mx-auto" />
          </button>

          {showMenu && (
            <>
              <button
                type="button"
                aria-label="关闭菜单"
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
                <div className="px-4 py-2 text-xs text-slate-400">功能菜单</div>
                <button type="button" className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                  按风格筛选
                </button>
                <button type="button" className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                  最新发布
                </button>
                <button type="button" className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50" onClick={() => setShowMenu(false)}>
                  <span className="inline-flex items-center gap-1">
                    <X size={14} />
                    关闭菜单
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="space-y-3">
          {SONG_LIST.map((song) => (
            <article key={song.id} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`h-16 w-16 flex-shrink-0 rounded-xl bg-gradient-to-br ${song.coverClassName} text-white shadow-inner flex items-center justify-center font-bold`}
                >
                  乐
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate text-base font-semibold text-slate-900">{song.title}</h2>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{song.duration}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{song.intro}</p>
                  <span className="mt-2 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-600">{song.style}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlay(song.id)}
                  className={`h-11 w-11 flex-shrink-0 rounded-full transition-all ${
                    playingSongId === song.id
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label={`播放 ${song.title}`}
                >
                  <Play size={18} className="mx-auto" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};
