import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CurrentActivity = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 2);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('活动进行中');
        return;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <button
      type="button"
      onClick={() => navigate('/activity/lantern-festival-2026')}
      className="w-full text-left relative overflow-hidden rounded-3xl p-5 shadow-sm border border-rose-100 bg-gradient-to-br from-rose-50 via-amber-50 to-white cursor-pointer group hover:shadow-md transition-all h-40"
    >
      <div className="absolute -top-2 right-3 text-2xl opacity-90">🏮</div>
      <div className="absolute top-8 right-12 text-lg opacity-75">🏮</div>

      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="inline-flex items-center rounded-full bg-rose-100 text-rose-600 text-[10px] font-semibold px-2 py-0.5 mb-1">
            <Sparkles size={10} className="mr-1" /> 元宵限定
          </div>
          <h3 className="text-base font-bold text-slate-800 group-hover:text-rose-600 transition-colors">元宵节路演特别场</h3>
          <div className="flex items-center text-[10px] text-slate-500 mt-0.5 space-x-2">
            <span className="flex items-center">
              <Calendar size={10} className="mr-1" /> 正月十五 晚 19:00
            </span>
            <span className="flex items-center">
              <MapPin size={10} className="mr-1" /> 校园广场
            </span>
          </div>
        </div>

        <div className="bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center">
          <Clock size={10} className="mr-1" />
          {timeLeft}
        </div>
      </div>

      <p className="text-xs text-slate-600 line-clamp-2 mb-2">猜灯谜、听路演、点心愿歌单。现场准备了元宵节小礼物，欢迎一起来过个热闹的夜晚。</p>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 border border-rose-100 text-rose-500">猜灯谜互动</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 border border-amber-100 text-amber-600">节日歌单</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 border border-pink-100 text-pink-500">限量小礼物</span>
      </div>
    </button>
  );
};
