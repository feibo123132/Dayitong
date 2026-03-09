import { ArrowLeft, CalendarCheck2, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BEGINNER_ITEMS = [
  {
    id: 'benefits',
    name: '入门福利',
    desc: '新手礼包等你来拿',
    icon: Gift,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'checkin',
    name: '练习打卡',
    desc: '记录每日练琴进度',
    icon: CalendarCheck2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
];

export const GuitarBeginnerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-amber-50/40">
      <div className="relative h-48 w-full overflow-hidden rounded-b-[2rem] bg-gradient-to-r from-amber-500 to-orange-500 shadow-md">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-35"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-transparent"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow-md">吉他免费入门</h1>
          <p className="mt-2 text-sm text-white/90">零基础也能开始弹唱</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-full bg-black/10 p-2 text-white/90 backdrop-blur-sm transition-colors hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-md px-4 pb-10">
        <div className="grid grid-cols-2 gap-4">
          {BEGINNER_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner ${item.bgColor} ${item.color}`}>
                <item.icon size={32} />
              </div>

              <h3 className="mb-1 font-bold text-gray-800">{item.name}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

