import { ArrowLeft, CheckCircle2, Clock3, PlayCircle, Sparkles, Upload, Video } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useActivityStore } from '../store/useActivityStore';
import { useAuthStore } from '../store/useAuthStore';
import { FESTIVAL_TEMPLATES, formatCountdown, getActivityStatus } from './activityData';

const HOLD_DURATION_MS = 3000;
const CONFETTI_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#14b8a6', '#a855f7'];

const CHECKIN_BLESSINGS = [
  '花灯常明，愿你所愿皆有回响。',
  '元宵喜乐，愿你此刻被温柔照亮。',
  '人月两圆，愿你一路有歌也有光。',
  '今夜签到成功，祝你节日快乐顺遂。',
];

const VIDEO_PLACEHOLDER_BLOCKS = [
  { id: 'v1', title: '祝福视频位 A', hint: '主舞台镜头（16:9）' },
  { id: 'v2', title: '祝福视频位 B', hint: '互动区花絮（16:9）' },
  { id: 'v3', title: '祝福视频位 C', hint: '主持人寄语（16:9）' },
];

type ConfettiPiece = {
  id: number;
  color: string;
  x: number;
  y: number;
  rotate: number;
  delay: number;
};

const createConfettiPieces = (seed: number): ConfettiPiece[] =>
  Array.from({ length: 20 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 20 + seed * 0.17;
    const distance = 72 + ((index * 29 + seed * 11) % 64);
    return {
      id: index,
      color: CONFETTI_COLORS[(index + seed) % CONFETTI_COLORS.length],
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotate: ((index * 47 + seed * 23) % 320) - 160,
      delay: (index % 5) * 0.02,
    };
  });

const speakBlessing = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore browser speech API failures.
  }
};

export const ActivityCheckinPage = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { completedTaskIds, loadProgress, resetProgress, completeTask, isLoading, error } = useActivityStore();

  const [now, setNow] = useState(() => Date.now());
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [blessingText, setBlessingText] = useState('按住圆环约 3 秒完成签到');
  const [celebrationSeed, setCelebrationSeed] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const holdStartRef = useRef<number | null>(null);
  const holdActiveRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const festival = FESTIVAL_TEMPLATES.find((item) => item.id === festivalId);
  const userUid = user?.uid ?? null;
  const isCheckedIn = completedTaskIds.includes('checkin');
  const confettiPieces = useMemo(() => createConfettiPieces(celebrationSeed), [celebrationSeed]);

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

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      if (confettiTimerRef.current !== null) {
        clearTimeout(confettiTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isCheckedIn) return;
    setProgress(100);
    setBlessingText('签到已完成，节日祝福已送达');
  }, [isCheckedIn]);

  if (!festival) {
    return (
      <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24 pt-14">
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="max-w-md mx-auto flex items-center border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={() => navigate('/activity')}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-gray-100"
              aria-label="返回活动页"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="ml-2 font-semibold text-slate-800">签到互动</div>
          </div>
        </header>
        <div className="px-4 pt-5 text-center text-sm text-slate-500">活动不存在或已下线</div>
      </div>
    );
  }

  const checkinTask = festival.tasks.find((task) => task.id === 'checkin');
  if (!checkinTask) {
    return (
      <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24 pt-14">
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="max-w-md mx-auto flex items-center border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={() => navigate(`/activity/${festival.id}`)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-gray-100"
              aria-label="返回活动详情"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="ml-2 font-semibold text-slate-800">{festival.title}</div>
          </div>
        </header>
        <div className="px-4 pt-5 text-center text-sm text-slate-500">当前活动未配置签到任务</div>
      </div>
    );
  }

  const status = getActivityStatus(now, festival.startAt, festival.endAt);
  const countdownText =
    status === 'upcoming'
      ? `距离开始 ${formatCountdown(festival.startAt - now)}`
      : status === 'active'
        ? `距离结束 ${formatCountdown(festival.endAt - now)}`
        : '活动已结束';

  const ringRadius = 82;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progress / 100);

  const stopHolding = () => {
    holdActiveRef.current = false;
    setIsHolding(false);
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (!isCheckedIn && !isCompleting) {
      setProgress(0);
    }
  };

  const triggerCelebration = () => {
    const nextSeed = celebrationSeed + 1;
    const message = CHECKIN_BLESSINGS[nextSeed % CHECKIN_BLESSINGS.length];
    setBlessingText(message);
    setCelebrationSeed(nextSeed);
    setShowConfetti(true);
    speakBlessing(message);

    if (confettiTimerRef.current !== null) {
      clearTimeout(confettiTimerRef.current);
    }
    confettiTimerRef.current = setTimeout(() => {
      setShowConfetti(false);
    }, 1100);
  };

  const completeCheckin = async () => {
    if (isCompleting || isCheckedIn || status !== 'active') return;
    setIsCompleting(true);
    try {
      await completeTask('checkin', checkinTask.points);
      setProgress(100);
      triggerCelebration();
    } finally {
      setIsCompleting(false);
    }
  };

  const animateHold = (timestamp: number) => {
    if (!holdActiveRef.current) return;
    if (holdStartRef.current === null) {
      holdStartRef.current = timestamp;
    }
    const elapsed = timestamp - holdStartRef.current;
    const nextProgress = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100);
    setProgress(nextProgress);

    if (nextProgress >= 100) {
      stopHolding();
      void completeCheckin();
      return;
    }
    frameRef.current = window.requestAnimationFrame(animateHold);
  };

  const startHolding = () => {
    if (status !== 'active' || isCheckedIn || isCompleting) return;
    holdActiveRef.current = true;
    holdStartRef.current = null;
    setProgress(0);
    setIsHolding(true);
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = window.requestAnimationFrame(animateHold);
  };

  const holdHint = isCheckedIn
    ? '已完成签到，可继续查看视频祝福'
    : status !== 'active'
      ? '当前不在活动时间内，暂不可签到'
      : isHolding
        ? '继续按住，圆环注满后自动签到'
        : '按住签到按钮约 3 秒，圆环注满即完成';

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24 pt-14">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto flex items-center border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md">
          <button
            type="button"
            onClick={() => navigate(`/activity/${festival.id}`)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-gray-100"
            aria-label="返回活动详情"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="ml-2 font-semibold text-slate-800">现场签到互动</div>
        </div>
      </header>

      <section className="px-4 pt-4">
        <div className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm ${festival.theme.heroCardClass}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">{festival.title}</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">签到圆环互动</h1>
            </div>
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${festival.theme.countdownClass}`}>
              <Clock3 size={12} className="mr-1" /> {countdownText}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/70 bg-white/80 p-4 backdrop-blur">
            <div className="relative mx-auto w-fit">
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  startHolding();
                }}
                onPointerUp={stopHolding}
                onPointerLeave={stopHolding}
                onPointerCancel={stopHolding}
                disabled={status !== 'active' || isCheckedIn || isCompleting}
                className={`relative select-none touch-none rounded-full p-2 transition-transform ${
                  status !== 'active' || isCompleting
                    ? 'cursor-not-allowed opacity-70'
                    : isCheckedIn
                      ? 'cursor-pointer'
                      : 'cursor-pointer active:scale-[0.99]'
                }`}
              >
                <svg width="208" height="208" viewBox="0 0 208 208" className="-rotate-90">
                  <circle cx="104" cy="104" r={ringRadius} stroke="#dbe2ea" strokeWidth="14" fill="transparent" />
                  <circle
                    cx="104"
                    cy="104"
                    r={ringRadius}
                    stroke="#10b981"
                    strokeWidth="14"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className="transition-[stroke-dashoffset] duration-75"
                  />
                </svg>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[11px] font-semibold text-slate-500">{isCheckedIn ? '签到完成' : '按住签到'}</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">{Math.round(progress)}%</p>
                  <p className="mt-1 text-[11px] text-slate-400">{isHolding ? '注满中...' : `时长约 ${HOLD_DURATION_MS / 1000}s`}</p>
                </div>
              </button>

              {showConfetti ? (
                <div className="pointer-events-none absolute inset-0">
                  {confettiPieces.map((piece) => {
                    const style = {
                      backgroundColor: piece.color,
                      animationDelay: `${piece.delay}s`,
                      '--tx': `${piece.x}px`,
                      '--ty': `${piece.y}px`,
                      '--rt': `${piece.rotate}deg`,
                    } as CSSProperties;

                    return <span key={`${celebrationSeed}-${piece.id}`} className="checkin-confetti-piece" style={style} />;
                  })}
                </div>
              ) : null}
            </div>

            <p className="mt-4 text-center text-sm text-slate-600">{holdHint}</p>
            <div className="mt-2 flex items-center justify-center gap-2 text-center text-sm font-semibold text-emerald-600">
              <Sparkles size={16} />
              <span>{blessingText}</span>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                完成可获得 +{checkinTask.points} 积分
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 px-4">
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-slate-900">视频祝福</h2>
              <p className="mt-1 text-xs text-slate-500">预留上传区，后续可接入你要上传的节日视频</p>
            </div>
            <Video size={18} className="text-slate-400" />
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
            <div className="aspect-video w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_45%),linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#334155_100%)]">
              <div className="flex h-full w-full items-center justify-center">
                <div className="rounded-2xl border border-white/20 bg-black/25 px-4 py-3 text-center text-white/90">
                  <PlayCircle size={28} className="mx-auto" />
                  <p className="mt-2 text-sm font-medium">主视频窗口（待接入）</p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <Upload size={16} />
            预留上传入口（后续可接入本地/云端视频）
          </button>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {VIDEO_PLACEHOLDER_BLOCKS.map((block) => (
              <div key={block.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex h-16 items-center justify-center bg-slate-200/70">
                  <Video size={15} className="text-slate-500" />
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-semibold text-slate-700">{block.title}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{block.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isCheckedIn ? (
        <div className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-emerald-600">
          <CheckCircle2 size={16} />
          今日签到已完成
        </div>
      ) : null}

      {isLoading ? <p className="mt-4 text-center text-sm text-slate-400">活动进度加载中...</p> : null}
      {error ? <p className="mt-2 text-center text-sm text-red-500">{error}</p> : null}

      <style>{`
        .checkin-confetti-piece {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 9px;
          height: 14px;
          border-radius: 2px;
          transform: translate(-50%, -50%);
          animation: checkin-confetti-burst 900ms cubic-bezier(0.18, 0.84, 0.26, 0.98) forwards;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25);
        }

        @keyframes checkin-confetti-burst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.35) rotate(var(--rt));
          }
        }
      `}</style>
    </div>
  );
};
