import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CURRENT_ACTIVITY_FESTIVAL_ID,
  FESTIVAL_TEMPLATES,
  formatCountdown,
  getActivityStatus,
} from '../pages/activityData';

export const CurrentActivity = () => {
  const navigate = useNavigate();
  const festival =
    FESTIVAL_TEMPLATES.find((item) => item.id === CURRENT_ACTIVITY_FESTIVAL_ID) ?? FESTIVAL_TEMPLATES[0];
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const status = getActivityStatus(now, festival.startAt, festival.endAt);
      if (status === 'ended') {
        setTimeLeft('活动已结束');
        return;
      }
      if (status === 'active') {
        setTimeLeft(`距结束 ${formatCountdown(festival.endAt - now)}`);
        return;
      }
      setTimeLeft(`距开始 ${formatCountdown(festival.startAt - now)}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [festival.endAt, festival.startAt]);

  return (
    <button
      type="button"
      onClick={() => navigate(`/activity/${festival.id}`)}
      className={`w-full text-left relative overflow-hidden rounded-3xl p-5 shadow-sm border cursor-pointer group hover:shadow-md transition-all h-40 ${festival.theme.heroCardClass}`}
    >
      {festival.backgroundImage ? (
        <>
          <img
            src={`${import.meta.env.BASE_URL}${festival.backgroundImage}`}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent" />
        </>
      ) : null}

      <div className="absolute -top-1 right-24 text-sm opacity-60 z-10">{festival.decoA}</div>
      <div className="absolute top-12 right-4 text-lg opacity-50 z-10">{festival.decoB}</div>

      <div className="relative z-20 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-1">
          <div>
            <div className={`inline-flex items-center rounded-full text-[10px] font-semibold px-2 py-0.5 mb-1 ${festival.theme.subtitleBadgeClass}`}>
              <Sparkles size={10} className="mr-1" /> {festival.subtitle}
            </div>
            <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{festival.title}</h3>
            <div className="flex items-center text-[10px] text-slate-500 mt-0.5 space-x-2">
              <span className="flex items-center">
                <Calendar size={10} className="mr-1" /> {festival.periodText}
              </span>
              <span className="flex items-center">
                <MapPin size={10} className="mr-1" /> {festival.location}
              </span>
            </div>
          </div>

          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center ${festival.theme.countdownClass}`}>
            <Clock size={10} className="mr-1" />
            {timeLeft}
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-1 mb-2">已完成 0/3 · 0%</p>
        
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden mb-2">
          <div className={`h-full w-0 ${festival.theme.progressBarClass}`}></div>
        </div>

        <p className="text-[10px] text-slate-500 mb-2">点击小卡片查看任务面板和活动奖励</p>

        <div className="flex flex-wrap gap-1.5">
          {festival.tasks.map((task) => (
            <span
              key={task.id}
              className={`text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 border ${task.bgColor} ${task.iconColor}`}
            >
              {task.title}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};
