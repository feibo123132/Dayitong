import { Calendar, Check, Clock3, Gift, MapPin, Menu, MessageSquareHeart, Music2, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useActivityStore, type ActivityTaskId } from '../store/useActivityStore';

type ActivityTask = {
  id: ActivityTaskId;
  title: string;
  description: string;
  points: number;
  badge: string;
  icon: typeof MapPin;
  iconColor: string;
  bgColor: string;
};

type ActivityReward = {
  id: string;
  title: string;
  description: string;
  threshold: number;
};

type FestivalTheme = {
  heroCardClass: string;
  subtitleBadgeClass: string;
  countdownClass: string;
  progressBarClass: string;
  scoreTagClass: string;
  actionButtonClass: string;
  rewardUnlockedCardClass: string;
  rewardUnlockedIconClass: string;
  rewardUnlockedTitleClass: string;
  rewardUnlockedStatusClass: string;
  menuActiveClass: string;
};

type FestivalTemplate = {
  id: string;
  menuLabel: string;
  title: string;
  subtitle: string;
  periodText: string;
  location: string;
  startAt: number;
  endAt: number;
  decoA: string;
  decoB: string;
  backgroundImage?: string;
  theme: FestivalTheme;
  tasks: ActivityTask[];
  rewards: ActivityReward[];
};

const FESTIVAL_TEMPLATES: FestivalTemplate[] = [
  {
    id: 'lantern-festival-2026',
    menuLabel: '元宵节',
    title: '元宵夜游活动季',
    subtitle: '节日限定任务中心',
    periodText: '2026.02.20 - 2026.03.20',
    location: '校园广场 · 线上同步',
    startAt: new Date('2026-02-20T00:00:00+08:00').getTime(),
    endAt: new Date('2026-03-20T23:59:59+08:00').getTime(),
    decoA: '',
    decoB: '',
    backgroundImage: 'images/festivals/lantern-festival-anime-bg.png',
    theme: {
      heroCardClass: 'border-rose-100 bg-gradient-to-br from-rose-100 via-amber-50 to-white',
      subtitleBadgeClass: 'bg-rose-500/10 text-rose-600',
      countdownClass: 'bg-rose-500/10 text-rose-600',
      progressBarClass: 'bg-gradient-to-r from-rose-400 to-amber-400',
      scoreTagClass: 'bg-amber-50 text-amber-600',
      actionButtonClass: 'bg-[#07c160] text-white hover:bg-[#06ad56]',
      rewardUnlockedCardClass: 'border-amber-200 bg-amber-50/60',
      rewardUnlockedIconClass: 'bg-amber-100 text-amber-600',
      rewardUnlockedTitleClass: 'text-amber-700',
      rewardUnlockedStatusClass: 'text-emerald-600',
      menuActiveClass: 'bg-rose-50 text-rose-600',
    },
    tasks: [
      {
        id: 'checkin',
        title: '现场签到互动',
        description: '到达活动现场并完成签到打卡，点亮你的第一盏花灯。',
        points: 20,
        badge: '花灯点亮',
        icon: MapPin,
        iconColor: 'text-rose-500',
        bgColor: 'bg-rose-50',
      },
      {
        id: 'guess-song',
        title: '听歌识曲挑战',
        description: '参与一次听歌识曲挑战，完成节日限定题组。',
        points: 20,
        badge: '节奏达人',
        icon: Music2,
        iconColor: 'text-cyan-500',
        bgColor: 'bg-cyan-50',
      },
      {
        id: 'festival-message',
        title: '节日留言祝福',
        description: '写下一句元宵祝福，解锁活动纪念留言卡。',
        points: 20,
        badge: '祝福传递',
        icon: MessageSquareHeart,
        iconColor: 'text-amber-500',
        bgColor: 'bg-amber-50',
      },
    ],
    rewards: [
      { id: 'r1', title: '花灯新星徽章', description: '完成 1 个任务解锁', threshold: 1 },
      { id: 'r2', title: '元宵猜谜能手称号', description: '完成 2 个任务解锁', threshold: 2 },
      { id: 'r3', title: '解忧夜游达人称号', description: '完成全部任务解锁', threshold: 3 },
    ],
  },
  {
    id: 'mid-autumn-2026',
    menuLabel: '中秋节',
    title: '中秋月夜活动季',
    subtitle: '月色限定任务中心',
    periodText: '2026.09.15 - 2026.10.08',
    location: '湖畔草坪 · 线上同步',
    startAt: new Date('2026-09-15T00:00:00+08:00').getTime(),
    endAt: new Date('2026-10-08T23:59:59+08:00').getTime(),
    decoA: '🌕',
    decoB: '🥮',
    theme: {
      heroCardClass: 'border-indigo-100 bg-gradient-to-br from-indigo-100 via-sky-50 to-white',
      subtitleBadgeClass: 'bg-indigo-500/10 text-indigo-600',
      countdownClass: 'bg-indigo-500/10 text-indigo-600',
      progressBarClass: 'bg-gradient-to-r from-indigo-500 to-sky-400',
      scoreTagClass: 'bg-sky-50 text-sky-700',
      actionButtonClass: 'bg-[#4f46e5] text-white hover:bg-[#4338ca]',
      rewardUnlockedCardClass: 'border-indigo-200 bg-indigo-50/70',
      rewardUnlockedIconClass: 'bg-indigo-100 text-indigo-600',
      rewardUnlockedTitleClass: 'text-indigo-700',
      rewardUnlockedStatusClass: 'text-indigo-600',
      menuActiveClass: 'bg-indigo-50 text-indigo-600',
    },
    tasks: [
      {
        id: 'checkin',
        title: '月下打卡互动',
        description: '在月夜灯景区完成签到，领取中秋夜游贴纸。',
        points: 20,
        badge: '月下打卡',
        icon: MapPin,
        iconColor: 'text-indigo-500',
        bgColor: 'bg-indigo-50',
      },
      {
        id: 'guess-song',
        title: '中秋听歌识曲',
        description: '完成一轮“明月与思念”主题听歌识曲挑战。',
        points: 20,
        badge: '月色旋律',
        icon: Music2,
        iconColor: 'text-sky-500',
        bgColor: 'bg-sky-50',
      },
      {
        id: 'festival-message',
        title: '月圆寄语留言',
        description: '写下一句团圆祝福，生成节日寄语卡片。',
        points: 20,
        badge: '团圆寄语',
        icon: MessageSquareHeart,
        iconColor: 'text-orange-500',
        bgColor: 'bg-orange-50',
      },
    ],
    rewards: [
      { id: 'r1', title: '望月徽章', description: '完成 1 个任务解锁', threshold: 1 },
      { id: 'r2', title: '团圆词作家称号', description: '完成 2 个任务解锁', threshold: 2 },
      { id: 'r3', title: '月下知音称号', description: '完成全部任务解锁', threshold: 3 },
    ],
  },
  {
    id: 'graduation-season-2026',
    menuLabel: '六月毕业季',
    title: '六月毕业季活动',
    subtitle: '青春纪念任务中心',
    periodText: '2026.06.01 - 2026.06.30',
    location: '毕业广场 · 线上同步',
    startAt: new Date('2026-06-01T00:00:00+08:00').getTime(),
    endAt: new Date('2026-06-30T23:59:59+08:00').getTime(),
    decoA: '🎓',
    decoB: '📸',
    theme: {
      heroCardClass: 'border-emerald-100 bg-gradient-to-br from-emerald-100 via-cyan-50 to-white',
      subtitleBadgeClass: 'bg-emerald-500/10 text-emerald-700',
      countdownClass: 'bg-emerald-500/10 text-emerald-700',
      progressBarClass: 'bg-gradient-to-r from-emerald-500 to-cyan-400',
      scoreTagClass: 'bg-emerald-50 text-emerald-700',
      actionButtonClass: 'bg-[#0ea5a4] text-white hover:bg-[#0b8f8e]',
      rewardUnlockedCardClass: 'border-emerald-200 bg-emerald-50/70',
      rewardUnlockedIconClass: 'bg-emerald-100 text-emerald-700',
      rewardUnlockedTitleClass: 'text-emerald-700',
      rewardUnlockedStatusClass: 'text-emerald-600',
      menuActiveClass: 'bg-emerald-50 text-emerald-700',
    },
    tasks: [
      {
        id: 'checkin',
        title: '毕业合影打卡',
        description: '到毕业主题区完成签到，领取青春纪念贴纸。',
        points: 20,
        badge: '青春打卡',
        icon: MapPin,
        iconColor: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
      },
      {
        id: 'guess-song',
        title: '青春歌单识曲',
        description: '参与毕业季歌单听歌识曲挑战，回顾校园旋律。',
        points: 20,
        badge: '青春旋律',
        icon: Music2,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
      },
      {
        id: 'festival-message',
        title: '毕业留言墙',
        description: '写下一句毕业寄语，点亮你的毕业留言卡。',
        points: 20,
        badge: '毕业寄语',
        icon: MessageSquareHeart,
        iconColor: 'text-violet-500',
        bgColor: 'bg-violet-50',
      },
    ],
    rewards: [
      { id: 'r1', title: '青春纪念徽章', description: '完成 1 个任务解锁', threshold: 1 },
      { id: 'r2', title: '校园旋律收藏家称号', description: '完成 2 个任务解锁', threshold: 2 },
      { id: 'r3', title: '毕业季解忧达人称号', description: '完成全部任务解锁', threshold: 3 },
    ],
  },
];

type ActivityStatus = 'upcoming' | 'active' | 'ended';

const getActivityStatus = (now: number, startAt: number, endAt: number): ActivityStatus => {
  if (now < startAt) return 'upcoming';
  if (now > endAt) return 'ended';
  return 'active';
};

const formatCountdown = (ms: number): string => {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}天 ${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const ActivityPage = () => {
  const user = useAuthStore((state) => state.user);
  const { completedTaskIds, loadProgress, resetProgress, completeTask, isLoading, error } = useActivityStore();
  const [now, setNow] = useState(() => Date.now());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFestivalId, setSelectedFestivalId] = useState(FESTIVAL_TEMPLATES[0].id);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const userUid = user?.uid ?? null;
  const festival = FESTIVAL_TEMPLATES.find((item) => item.id === selectedFestivalId) ?? FESTIVAL_TEMPLATES[0];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setIsMenuOpen(false);
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    if (!userUid) {
      resetProgress();
      return;
    }
    void loadProgress(userUid, festival.id);
  }, [festival.id, loadProgress, resetProgress, userUid]);

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
    : 'bg-slate-100 text-slate-500 border border-slate-200';
  const heroProgressLabelClass = hasBackgroundImage
    ? 'text-white/85 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]'
    : 'text-slate-500';
  const heroProgressValueClass = hasBackgroundImage
    ? 'text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.4)]'
    : 'text-slate-700';

  const countdownText = useMemo(() => {
    if (status === 'upcoming') {
      return `距开始 ${formatCountdown(festival.startAt - now)}`;
    }
    if (status === 'active') {
      return `距结束 ${formatCountdown(festival.endAt - now)}`;
    }
    return '活动已结束';
  }, [festival.endAt, festival.startAt, now, status]);

  const handleTaskClick = async (task: ActivityTask) => {
    if (status !== 'active') return;
    await completeTask(task.id, task.points);
  };

  const handleFestivalSwitch = (festivalId: string) => {
    setSelectedFestivalId(festivalId);
    setIsMenuOpen(false);
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24 pt-14">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="font-bold text-lg text-jieyou-text">当期活动</div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-jieyou-mint hover:bg-gray-100 transition-colors"
              aria-label="活动菜单"
            >
              <Menu size={20} />
            </button>

            {isMenuOpen ? (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-100 bg-white shadow-lg p-2 z-20">
                <p className="px-2 py-1 text-xs font-semibold text-slate-400">节日活动</p>
                {FESTIVAL_TEMPLATES.map((item) => {
                  const active = item.id === festival.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleFestivalSwitch(item.id)}
                      className={`w-full mt-1 px-2 py-2 rounded-lg text-left text-sm flex items-center justify-between transition-colors ${
                        active ? festival.theme.menuActiveClass : 'text-slate-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.menuLabel}</span>
                      {active ? <Check size={14} /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="px-4 pt-4">
        <div className={`relative overflow-hidden rounded-3xl p-5 shadow-sm ${festival.theme.heroCardClass}`}>
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
