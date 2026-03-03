import { ArrowLeft, Calendar, Clock3, Gift, MapPin, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useActivityStore } from '../store/useActivityStore';
import { FESTIVAL_TEMPLATES, formatCountdown, getActivityStatus, type ActivityTask } from './activityData';

export const ActivityDetailPage = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { completedTaskIds, loadProgress, resetProgress, completeTask, isLoading, error } = useActivityStore();
  const [now, setNow] = useState(() => Date.now());

  const userUid = user?.uid ?? null;
  const festival = FESTIVAL_TEMPLATES.find((item) => item.id === festivalId);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userUid || !festival?.id) {
      resetProgress();
      return;
    }
    void loadProgress(userUid, festival.id);
  }, [festival?.id, loadProgress, resetProgress, userUid]);

  if (!festival) {
    return (
      <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24 pt-14">
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md px-4 py-3 flex items-center border-b border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/activity')}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-gray-100 transition-colors"
              aria-label="返回活动页"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="ml-2 font-semibold text-slate-800">活动详情</div>
          </div>
        </header>

        <div className="px-4 pt-4 text-center text-sm text-slate-500">活动不存在或已下线</div>
      </div>
    );
  }

  const status = getActivityStatus(now, festival.startAt, festival.endAt);
  const doneCount = completedTaskIds.length;
  const totalCount = festival.tasks.length;
  const progressPercent = Math.round((doneCount / totalCount) * 100);
  const hasBackgroundImage = Boolean(festival.backgroundImage);
  const heroTitleClass = hasBackgroundImage
    ? 'text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.45)]'
    : 'text-slate-800';
  const heroMetaClass = hasBackgroundImage
    ? 'text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]'
    : 'text-slate-500';
  const heroSubtitleBadgeClass = hasBackgroundImage
    ? 'bg-black/20 text-white/90 border border-white/25 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]'
    : festival.theme.subtitleBadgeClass;
  const heroProgressLabelClass = hasBackgroundImage
    ? 'text-white/85 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]'
    : 'text-slate-500';
  const heroProgressValueClass = hasBackgroundImage
    ? 'text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.4)]'
    : 'text-slate-700';

  const countdownText = (() => {
    if (status === 'upcoming') {
      return `距开始 ${formatCountdown(festival.startAt - now)}`;
    }
    if (status === 'active') {
      return `距结束 ${formatCountdown(festival.endAt - now)}`;
    }
    return '活动已结束';
  })();

  const handleTaskClick = async (task: ActivityTask) => {
    if (status !== 'active') return;
    await completeTask(task.id, task.points);
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24 pt-14">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md px-4 py-3 flex items-center border-b border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/activity')}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-gray-100 transition-colors"
            aria-label="返回活动页"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="ml-2 font-semibold text-slate-800">{festival.title}</div>
        </div>
      </header>

      <section className="px-4 pt-4">
        <div className={`relative overflow-hidden rounded-3xl p-5 shadow-sm border ${festival.theme.heroCardClass}`}>
          {festival.backgroundImage ? (
            <>
              <img
                src={`${import.meta.env.BASE_URL}${festival.backgroundImage}`}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/35 to-black/15 pointer-events-none" />
            </>
          ) : null}

          <div className="absolute -top-2 right-3 text-2xl opacity-80 z-10">{festival.decoA}</div>
          <div className="absolute top-8 right-12 text-lg opacity-70 z-10">{festival.decoB}</div>

          <div className="relative z-20">
            <div className={`inline-flex items-center rounded-full text-[11px] font-semibold px-2 py-1 mb-2 ${heroSubtitleBadgeClass}`}>
              <Sparkles size={12} className="mr-1" /> {festival.subtitle}
            </div>

            <h1 className={`text-xl font-bold ${heroTitleClass}`}>{festival.title}</h1>

            <div className={`mt-2 space-y-1 text-xs ${heroMetaClass}`}>
              <div className="flex items-center">
                <Calendar size={12} className="mr-1" /> {festival.periodText}
              </div>
              <div className="flex items-center">
                <MapPin size={12} className="mr-1" /> {festival.location}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <div className={`text-xs ${heroProgressLabelClass}`}>任务进度</div>
                <div className={`text-sm font-semibold ${heroProgressValueClass}`}>
                  已完成 {doneCount}/{totalCount} · {progressPercent}%
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${festival.theme.countdownClass} ${heroMetaClass}`}>
                <Clock3 size={12} className="mr-1" /> {countdownText}
              </div>
            </div>

            <div className="mt-2 h-2 rounded-full bg-white/80 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${festival.theme.progressBarClass}`} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 mt-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-[17px] font-semibold text-slate-800">任务面板</h2>
          <span className="text-xs text-slate-400">活动期内每项仅可完成一次</span>
        </div>

        <div className="space-y-3">
          {festival.tasks.map((task) => {
            const Icon = task.icon;
            const isDone = completedTaskIds.includes(task.id);
            const disabled = status !== 'active' || isDone;

            return (
              <div key={task.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className={`w-10 h-10 rounded-xl ${task.bgColor} flex items-center justify-center`}>
                    <Icon size={18} className={task.iconColor} />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[17px] font-semibold text-slate-800 truncate">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${festival.theme.scoreTagClass}`}>
                        +{task.points} 分
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                    <p className="text-xs text-slate-400 mt-2">解锁标记：{task.badge}</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => void handleTaskClick(task)}
                  className={`mt-3 w-full h-10 rounded-xl text-sm font-semibold transition-colors ${
                    isDone
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : status === 'active'
                        ? festival.theme.actionButtonClass
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isDone ? '已完成' : status === 'upcoming' ? '未开始' : status === 'ended' ? '已结束' : '立即完成'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 mt-4">
        <h2 className="text-[17px] font-semibold text-slate-800 mb-2 px-1">活动奖励</h2>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm">
          {festival.rewards.map((reward) => {
            const unlocked = doneCount >= reward.threshold;
            return (
              <div
                key={reward.id}
                className={`rounded-xl border px-3 py-3 flex items-center gap-3 ${
                  unlocked ? festival.theme.rewardUnlockedCardClass : 'border-gray-100 bg-gray-50/60'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    unlocked ? festival.theme.rewardUnlockedIconClass : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Gift size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-semibold ${unlocked ? festival.theme.rewardUnlockedTitleClass : 'text-slate-500'}`}>
                    {reward.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{reward.description}</div>
                </div>
                <span className={`text-xs font-semibold ${unlocked ? festival.theme.rewardUnlockedStatusClass : 'text-slate-400'}`}>
                  {unlocked ? '已解锁' : '待解锁'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {isLoading ? <p className="mt-4 text-center text-sm text-slate-400">活动进度加载中...</p> : null}
      {error ? <p className="mt-2 text-center text-sm text-red-500">{error}</p> : null}
      <p className="mt-4 text-center text-xs text-slate-400">活动编号：{festival.id}</p>
    </div>
  );
};
