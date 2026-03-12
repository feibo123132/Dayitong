import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Clock3, Gift, MapPin, Sparkles } from 'lucide-react';
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
  const [isTaskPanelCollapsed, setIsTaskPanelCollapsed] = useState(true);
  const [isRewardsCollapsed, setIsRewardsCollapsed] = useState(true);

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
          <div className="mx-auto flex max-w-md items-center border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={() => navigate('/activity')}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-gray-100"
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
    ? 'border border-white/25 bg-black/20 text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]'
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

  const handleTaskAction = async (task: ActivityTask) => {
    if (task.id === 'checkin') {
      navigate(`/activity/${festival.id}/checkin`);
      return;
    }
    await handleTaskClick(task);
  };

  const getTaskActionText = (task: ActivityTask, isDone: boolean) => {
    if (task.id === 'checkin') return isDone ? '已签到' : '进入互动';
    if (isDone) return '已完成';
    if (status === 'upcoming') return '未开始';
    if (status === 'ended') return '已结束';
    return '立即完成';
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24 pt-14">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex max-w-md items-center border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md">
          <button
            type="button"
            onClick={() => navigate('/activity')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-gray-100"
            aria-label="返回活动页"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="ml-2 font-semibold text-slate-800">{festival.title}</div>
        </div>
      </header>

      <section className="px-4 pt-4">
        <div className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm ${festival.theme.heroCardClass}`}>
          {festival.backgroundImage ? (
            <>
              <img
                src={`${import.meta.env.BASE_URL}${festival.backgroundImage}`}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-black/15 to-black/5" />
            </>
          ) : null}

          <div className="absolute -top-2 right-3 z-10 text-2xl opacity-80">{festival.decoA}</div>
          <div className="absolute right-12 top-8 z-10 text-lg opacity-70">{festival.decoB}</div>

          <div className="relative z-20">
            <div className={`mb-2 inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${heroSubtitleBadgeClass}`}>
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
              <div className={`flex items-center rounded-full px-3 py-1 text-xs font-bold ${festival.theme.countdownClass} ${heroMetaClass}`}>
                <Clock3 size={12} className="mr-1" /> {countdownText}
              </div>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
              <div className={`h-full rounded-full transition-all ${festival.theme.progressBarClass}`} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-3 px-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-[17px] font-semibold text-slate-800">任务面板</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">活动期内每项仅可完成一次</span>
            <button
              type="button"
              onClick={() => setIsTaskPanelCollapsed((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              aria-expanded={!isTaskPanelCollapsed}
            >
              {isTaskPanelCollapsed ? '展开' : '折叠'}
              {isTaskPanelCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {festival.tasks.map((task) => {
            const Icon = task.icon;
            const isDone = completedTaskIds.includes(task.id);
            const isCheckinTask = task.id === 'checkin';
            const disabled = isCheckinTask ? false : status !== 'active' || isDone;
            const actionText = getTaskActionText(task, isDone);
            const actionButtonClass = isDone
              ? 'border border-emerald-100 bg-emerald-50 text-emerald-600 cursor-pointer'
              : isCheckinTask
                ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                : status === 'active'
                  ? `${festival.theme.actionButtonClass} cursor-pointer`
                  : 'cursor-not-allowed bg-gray-100 text-gray-400';

            return (
              <div
                key={task.id}
                className={`rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ${
                  isTaskPanelCollapsed ? 'p-3' : 'p-4'
                } ${isCheckinTask ? 'cursor-pointer hover:border-slate-300' : ''}`}
                onClick={isCheckinTask ? () => navigate(`/activity/${festival.id}/checkin`) : undefined}
                onKeyDown={
                  isCheckinTask
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/activity/${festival.id}/checkin`);
                        }
                      }
                    : undefined
                }
                role={isCheckinTask ? 'button' : undefined}
                tabIndex={isCheckinTask ? 0 : undefined}
              >
                <div className={`flex gap-3 ${isTaskPanelCollapsed ? 'items-center' : 'items-start'}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${task.bgColor}`}>
                    <Icon size={18} className={task.iconColor} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-[17px] font-semibold text-slate-800">{task.title}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${festival.theme.scoreTagClass}`}>
                        +{task.points} 分
                      </span>
                    </div>

                    {!isTaskPanelCollapsed ? (
                      <>
                        <p className="mt-1 text-sm text-slate-500">{task.description}</p>
                        <p className="mt-2 text-xs text-slate-400">解锁标记：{task.badge}</p>
                      </>
                    ) : (
                      <p className="mt-1 truncate text-xs text-slate-400">解锁标记：{task.badge}</p>
                    )}
                  </div>

                  {isTaskPanelCollapsed ? (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => void handleTaskAction(task)}
                      className={`h-8 shrink-0 rounded-lg px-3 text-xs font-semibold transition-colors ${actionButtonClass}`}
                    >
                      {actionText}
                    </button>
                  ) : null}
                </div>

                {!isTaskPanelCollapsed ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => void handleTaskAction(task)}
                    className={`mt-3 h-10 w-full rounded-xl text-sm font-semibold transition-colors ${actionButtonClass}`}
                  >
                    {actionText}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4 px-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-[17px] font-semibold text-slate-800">活动奖励</h2>
          <button
            type="button"
            onClick={() => setIsRewardsCollapsed((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            aria-expanded={!isRewardsCollapsed}
          >
            {isRewardsCollapsed ? '展开' : '折叠'}
            {isRewardsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          {festival.rewards.map((reward) => {
            const unlocked = doneCount >= reward.threshold;
            return (
              <div
                key={reward.id}
                className={`flex items-center gap-3 rounded-xl border px-3 transition-all duration-300 ${
                  isRewardsCollapsed ? 'py-2' : 'py-3'
                } ${unlocked ? festival.theme.rewardUnlockedCardClass : 'border-gray-100 bg-gray-50/60'}`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    unlocked ? festival.theme.rewardUnlockedIconClass : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Gift size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-semibold ${unlocked ? festival.theme.rewardUnlockedTitleClass : 'text-slate-500'}`}>
                    {reward.title}
                  </div>
                  {!isRewardsCollapsed ? <div className="mt-0.5 text-xs text-slate-400">{reward.description}</div> : null}
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
