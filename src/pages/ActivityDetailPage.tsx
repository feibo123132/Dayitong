import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Clock3, MapPin, PlayCircle, Sparkles, Upload, Video } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useActivityStore } from '../store/useActivityStore';
import { FESTIVAL_TEMPLATES, formatCountdown, getActivityStatus, type ActivityTask } from './activityData';
import { isAdminEmail } from '../lib/permissions';

const BLESSING_VIDEO_DB_NAME = 'jieyou_festival_media_db';
const BLESSING_VIDEO_STORE_NAME = 'festival_blessing_videos';

const openBlessingVideoDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }
    const request = window.indexedDB.open(BLESSING_VIDEO_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BLESSING_VIDEO_STORE_NAME)) {
        db.createObjectStore(BLESSING_VIDEO_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open local media database.'));
  });

const saveBlessingVideoBlob = async (key: string, blob: Blob): Promise<void> => {
  const db = await openBlessingVideoDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(BLESSING_VIDEO_STORE_NAME, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to save local blessing video.'));
    tx.objectStore(BLESSING_VIDEO_STORE_NAME).put(blob, key);
  });
  db.close();
};

const loadBlessingVideoBlob = async (key: string): Promise<Blob | null> => {
  const db = await openBlessingVideoDb();
  const result = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(BLESSING_VIDEO_STORE_NAME, 'readonly');
    const request = tx.objectStore(BLESSING_VIDEO_STORE_NAME).get(key);
    request.onsuccess = () => {
      const value = request.result;
      resolve(value instanceof Blob ? value : null);
    };
    request.onerror = () => reject(request.error ?? new Error('Failed to load local blessing video.'));
  });
  db.close();
  return result;
};

export const ActivityDetailPage = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminEmail(user?.email);
  const { completedTaskIds, loadProgress, resetProgress, completeTask, isLoading, error } = useActivityStore();
  const [now, setNow] = useState(() => Date.now());
  const [isTaskPanelCollapsed, setIsTaskPanelCollapsed] = useState(true);
  const [isBlessingsCollapsed, setIsBlessingsCollapsed] = useState(false);
  const [uploadedBlessingVideoUrl, setUploadedBlessingVideoUrl] = useState<string | null>(null);
  const [blessingVideoError, setBlessingVideoError] = useState<string | null>(null);
  const blessingVideoInputRef = useRef<HTMLInputElement | null>(null);

  const progressOwnerKey = user?.uid ?? user?.email?.trim().toLowerCase() ?? 'guest';
  const festival = FESTIVAL_TEMPLATES.find((item) => item.id === festivalId);
  const blessingVideoStorageKey = festival ? `${progressOwnerKey}::${festival.id}` : null;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!festival?.id) {
      resetProgress();
      return;
    }
    void loadProgress(progressOwnerKey, festival.id);
  }, [festival?.id, loadProgress, progressOwnerKey, resetProgress]);

  useEffect(() => {
    return () => {
      if (uploadedBlessingVideoUrl) {
        window.URL.revokeObjectURL(uploadedBlessingVideoUrl);
      }
    };
  }, [uploadedBlessingVideoUrl]);

  useEffect(() => {
    let isActive = true;
    if (!blessingVideoStorageKey) return;

    void loadBlessingVideoBlob(blessingVideoStorageKey)
      .then((blob) => {
        if (!isActive) return;
        if (!blob) {
          setUploadedBlessingVideoUrl((prev) => {
            if (prev) {
              window.URL.revokeObjectURL(prev);
            }
            return null;
          });
          return;
        }
        const nextUrl = window.URL.createObjectURL(blob);
        setUploadedBlessingVideoUrl((prev) => {
          if (prev) {
            window.URL.revokeObjectURL(prev);
          }
          return nextUrl;
        });
      })
      .catch((error) => {
        console.error('Load blessing video failed:', error);
      });

    return () => {
      isActive = false;
    };
  }, [blessingVideoStorageKey]);

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
    if (!isAdmin) return;
    if (status !== 'active') return;
    await completeTask(task.id, task.points);
  };

  const handleTaskAction = async (task: ActivityTask) => {
    if (!isAdmin) return;
    await handleTaskClick(task);
  };

  const getTaskActionText = (task: ActivityTask, isDone: boolean) => {
    if (!isAdmin) return '仅可查看';
    if (task.id === 'checkin' && isDone) return '已签到';
    if (isDone) return '已完成';
    if (status === 'upcoming') return '未开始';
    if (status === 'ended') return '已结束';
    return '立即完成';
  };

  const handleBlessingVideoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!blessingVideoStorageKey) return;

    void saveBlessingVideoBlob(blessingVideoStorageKey, selectedFile)
      .then(() => {
        const nextUrl = window.URL.createObjectURL(selectedFile);
        setUploadedBlessingVideoUrl((prev) => {
          if (prev) {
            window.URL.revokeObjectURL(prev);
          }
          return nextUrl;
        });
        setBlessingVideoError(null);
      })
      .catch((error) => {
        console.error('Save blessing video failed:', error);
        setBlessingVideoError('视频保存失败，请重试。');
      });
    event.target.value = '';
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
            const disabled = !isAdmin || status !== 'active' || isDone;
            const actionText = getTaskActionText(task, isDone);
            const actionButtonClass = isDone
              ? 'border border-emerald-100 bg-emerald-50 text-emerald-600 cursor-pointer'
              : status === 'active'
                ? `${festival.theme.actionButtonClass} cursor-pointer`
                : 'cursor-not-allowed bg-gray-100 text-gray-400';

            return (
              <div
                key={task.id}
                className={`rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ${
                  isTaskPanelCollapsed ? 'p-3' : 'p-4'
                }`}
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
          <h2 className="text-[17px] font-semibold text-slate-800">节日祝福</h2>
          <button
            type="button"
            onClick={() => setIsBlessingsCollapsed((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            aria-expanded={!isBlessingsCollapsed}
          >
            {isBlessingsCollapsed ? '展开' : '折叠'}
            {isBlessingsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          {isBlessingsCollapsed ? (
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Video size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-700">节日祝福主窗口</div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-end">
                <Video size={18} className="text-slate-400" />
              </div>

              {uploadedBlessingVideoUrl ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                  <video src={uploadedBlessingVideoUrl} controls className="aspect-video w-full bg-black object-contain" />
                </div>
              ) : (
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
              )}

              <button
                type="button"
                onClick={() => blessingVideoInputRef.current?.click()}
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <Upload size={16} className="text-slate-600" />
                <span className="text-slate-600">上传视频</span>
              </button>
              <input
                ref={blessingVideoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleBlessingVideoUpload}
              />
              {blessingVideoError ? <p className="mt-2 text-xs text-red-500">{blessingVideoError}</p> : null}
            </>
          )}
        </div>
      </section>

      {isLoading ? <p className="mt-4 text-center text-sm text-slate-400">活动进度加载中...</p> : null}
      {error ? <p className="mt-2 text-center text-sm text-red-500">{error}</p> : null}
      <p className="mt-4 text-center text-xs text-slate-400">活动编号：{festival.id}</p>
    </div>
  );
};
