import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CurrentActivity = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    // 设置春分活动的倒计时 (2026-03-20)
    const targetDate = new Date('2026-03-20T00:00:00+08:00');

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('活动进行中');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `距开始 ${days}天 ${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <button
      type="button"
      onClick={() => navigate('/activity/spring-equinox-2026')}
      className="w-full text-left relative overflow-hidden rounded-3xl p-5 shadow-sm border border-emerald-100 bg-gradient-to-br from-emerald-50 via-lime-50 to-white cursor-pointer group hover:shadow-md transition-all h-40"
    >
      <img
        src={`${import.meta.env.BASE_URL}images/festivals/spring-equinox-2026-bg.png`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      
      <div className="absolute -top-1 right-24 text-sm opacity-60 z-10">🕊️</div>
      <div className="absolute top-12 right-4 text-lg opacity-50 z-10">🍃</div>

      <div className="relative z-20 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-1">
          <div>
            <div className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 mb-1">
              <Sparkles size={10} className="mr-1" /> 二十四节气任务中心
            </div>
            <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">春分踏青活动季</h3>
            <div className="flex items-center text-[10px] text-slate-500 mt-0.5 space-x-2">
              <span className="flex items-center">
                <Calendar size={10} className="mr-1" /> 2026.03.20 - 2026.04.20
              </span>
              <span className="flex items-center">
                <MapPin size={10} className="mr-1" /> 校园草地 · 线上同步
              </span>
            </div>
          </div>

          <div className="bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center">
            <Clock size={10} className="mr-1" />
            {timeLeft}
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-1 mb-2">已完成 0/3 · 0%</p>
        
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 w-0"></div>
        </div>

        <p className="text-[10px] text-slate-500 mb-2">点击小卡片查看任务面板和活动奖励</p>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 border border-emerald-100 text-emerald-600">春分签到互动</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 border border-lime-100 text-lime-600">节日歌单</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 border border-teal-100 text-teal-600">限量小礼物</span>
        </div>
      </div>
    </button>
  );
};
