import { ArrowLeft, CalendarCheck2, Gift } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BEGINNER_ITEMS = [
  {
    id: 'benefits',
    name: '入门福利',
    desc: '新手礼包等你来拿',
    icon: Gift,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    href: 'beginner-benefits.html'
  },
  {
    id: 'checkin',
    name: '练习打卡',
    desc: '记录每日练琴进度',
    icon: CalendarCheck2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  }
];

export const GuitarBeginnerPage = () => {
  const navigate = useNavigate();
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const beginnerHeroImageUrl = `${import.meta.env.BASE_URL}images/guitar-beginner/guitar-beginner-cover.png`;

  const handleItemClick = (id: string, href?: string) => {
    if (id === 'checkin') {
      setShowComingSoonModal(true);
      return;
    }

    if (!href) {
      return;
    }

    window.location.assign(`${import.meta.env.BASE_URL}${href}`);
  };

  return (
    <div className="min-h-screen bg-amber-50/40">
      <div className="relative h-48 w-full overflow-hidden rounded-b-[2rem] shadow-md">
        <img src={beginnerHeroImageUrl} alt="吉他免费入门背景图" className="absolute inset-0 h-full w-full object-cover" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow-md">吉他免费入门</h1>
          <p className="mt-2 text-sm text-white/90">欢迎友友们来尝鲜</p>
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
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id, item.href)}
              className={`flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm transition-all duration-300 ${
                item.href || item.id === 'checkin' ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : 'cursor-default'
              }`}
            >
              <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner ${item.bgColor} ${item.color}`}>
                <item.icon size={32} />
              </div>

              <h3 className="mb-1 font-bold text-gray-800">{item.name}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {showComingSoonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="text-base font-medium text-gray-800">该板块尚未开发，敬请期待……</p>
            <button
              type="button"
              onClick={() => setShowComingSoonModal(false)}
              className="mt-5 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
