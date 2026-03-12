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
    periodText: '2026.03.20 - 2026.04.20',
    location: '校园草地 · 线上同步',
    startAt: new Date('2026-03-20T00:00:00+08:00').getTime(),
    endAt: new Date('2026-04-20T23:59:59+08:00').getTime(),
    decoA: '🌿',
    decoB: '🌸',
    backgroundImage: 'images/festivals/spring-equinox-2026-bg.png',
    theme: {
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
    },
    tasks: [
      {
        id: 'checkin',
        title: '春分签到互动',
        description: '到达春分活动区完成签到打卡，点亮你的节气纪念章。',
        points: 20,
        badge: '节气打卡',
        icon: MapPin,
        iconColor: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
      },
      {
        id: 'guess-song',
        title: '春日听歌识曲',
        description: '参与一轮春日主题听歌识曲挑战，解锁节气旋律。',
        points: 20,
        badge: '春日旋律',
        icon: Music2,
        iconColor: 'text-lime-600',
        bgColor: 'bg-lime-50',
      },
      {
        id: 'festival-message',
        title: '春分寄语留言',
        description: '写下一句春日祝福，生成你的节气纪念卡片。',
        points: 20,
        badge: '春日寄语',
        icon: MessageSquareHeart,
        iconColor: 'text-teal-500',
        bgColor: 'bg-teal-50',
      },
    ],
    rewards: [
      { id: 'r1', title: '春分新芽徽章', description: '完成 1 个任务解锁', threshold: 1 },
      { id: 'r2', title: '节气知音称号', description: '完成 2 个任务解锁', threshold: 2 },
      { id: 'r3', title: '春日解忧达人称号', description: '完成全部任务解锁', threshold: 3 },
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

export const ACTIVITY_MENU_GROUPS: ActivityMenuGroup[] = [
  {
    id: 'festival-events',
    label: '节日活动',
    festivalIds: ['lantern-festival-2026', 'mid-autumn-2026', 'graduation-season-2026'],
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
