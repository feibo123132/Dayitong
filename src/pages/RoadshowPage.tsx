import { ArrowLeft, Music, Settings, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROADSHOW_ITEMS = [
  {
    id: '1',
    name: '个人排行',
    desc: '查看你的听歌识曲成绩',
    icon: Music,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-50',
    path: '/guess-music',
  },
  {
    id: '2',
    name: '积分榜',
    desc: '查看全站路演积分排名',
    icon: Trophy,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    path: '/ranking',
  },
];

export const RoadshowPage = () => {
  const navigate = useNavigate();
  const bannerImageUrl = `${import.meta.env.BASE_URL}images/roadshow/location-select-banner.png`;

  return (
    <div className="min-h-screen bg-cyan-50/40">
      <div className="relative h-52 w-full overflow-hidden rounded-b-[2rem] shadow-md">
        <img src={bannerImageUrl} alt="路演背景图" className="absolute inset-0 h-full w-full object-cover" />

        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 z-20 rounded-full bg-white/15 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/25 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>

        <button className="absolute right-4 top-4 z-20 rounded-full bg-white/15 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/25 hover:text-white">
          <Settings size={24} />
        </button>

        {/* Banner Text Removed */}
      </div>

      <div className="relative z-10 mx-auto -mt-8 max-w-md px-4 pb-10">
        <div className="grid grid-cols-2 gap-3">
          {ROADSHOW_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="group rounded-2xl bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
            >
              <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner ${item.iconBg} ${item.iconColor}`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-800">{item.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
