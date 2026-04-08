import { MapPin, MessageSquareHeart, Music2, type LucideIcon } from 'lucide-react';
import type { ActivityTaskId } from '../store/useActivityStore';

export type ActivityTask = {
  id: ActivityTaskId;
  title: string;
  description: string;
  points: number;
  badge: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
};

export type ActivityReward = {
  id: string;
  title: string;
  description: string;
  threshold: number;
};

export type FestivalTheme = {
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

export type FestivalTemplate = {
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

export type ActivityMenuGroup = {
  id: string;
  label: string;
  festivalIds: string[];
};

export type FestivalCulture = {
  quote: string;
  source: string;
  summary: string;
  customs: string[];
  customsImageName: string;
  customsWarmMessage: string;
  cultureCardClass: string;
  customTagClass: string;
};

export const CURRENT_ACTIVITY_FESTIVAL_ID = 'guangxi-sanyuesan-2026';

const SPRING_GREEN_THEME: FestivalTheme = {
  heroCardClass: 'border-emerald-100 bg-gradient-to-br from-emerald-100 via-lime-50 to-white',
  subtitleBadgeClass: 'bg-emerald-500/10 text-emerald-700',
  countdownClass: 'bg-emerald-500/10 text-emerald-700',
  progressBarClass: 'bg-gradient-to-r from-emerald-500 to-lime-400',
  scoreTagClass: 'bg-emerald-50 text-emerald-700',
  actionButtonClass: 'bg-[#16a34a] text-white hover:bg-[#15803d]',
  rewardUnlockedCardClass: 'border-emerald-200 bg-emerald-50/70',
  rewardUnlockedIconClass: 'bg-emerald-100 text-emerald-700',
  rewardUnlockedTitleClass: 'text-emerald-700',
  rewardUnlockedStatusClass: 'text-emerald-600',
  menuActiveClass: 'bg-emerald-50 text-emerald-700',
};

const SPRING_GREEN_TASK_ACCENTS: Record<ActivityTaskId, Pick<ActivityTask, 'iconColor' | 'bgColor'>> = {
  checkin: {
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  'guess-song': {
    iconColor: 'text-lime-600',
    bgColor: 'bg-lime-50',
  },
  'festival-message': {
    iconColor: 'text-teal-500',
    bgColor: 'bg-teal-50',
  },
};

const SPRING_GREEN_CULTURE_STYLES = {
  cultureCardClass: 'border-emerald-100 bg-gradient-to-br from-emerald-50 via-lime-50 to-white',
  customTagClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export const FESTIVAL_TEMPLATES: FestivalTemplate[] = [
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
    id: 'spring-equinox-2026',
    menuLabel: '春分',
    title: '春分踏青活动季',
    subtitle: '二十四节气任务中心',
    periodText: '03.20 - 03.26',
    location: '校园草地',
    startAt: new Date('2026-03-20T00:00:00+08:00').getTime(),
    endAt: new Date('2026-03-26T23:59:59+08:00').getTime(),
    decoA: '',
    decoB: '',
    backgroundImage: 'images/festivals/spring-equinox-2026-bg.png',
    theme: SPRING_GREEN_THEME,
    tasks: [
      {
        id: 'checkin',
        title: '春分签到互动',
        description: '到达春分活动区完成签到打卡，点亮你的节气纪念章。',
        points: 20,
        badge: '节气打卡',
        icon: MapPin,
        ...SPRING_GREEN_TASK_ACCENTS.checkin,
      },
      {
        id: 'guess-song',
        title: '春日听歌识曲',
        description: '参与一轮春日主题听歌识曲挑战，解锁节气旋律。',
        points: 20,
        badge: '春日旋律',
        icon: Music2,
        ...SPRING_GREEN_TASK_ACCENTS['guess-song'],
      },
      {
        id: 'festival-message',
        title: '春分寄语留言',
        description: '写下一句春日祝福，生成你的节气纪念卡片。',
        points: 20,
        badge: '春日寄语',
        icon: MessageSquareHeart,
        ...SPRING_GREEN_TASK_ACCENTS['festival-message'],
      },
    ],
    rewards: [
      { id: 'r1', title: '春分新芽徽章', description: '完成 1 个任务解锁', threshold: 1 },
      { id: 'r2', title: '节气知音称号', description: '完成 2 个任务解锁', threshold: 2 },
      { id: 'r3', title: '春日解忧达人称号', description: '完成全部任务解锁', threshold: 3 },
    ],
  },
  {
    id: 'guangxi-sanyuesan-2026',
    menuLabel: '三月三',
    title: '广西三月三歌圩活动季',
    subtitle: '山歌民俗任务中心',
    periodText: '2026.04.17 - 2026.04.20',
    location: '歌圩舞台 · 线上同步',
    startAt: new Date('2026-04-17T00:00:00+08:00').getTime(),
    endAt: new Date('2026-04-20T23:59:59+08:00').getTime(),
    decoA: '🎵',
    decoB: '🪡',
    backgroundImage: 'images/festivals/guangxi-sanyuesan-2026-bg.png',
    theme: SPRING_GREEN_THEME,
    tasks: [
      {
        id: 'checkin',
        title: '歌圩打卡签到',
        description: '到达三月三歌圩互动区完成签到，领取壮锦绣球纪念贴纸。',
        points: 20,
        badge: '歌圩打卡',
        icon: MapPin,
        ...SPRING_GREEN_TASK_ACCENTS.checkin,
      },
      {
        id: 'guess-song',
        title: '山歌听歌识曲',
        description: '参与一轮广西山歌主题听歌识曲挑战，解锁节庆旋律。',
        points: 20,
        badge: '山歌知音',
        icon: Music2,
        ...SPRING_GREEN_TASK_ACCENTS['guess-song'],
      },
      {
        id: 'festival-message',
        title: '三月三对歌寄语',
        description: '写下一句三月三祝福或对歌词，点亮你的节庆留言卡。',
        points: 20,
        badge: '对歌寄语',
        icon: MessageSquareHeart,
        ...SPRING_GREEN_TASK_ACCENTS['festival-message'],
      },
    ],
    rewards: [
      { id: 'r1', title: '歌圩新声徽章', description: '完成 1 个任务解锁', threshold: 1 },
      { id: 'r2', title: '山歌知音称号', description: '完成 2 个任务解锁', threshold: 2 },
      { id: 'r3', title: '八桂欢歌达人称号', description: '完成全部任务解锁', threshold: 3 },
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

export const FESTIVAL_CULTURES: Record<string, FestivalCulture> = {
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
  'spring-equinox-2026': {
    quote: '春分雨脚落声微，柳岸斜风带客归。',
    source: '唐·徐铉《七绝·苏醒》',
    summary: '春分昼夜平分，万物舒展，适合踏青、迎春和记录新的开始。',
    customs: ['竖蛋', '踏青', '放风筝', '吃春菜'],
    customsImageName: 'spring-equinox-customs-overview.png',
    customsWarmMessage: '愿你在春风里轻装上阵，把新的希望种进每一天。',
    ...SPRING_GREEN_CULTURE_STYLES,
  },
  'guangxi-sanyuesan-2026': {
    quote: '山歌唱开春光里，绣球抛向好时节。',
    source: '广西三月三民歌意象',
    summary: '广西三月三把山歌、壮锦、绣球和团聚宴席连在一起，是热闹又鲜活的民族节庆。',
    customs: ['对山歌', '抛绣球', '五色糯米饭', '竹竿舞'],
    customsImageName: 'guangxi-sanyuesan-customs-overview.png',
    customsWarmMessage: '愿你在三月三的歌声与春色里，把热闹、祝福和好心情都收进行囊。',
    ...SPRING_GREEN_CULTURE_STYLES,
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
};

export const FESTIVAL_CHECKIN_BLESSINGS: Record<string, string[]> = {
  'lantern-festival-2026': [
    '花灯常明，愿你所愿皆有回响。',
    '元宵喜乐，愿你此刻被温柔照亮。',
    '人月两圆，愿你一路有歌也有光。',
    '今夜签到成功，祝你节日快乐顺遂。',
  ],
  'spring-equinox-2026': [
    '春风作伴，愿你把新的期待都种进今天。',
    '春分安好，愿你的生活在明亮里舒展开来。',
    '青草和暖阳都在路上，愿你轻快地迎接新一天。',
    '节气签到成功，愿你把春意和好心情一起带回去。',
  ],
  'guangxi-sanyuesan-2026': [
    '山歌正好，愿你今天把欢喜唱给春天听。',
    '三月三喜乐，愿你的心意都被温柔接住。',
    '绣球轻轻一抛，把好运和好心情都接个满怀。',
    '歌圩签到成功，愿你在八桂春色里尽兴而归。',
  ],
  'mid-autumn-2026': [
    '月色盈门，愿你此刻与团圆撞个满怀。',
    '中秋安宁，愿你惦念的人都在明月下平安。',
    '把温柔的月光收好，愿你今夜所想都有回应。',
    '月夜签到成功，愿你把清辉和好梦一起带回家。',
  ],
  'graduation-season-2026': [
    '青春正好，愿你带着笑意和勇气继续出发。',
    '毕业季顺利，愿每一段告别都通向更好的相遇。',
    '把今天的纪念收好，愿你下一站依旧闪闪发光。',
    '毕业签到成功，愿你把祝福和热爱一起装进行囊。',
  ],
};

export const ACTIVITY_MENU_GROUPS: ActivityMenuGroup[] = [
  {
    id: 'festival-events',
    label: '节日活动',
    festivalIds: ['lantern-festival-2026', 'guangxi-sanyuesan-2026', 'graduation-season-2026', 'mid-autumn-2026'],
  },
  {
    id: 'solar-terms',
    label: '二十四节气',
    festivalIds: ['spring-equinox-2026'],
  },
];

export type ActivityStatus = 'upcoming' | 'active' | 'ended';

export const getActivityStatus = (now: number, startAt: number, endAt: number): ActivityStatus => {
  if (now < startAt) return 'upcoming';
  if (now > endAt) return 'ended';
  return 'active';
};

export const formatCountdown = (ms: number): string => {
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

export const getDefaultFestivalId = (now: number): string => {
  if (FESTIVAL_TEMPLATES.length === 0) return '';

  const activeFestivals = FESTIVAL_TEMPLATES.filter((festival) => now >= festival.startAt && now <= festival.endAt);
  if (activeFestivals.length > 0) {
    return activeFestivals.reduce((latestStartFestival, festival) =>
      festival.startAt > latestStartFestival.startAt ? festival : latestStartFestival
    ).id;
  }

  const upcomingFestivals = FESTIVAL_TEMPLATES.filter((festival) => festival.startAt > now);
  if (upcomingFestivals.length > 0) {
    return upcomingFestivals.reduce((nearestFestival, festival) =>
      festival.startAt < nearestFestival.startAt ? festival : nearestFestival
    ).id;
  }

  return FESTIVAL_TEMPLATES.reduce((latestEndFestival, festival) =>
    festival.endAt > latestEndFestival.endAt ? festival : latestEndFestival
  ).id;
};
