import {
  ChevronDown,
  Heart,
  ListMusic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { SongLyricLine } from './originalMusicBoxData';
import { getSongDetail, loadSongsFromStorage } from './originalMusicBoxData';

const LYRIC_UPLOAD_STORAGE_PREFIX = 'jieyou_uploaded_lyrics_';

const parseDuration = (value: string) => {
  const [minutes, seconds] = value.split(':').map((item) => Number(item));
  if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return 0;
  }
  return minutes * 60 + seconds;
};

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, '0');
  const rest = (safe % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
};

const parseLrcText = (text: string): SongLyricLine[] => {
  const result: SongLyricLine[] = [];
  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const timestampMatches = [...line.matchAll(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g)];

    if (timestampMatches.length > 0) {
      const lyricText = line.replace(/\[[^\]]+\]/g, '').trim();
      if (!lyricText) {
        continue;
      }

      for (const match of timestampMatches) {
        const minutes = Number(match[1]);
        const seconds = Number(match[2]);
        const fraction = match[3] ?? '0';
        if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
          continue;
        }
        const fractionSeconds = Number(`0.${fraction.padEnd(3, '0').slice(0, 3)}`);
        result.push({
          time: minutes * 60 + seconds + fractionSeconds,
          text: lyricText,
        });
      }
      continue;
    }

    const inlineMatch = line.match(/^(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\s+(.+)$/);
    if (!inlineMatch) {
      continue;
    }

    const minutes = Number(inlineMatch[1]);
    const seconds = Number(inlineMatch[2]);
    const fraction = inlineMatch[3] ?? '0';
    const lyricText = inlineMatch[4].trim();
    if (Number.isNaN(minutes) || Number.isNaN(seconds) || !lyricText) {
      continue;
    }

    const fractionSeconds = Number(`0.${fraction.padEnd(3, '0').slice(0, 3)}`);
    result.push({
      time: minutes * 60 + seconds + fractionSeconds,
      text: lyricText,
    });
  }

  return result.sort((a, b) => a.time - b.time);
};

const loadUploadedLyricsFromStorage = (songId: string): SongLyricLine[] | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(`${LYRIC_UPLOAD_STORAGE_PREFIX}${songId}`);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    const normalized = parsed
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }
        const source = item as Partial<SongLyricLine>;
        if (typeof source.time !== 'number' || typeof source.text !== 'string' || !source.text.trim()) {
          return null;
        }
        return { time: source.time, text: source.text.trim() } as SongLyricLine;
      })
      .filter((line): line is SongLyricLine => line !== null)
      .sort((a, b) => a.time - b.time);

    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
};

export const LyricsCarouselPage = () => {
  const { songId } = useParams();
  return <LyricsCarouselScreen key={songId ?? 'unknown-song'} songId={songId ?? ''} />;
};

type LyricsCarouselScreenProps = {
  songId: string;
};

const LyricsCarouselScreen = ({ songId }: LyricsCarouselScreenProps) => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const song = useMemo(() => {
    return loadSongsFromStorage().find((item) => item.id === songId && !item.deletedAt) ?? null;
  }, [songId]);

  const detail = useMemo(() => (song ? getSongDetail(song) : null), [song]);
  const fallbackDuration = song ? parseDuration(song.duration) : 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [liked, setLiked] = useState(true);
  const [uploadedLyrics, setUploadedLyrics] = useState<SongLyricLine[] | null>(() => loadUploadedLyricsFromStorage(songId));
  const [uploadHint, setUploadHint] = useState(() => {
    const stored = loadUploadedLyricsFromStorage(songId);
    return stored ? `已加载上传歌词（${stored.length} 行）` : '';
  });

  const lyrics = useMemo(() => uploadedLyrics ?? detail?.lyrics ?? [], [detail?.lyrics, uploadedLyrics]);
  const duration = audioDuration ?? detail?.durationSeconds ?? fallbackDuration;

  const lyricist = detail?.credits.find((item) => item.label === '作词')?.value;
  const composer = detail?.credits.find((item) => item.label === '作曲')?.value;
  const singer = detail?.credits.find((item) => item.label === '演唱')?.value ?? detail?.artist;
  const infoLine = [lyricist ? `作词：${lyricist}` : null, composer ? `作曲：${composer}` : null, singer ? `演唱：${singer}` : null]
    .filter((item): item is string => Boolean(item))
    .join('  ·  ');

  useEffect(() => {
    if (!song?.audioUrl) {
      audioRef.current = null;
      return;
    }

    const audio = new Audio(song.audioUrl);
    audio.preload = 'auto';

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setAudioDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [song]);

  useEffect(() => {
    if (song?.audioUrl || !isPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25;
        if (next >= duration) {
          window.clearInterval(timer);
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
    }, 250);

    return () => window.clearInterval(timer);
  }, [duration, isPlaying, song?.audioUrl]);

  const activeIndex = useMemo(() => {
    if (lyrics.length === 0) {
      return -1;
    }

    for (let i = 0; i < lyrics.length; i += 1) {
      const current = lyrics[i];
      const next = lyrics[i + 1];
      if (!next || (currentTime >= current.time && currentTime < next.time)) {
        return i;
      }
    }

    return 0;
  }, [currentTime, lyrics]);

  useEffect(() => {
    if (activeIndex < 0) {
      return;
    }

    lyricRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [activeIndex]);

  const seekTo = (nextTime: number) => {
    const target = Math.min(Math.max(nextTime, 0), duration || 0);
    setCurrentTime(target);

    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const togglePlayback = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    setIsPlaying((prev) => !prev);
  };

  const jumpToCue = (direction: -1 | 1) => {
    if (lyrics.length === 0) {
      return;
    }

    const nextIndex = Math.min(Math.max(activeIndex + direction, 0), lyrics.length - 1);
    seekTo(lyrics[nextIndex].time);
  };

  const handleUploadLyrics = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || typeof window === 'undefined') {
      return;
    }

    const content = await file.text();
    const parsed = parseLrcText(content);

    if (parsed.length === 0) {
      setUploadHint('歌词上传失败：请使用 [mm:ss] 歌词格式');
      event.target.value = '';
      return;
    }

    window.localStorage.setItem(`${LYRIC_UPLOAD_STORAGE_PREFIX}${songId}`, JSON.stringify(parsed));
    setUploadedLyrics(parsed);
    setUploadHint(`歌词上传成功：已匹配 ${parsed.length} 行时间点`);
    seekTo(0);
    event.target.value = '';
  };

  const restoreDefaultLyrics = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(`${LYRIC_UPLOAD_STORAGE_PREFIX}${songId}`);
    setUploadedLyrics(null);
    setUploadHint('已恢复默认歌词');
  };

  if (!song || !detail) {
    return (
      <div className="min-h-screen bg-[#220706] px-6 py-8 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center gap-6 text-center">
          <p className="text-base text-white/80">没有找到这首歌，可能已被移除。</p>
          <button
            type="button"
            onClick={() => navigate('/original-music-box')}
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/90"
          >
            返回原创音乐盒
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#2b0405] text-white">
      <div className="relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_-12%,_rgba(255,145,132,0.24),_transparent_38%),linear-gradient(180deg,_#651013_0%,_#4c0a0d_48%,_#2d0608_100%)] px-4 pb-5 pt-2.5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#ff8a72]/16 blur-3xl" />
          <div className="absolute -bottom-6 right-0 h-48 w-48 rounded-full bg-[#ff4f5f]/14 blur-3xl" />
          <div className="absolute inset-x-0 top-16 h-px bg-white/10" />
        </div>

        <header className="relative z-10 flex items-start justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
            aria-label="返回"
          >
            <ChevronDown size={20} />
          </button>

          <div className="min-w-0 flex-1 px-3 text-center">
            <h1 className="truncate text-[17px] font-semibold text-[#f9ebe3]" style={{ fontFamily: '"Noto Serif SC", "Songti SC", serif' }}>
              {song.title}
            </h1>
            <p className="mt-1 truncate text-[11px] text-white/70">{infoLine}</p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 text-[11px] text-white/85 transition hover:bg-white/15"
            aria-label="歌词上传"
          >
            <Upload size={14} />
            歌词上传
          </button>
          <input ref={fileInputRef} type="file" accept=".lrc,.txt,text/plain" className="hidden" onChange={(event) => void handleUploadLyrics(event)} />
        </header>

        <div className="relative z-10 mt-1.5 flex items-center justify-center gap-3 text-[10px] text-white/55">
          <span>{uploadHint || '支持 LRC/TXT，示例：[00:15.20] 歌词内容'}</span>
          {uploadedLyrics && (
            <button type="button" onClick={restoreDefaultLyrics} className="rounded-full border border-white/20 px-2 py-0.5 text-white/75">
              恢复默认
            </button>
          )}
        </div>

        <section className="relative z-10 mt-2 min-h-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[#5b1012] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#340708] to-transparent" />
          <div className="h-full overflow-y-auto scroll-smooth px-1 pb-5 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="pb-20 pt-12">
              {lyrics.map((line, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={`${line.time}-${line.text}`}
                    type="button"
                    ref={(node) => {
                      lyricRefs.current[index] = node;
                    }}
                    onClick={() => seekTo(line.time)}
                    className={`mb-2 block w-full transition-all duration-500 ${
                      isActive ? 'scale-[1.005] rounded-lg bg-white/11 px-2.5 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.24)]' : 'px-3 py-1.5 opacity-75'
                    }`}
                  >
                    {isActive && <span className="mb-1 block text-left text-[11px] text-white/75">{formatTime(line.time)}</span>}
                    <p
                      className={`text-center ${isActive ? 'text-[20px] leading-8 text-[#f9e7dc]' : 'text-[16px] leading-8 text-white/35'}`}
                      style={{ fontFamily: '"Noto Serif SC", "Songti SC", serif' }}
                    >
                      {line.text}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-1.5 flex items-center justify-between px-0.5 text-white/75">
          <button
            type="button"
            onClick={() => setLiked((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/8"
            aria-label={liked ? '取消喜欢' : '喜欢'}
          >
            <Heart size={17} className={liked ? 'fill-[#ff4b55] text-[#ff4b55]' : 'text-white/65'} />
          </button>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/8" aria-label="人声开关">
            <MicOff size={15} />
          </button>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/8" aria-label="歌词列表">
            <ListMusic size={17} />
          </button>
        </section>

        <section className="relative z-10 mt-1 px-0.5">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seekTo(Number(event.target.value))}
            className="h-[2px] w-full cursor-pointer appearance-none rounded-full bg-white/35 accent-white"
            aria-label="播放进度"
          />
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-white/48">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </section>

        <section className="relative z-10 mt-2 flex items-center justify-between px-0.5 text-white/82">
          <button
            type="button"
            onClick={() => seekTo(0)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/8"
            aria-label="从头播放"
          >
            <RotateCcw size={19} />
          </button>
          <button
            type="button"
            onClick={() => jumpToCue(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/8"
            aria-label="上一句"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            type="button"
            onClick={() => void togglePlayback()}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/14 text-[#ffece2] shadow-[0_10px_26px_rgba(0,0,0,0.28)] hover:bg-white/18"
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="translate-x-0.5" />}
          </button>
          <button
            type="button"
            onClick={() => jumpToCue(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/8"
            aria-label="下一句"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
          <div className="h-10 w-10" />
        </section>
      </div>
    </div>
  );
};
