import { Calendar, Check, ChevronDown, ChevronRight, Clock3, MapPin, Menu, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useActivityStore } from '../store/useActivityStore';
import { ACTIVITY_MENU_GROUPS, FESTIVAL_TEMPLATES, formatCountdown, getActivityStatus } from './activityData';

type FestivalCulture = {
  quote: string;
  source: string;
  summary: string;
  customs: string[];
  customsImageName: string;
  customsWarmMessage: string;
  cultureCardClass: string;
  customTagClass: string;
};

const FESTIVAL_CULTURE_MAP: Record<string, FestivalCulture> = {
  'lantern-festival-2026': {
    quote: '去年元夜时，花市灯如昼。',
    source: '欧阳修《生查子·元夕》',
    summary: '元宵重在灯火与团圆，夜游、灯会和互动民俗让节日更有温度。',
    customs: ['吃汤圆', '赏花灯', '猜灯谜', '舞龙舞狮'],
    customsImageName: 'lantern-customs-overview.png',
    customsWarmMessage: '一灯一景一团圆，愿你在烟火与笑声里，收获新一年的温暖与心安。',
    cultureCardClass: 'border-rose-100 bg-gradient-to-br from-rose-50 via-amber-50 to-white',
    customTagClass: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  'mid-autumn-2026': {
    quote: '但愿人长久，千里共婵娟。',
    source: '苏轼《水调歌头》',
    summary: '中秋讲究望月寄情，月光与思念交织出最柔软的团圆时刻。',
    customs: ['赏月', '吃月饼', '拜月祈福', '灯笼夜游'],
    customsImageName: 'mid-autumn-customs-overview.png',
    customsWarmMessage: '愿此刻月明人安，所念之人都在身边，所盼之事皆有回响。',
    cultureCardClass: 'border-indigo-100 bg-gradient-to-br from-indigo-50 via-sky-50 to-white',
    customTagClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  'graduation-season-2026': {
    quote: '海内存知己，天涯若比邻。',
    source: '王勃《送杜少府之任蜀州》',
    summary: '毕业季是纪念与告别，也是带着勇气奔向下一段旅程。',
    customs: ['毕业合影', '留言寄语', '师友送别', '纪念打卡'],
    customsImageName: 'graduation-customs-overview.png',
    customsWarmMessage: '把青春定格在笑容里，带着祝福继续出发，前路皆是好风景。',
    cultureCardClass: 'border-emerald-100 bg-gradient-to-br from-emerald-50 via-cyan-50 to-white',
    customTagClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  'spring-equinox-2026': {
    quote: '春分雨脚落声微，柳岸斜风带客归。',
    source: '唐·徐铉《七绝·苏醒》',
    summary: '春分昼夜平分，万物舒展，适合踏青、迎春和记录新的开始。',
    customs: ['竖蛋', '踏青', '放风筝', '吃春菜'],
    customsImageName: 'spring-equinox-customs-overview.png',
    customsWarmMessage: '愿你在春风里轻装上阵，把新的希望种进每一天。',
    cultureCardClass: 'border-emerald-100 bg-gradient-to-br from-emerald-50 via-lime-50 to-white',
    customTagClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
};

export const ActivityPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { completedTaskIds, loadProgress, resetProgress, isLoading, error } = useActivityStore();
  const [now, setNow] = useState(() => Date.now());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMenuGroupIds, setExpandedMenuGroupIds] = useState<string[]>([]);
  const [selectedFestivalId, setSelectedFestivalId] = useState(FESTIVAL_TEMPLATES[0].id);
  const [brokenCustomImageByFestival, setBrokenCustomImageByFestival] = useState<Record<string, boolean>>({});
  const menuRef = useRef<HTMLDivElement | null>(null);

  const festivalMap = useMemo(() => new Map(FESTIVAL_TEMPLATES.map((item) => [item.id, item])), []);
  const menuGroups = useMemo(() => {
    return ACTIVITY_MENU_GROUPS.map((group) => ({
      ...group,
      festivals: group.festivalIds
        .map((festivalId) => festivalMap.get(festivalId))
        .filter((item): item is (typeof FESTIVAL_TEMPLATES)[number] => Boolean(item)),
    })).filter((group) => group.festivals.length > 0);
  }, [festivalMap]);

  const userUid = user?.uid ?? null;
  const festival = FESTIVAL_TEMPLATES.find((item) => item.id === selectedFestivalId) ?? FESTIVAL_TEMPLATES[0];
  const festivalCulture = FESTIVAL_CULTURE_MAP[festival.id] ?? FESTIVAL_CULTURE_MAP['lantern-festival-2026'];

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
  const progressPercent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const hasBackgroundImage = Boolean(festival.backgroundImage);
  const isCustomImageBroken = Boolean(brokenCustomImageByFestival[festival.id]);

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

  const countdownText = useMemo(() => {
    if (status === 'upcoming') {
      return `距开始 ${formatCountdown(festival.startAt - now)}`;
    }
    if (status === 'active') {
      return `距结束 ${formatCountdown(festival.endAt - now)}`;
    }
    return '活动已结束';
  }, [festival.endAt, festival.startAt, now, status]);

  const customImageUrl = `${import.meta.env.BASE_URL}images/festival-customs/${festival.id}/${festivalCulture.customsImageName}`;

  const handleFestivalSwitch = (festivalId: string) => {
    setSelectedFestivalId(festivalId);
    setIsMenuOpen(false);
  };

  const handleMenuToggle = () => {
    if (!isMenuOpen) {
      setExpandedMenuGroupIds([]);
      setIsMenuOpen(true);
      return;
    }
    setIsMenuOpen(false);
  };

  const toggleMenuGroup = (groupId: string) => {
    setExpandedMenuGroupIds((current) => {
      if (current.includes(groupId)) {
        return current.filter((id) => id !== groupId);
      }
      return [...current, groupId];
    });
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24 pt-14">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="font-bold text-lg text-jieyou-text">当期活动</div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={handleMenuToggle}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-jieyou-mint hover:bg-gray-100 transition-colors"
              aria-label="活动菜单"
            >
              <Menu size={20} />
            </button>

            {isMenuOpen ? (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-lg z-20">
                <div className="space-y-1">
                  {menuGroups.map((group, groupIndex) => {
                    const isExpanded = expandedMenuGroupIds.includes(group.id);
                    return (
                      <div key={group.id} className={groupIndex > 0 ? 'border-t border-gray-100 pt-1' : ''}>
                        <button
                          type="button"
                          onClick={() => toggleMenuGroup(group.id)}
                          className="w-full rounded-lg px-2 py-2 text-left text-sm text-slate-800 hover:bg-gray-50 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium">{group.label}</span>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {isExpanded ? (
                          <div className="mt-1 pl-2 space-y-1">
                            {group.festivals.map((item) => {
                              const active = item.id === festival.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleFestivalSwitch(item.id)}
                                  className={`w-full px-2 py-2 rounded-lg text-left text-sm flex items-center justify-between transition-colors ${
                                    active ? item.theme.menuActiveClass : 'text-slate-700 hover:bg-gray-50'
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
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="px-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(`/activity/${festival.id}`)}
          className={`w-full text-left relative overflow-hidden rounded-3xl p-5 shadow-sm border cursor-pointer transition-transform active:scale-[0.99] ${festival.theme.heroCardClass}`}
          aria-label={`查看${festival.title}详情`}
        >
          {festival.backgroundImage ? (
            <>
              <img
                src={`${import.meta.env.BASE_URL}${festival.backgroundImage}`}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-black/15 to-black/5 pointer-events-none" />
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

            <p className={`mt-3 text-xs font-semibold ${heroMetaClass}`}>点击小卡片查看任务面板和活动奖励</p>
          </div>
        </button>
      </section>

      <section className="px-4 mt-4 space-y-3">
        <article className={`rounded-2xl border p-4 shadow-sm ${festivalCulture.cultureCardClass}`}>
          <div className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-700">
            <Sparkles size={12} className="mr-1" />
            节日文化
          </div>
          <p className="mt-3 text-[15px] font-semibold text-slate-800">“{festivalCulture.quote}”</p>
          <p className="mt-1 text-xs text-slate-500">{festivalCulture.source}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{festivalCulture.summary}</p>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
            <Sparkles size={12} className="mr-1" />
            节日习俗
          </div>

          <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1">
            {festivalCulture.customs.map((custom) => (
              <span key={custom} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${festivalCulture.customTagClass}`}>
                {custom}
              </span>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-gray-100 overflow-hidden">
            {isCustomImageBroken ? (
              <div className="min-h-[180px] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-sm text-slate-400">
                图片待补充：{festivalCulture.customsImageName}
              </div>
            ) : (
              <img
                src={customImageUrl}
                alt="节日习俗图"
                className="w-full h-auto max-h-[420px] object-contain bg-slate-50"
                onError={() => {
                  setBrokenCustomImageByFestival((prev) => ({ ...prev, [festival.id]: true }));
                }}
              />
            )}
            <div className="p-3 bg-white">
              <p className="text-sm leading-6 text-slate-600">{festivalCulture.customsWarmMessage}</p>
            </div>
          </div>
        </article>
      </section>

      {isLoading ? <p className="mt-4 text-center text-sm text-slate-400">活动进度加载中...</p> : null}
      {error ? <p className="mt-2 text-center text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

