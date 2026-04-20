import { db, ensureAuth } from '../lib/cloudbase';

export type SongItem = {
  id: string;
  title: string;
  duration: string;
  intro: string;
  styles: string[];
  coverClassName: string;
  deletedAt?: number;
  audioUrl?: string;
};

export type SongLyricLine = {
  time: number;
  text: string;
  note?: string;
};

export type SongDetail = {
  badge: string;
  artist: string;
  highlightLabel: string;
  credits: Array<{ label: string; value: string }>;
  lyrics: SongLyricLine[];
  durationSeconds?: number;
};

export const SONG_STORAGE_KEY = 'jieyou_original_music_box_songs_v1';
export const TRASH_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
export const ORIGINAL_MUSIC_BOX_COLLECTION = 'Dayitong_original_music_box';

export type MusicBoxOwner = {
  uid?: string | null;
  email?: string | null;
} | null;

interface DbListResponse<T> {
  data: T[];
}

type SongDocItem = Partial<SongItem> | null;

type OriginalMusicBoxDoc = {
  _id: string;
  ownerKey: string;
  ownerUid?: string;
  ownerEmail?: string;
  songs?: SongDocItem[];
  createdAt: number;
  updatedAt: number;
};

const MOON_SONG_ID = 'song-5';
const MOON_SONG_TITLE = '你终将会找到属于自己的月亮';
const LEGACY_PLACEHOLDER_IDS = new Set(['song-1', 'song-2', 'song-3', 'song-4']);
const LEGACY_PLACEHOLDER_TITLES = new Set(['山花烂漫时', '海边的答案', '雨停之后', '银河慢跑', '晚风写信']);

export const DEFAULT_SONGS: SongItem[] = [
  {
    id: MOON_SONG_ID,
    title: MOON_SONG_TITLE,
    duration: '03:22',
    intro: '愿每一次出发，都能带着轻快与明亮回来。',
    styles: ['社团之歌', 'Dream pop'],
    coverClassName: 'from-orange-400 to-rose-500',
    audioUrl: `${import.meta.env.BASE_URL}audio/moon.wav`,
  },
];

const SONG_DETAILS: Record<string, SongDetail> = {
  [MOON_SONG_ID]: {
    badge: '解忧专供',
    artist: '广医小帅、小美',
    highlightLabel: '暖心旋律',
    credits: [
      { label: '作词', value: 'JIEYOU' },
      { label: '作曲', value: 'JIEYOU' },
      { label: '演唱', value: '广医小帅、小美' },
    ],
    lyrics: [
      { time: 21.5, text: '星星眨眼的夜晚 微风拂过喧闹操场' },
      { time: 26.96, text: '你倾身侧耳 细细聆听旋律的流转' },
      { time: 32.2, text: '刚听过的歌 却说不出确定的答案' },
      { time: 37.16, text: '被反问时 止不住自我怀疑的慌张' },
      { time: 43.33, text: '奖励你的坚定 答对了是蹦蹦跳跳的轻盈' },
      { time: 48.6, text: '综艺式大喘气 传来亲友团鼓掌的声音' },
      { time: 53.86, text: '手里的小礼品 是同学满载祝福的温情' },
      { time: 59.0, text: '准备离开时 谁说了句 祝你每天开心' },
      { time: 64.5, text: '解忧不解忧 暂时忘掉生活的烦恼' },
      { time: 68.9, text: '心灵片刻停靠 偶尔遇到 已经足够' },
      { time: 71.96, text: '音乐真奇妙 让不相识的人放声大笑' },
      { time: 76.1, text: '你真的很好 即使今夜的风再吵闹' },
      { time: 86.93, text: '惩罚你的坚定 即使旋律是如此的熟悉' },
      { time: 92.26, text: '答案揭晓间隙 止不住惋惜的激动表情' },
      { time: 96.5, text: '晴天说成稻香没关系 开心便是此刻意义' },
      { time: 101.6, text: '再次相遇 你是否 也多了些美好的经历' },
      { time: 108.13, text: '解忧不解忧 暂时忘掉旅途的烦恼' },
      { time: 112.56, text: '驿站片刻停靠 期待遇到 你的微笑' },
      { time: 115.56, text: '缘分真奇妙 让陌生的人相遇在街角' },
      { time: 119.73, text: '你一直都好 即使未来的风再喧嚣' },
      { time: 131.6, text: '幸运着 在你风华正茂的青春里来过' },
      { time: 136.06, text: '即使不再见了 成了彼此生命的过客' },
      { time: 141.5, text: '生命很难呢 可你总是那么热爱生活' },
      { time: 146.3, text: '每当宇宙闪烁 星星们依旧为你亮着' },
      { time: 154.46, text: '解忧不解忧 能否忘掉生命的烦恼' },
      { time: 158.9, text: '当你再次停靠 往昔一切随风飘摇' },
      { time: 161.93, text: '生命真奇妙 相遇的人模糊在记忆一角' },
      { time: 166.06, text: '朝着你的月亮走 最终也能遇到某某' },
    ],
    durationSeconds: 202,
  },
};

const normalizeAudioUrl = (rawAudioUrl: string | undefined, fallbackAudioUrl: string | undefined): string | undefined => {
  const sourceAudioUrl = typeof rawAudioUrl === 'string' ? rawAudioUrl.trim() : '';
  if (!sourceAudioUrl) {
    return fallbackAudioUrl;
  }

  const normalized = sourceAudioUrl.replace(/\\/g, '/');
  const hasWindowsPathPrefix = /^[a-zA-Z]:\//.test(normalized);
  const isFileProtocol = normalized.startsWith('file://');

  if (hasWindowsPathPrefix || isFileProtocol) {
    return fallbackAudioUrl;
  }

  const withoutDotPrefix = normalized.replace(/^\.\/+/, '');
  if (withoutDotPrefix.toLowerCase().startsWith('audio/')) {
    return `${import.meta.env.BASE_URL}${withoutDotPrefix}`;
  }

  const audioSegmentIndex = normalized.toLowerCase().indexOf('/audio/');
  if (audioSegmentIndex >= 0) {
    const audioSegment = normalized.slice(audioSegmentIndex + 1);
    return `${import.meta.env.BASE_URL}${audioSegment}`;
  }

  return normalized;
};

const normalizeSongs = (source: unknown): SongItem[] => {
  if (!Array.isArray(source)) {
    return DEFAULT_SONGS;
  }

  const normalized = source
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const songSource = item as Partial<SongItem>;
      const fallback = DEFAULT_SONGS[index] ?? DEFAULT_SONGS[0];
      const title = typeof songSource.title === 'string' && songSource.title.trim() ? songSource.title : fallback.title;
      const duration =
        typeof songSource.duration === 'string' && songSource.duration.trim() ? songSource.duration : fallback.duration;
      const intro = typeof songSource.intro === 'string' ? songSource.intro : fallback.intro;
      const coverClassName =
        typeof songSource.coverClassName === 'string' && songSource.coverClassName.trim()
          ? songSource.coverClassName
          : fallback.coverClassName;
      const sanitizedAudioUrl = normalizeAudioUrl(songSource.audioUrl, fallback.audioUrl);

      const styles = Array.isArray(songSource.styles)
        ? songSource.styles.filter((style): style is string => typeof style === 'string')
        : fallback.styles;

      return {
        id: typeof songSource.id === 'string' && songSource.id ? songSource.id : `song-${Date.now()}-${index}`,
        title,
        duration,
        intro,
        styles,
        coverClassName,
        deletedAt: typeof songSource.deletedAt === 'number' ? songSource.deletedAt : undefined,
        audioUrl: sanitizedAudioUrl,
      } as SongItem;
    })
    .filter((song): song is SongItem => song !== null);

  return normalized.length > 0 ? normalized : DEFAULT_SONGS;
};

const isLegacyPlaceholderSong = (song: SongItem): boolean => {
  return LEGACY_PLACEHOLDER_IDS.has(song.id) || LEGACY_PLACEHOLDER_TITLES.has(song.title);
};

const isMoonSong = (song: SongItem): boolean => {
  return song.id === MOON_SONG_ID || song.title === MOON_SONG_TITLE;
};

const pruneLegacyPlaceholderSongs = (songs: SongItem[]): SongItem[] => {
  const hasMoonSong = songs.some((song) => isMoonSong(song));
  if (!hasMoonSong) {
    return songs;
  }

  const filtered = songs.filter((song) => isMoonSong(song) || !isLegacyPlaceholderSong(song));
  return filtered.length > 0 ? filtered : songs;
};
const persistSongsToLocalStorage = (songs: SongItem[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(SONG_STORAGE_KEY, JSON.stringify(songs));
};

const normalizeEmail = (email?: string | null): string => (email ?? '').trim().toLowerCase();

const getOwnerKeys = (owner: MusicBoxOwner): string[] => {
  if (!owner) return [];
  const keys: string[] = [];

  const email = normalizeEmail(owner.email);
  if (email) {
    keys.push(`email:${email}`);
  }

  if (owner.uid && owner.uid.trim()) {
    keys.push(`uid:${owner.uid.trim()}`);
  }

  return [...new Set(keys)];
};

export const loadSongsFromStorage = (): SongItem[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_SONGS;
  }

  try {
    const raw = window.localStorage.getItem(SONG_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SONGS;
    }
    return pruneLegacyPlaceholderSongs(normalizeSongs(JSON.parse(raw)));
  } catch {
    return DEFAULT_SONGS;
  }
};

export const loadSongsForOwner = async (owner: MusicBoxOwner): Promise<SongItem[]> => {
  const ownerKeys = getOwnerKeys(owner);
  if (ownerKeys.length === 0) {
    return loadSongsFromStorage();
  }

  const primaryOwnerKey = ownerKeys[0];
  const secondaryOwnerKey = ownerKeys[1];
  const localSongs = pruneLegacyPlaceholderSongs(loadSongsFromStorage());
  const fallbackSongs = localSongs.length > 0 ? localSongs : DEFAULT_SONGS;

  try {
    await ensureAuth();
    const collection = db.collection(ORIGINAL_MUSIC_BOX_COLLECTION);
    const primaryResult = (await collection.where({ ownerKey: primaryOwnerKey }).limit(1).get()) as DbListResponse<OriginalMusicBoxDoc>;
    const primaryDoc = primaryResult.data[0];
    let secondaryDoc: OriginalMusicBoxDoc | undefined;

    if (secondaryOwnerKey) {
      const secondaryResult = (await collection.where({ ownerKey: secondaryOwnerKey }).limit(1).get()) as DbListResponse<OriginalMusicBoxDoc>;
      secondaryDoc = secondaryResult.data[0];
    }

    const cloudDocs = [primaryDoc, secondaryDoc]
      .filter((doc): doc is OriginalMusicBoxDoc => Boolean(doc && Array.isArray(doc.songs)))
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

    if (cloudDocs.length > 0) {
      const latestDoc = cloudDocs[0];
      const originalCloudSongs = normalizeSongs(latestDoc.songs);
      const cloudSongs = pruneLegacyPlaceholderSongs(originalCloudSongs);
      persistSongsToLocalStorage(cloudSongs);

      // Keep cloud data in sync when legacy placeholder songs were pruned.
      const hasPrunedChanges = JSON.stringify(cloudSongs) !== JSON.stringify(originalCloudSongs);
      if (hasPrunedChanges && latestDoc?._id) {
        try {
          await collection.doc(latestDoc._id).update({
            songs: cloudSongs,
            ownerUid: owner?.uid ?? '',
            ownerEmail: normalizeEmail(owner?.email),
            updatedAt: Date.now(),
          });
        } catch {
          // Ignore sync failures; cleaned songs are still used locally.
        }
      }

      // Best-effort migration to a single stable owner key.
      if (latestDoc.ownerKey !== primaryOwnerKey) {
        try {
          if (primaryDoc?._id) {
            await collection.doc(primaryDoc._id).update({
              songs: cloudSongs,
              ownerUid: owner?.uid ?? '',
              ownerEmail: normalizeEmail(owner?.email),
              updatedAt: Date.now(),
            });
          } else {
            await collection.add({
              ownerKey: primaryOwnerKey,
              ownerUid: owner?.uid ?? '',
              ownerEmail: normalizeEmail(owner?.email),
              songs: cloudSongs,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        } catch {
          // Ignore migration failures; read already succeeded.
        }
      }

      return cloudSongs;
    }

    persistSongsToLocalStorage(fallbackSongs);
    return fallbackSongs;
  } catch (error) {
    console.error('Load original music box from cloud failed:', error);
    return fallbackSongs;
  }
};

export const saveSongsForOwner = async (owner: MusicBoxOwner, songs: SongItem[]): Promise<void> => {
  const normalizedSongs = pruneLegacyPlaceholderSongs(songs);
  const ownerKeys = getOwnerKeys(owner);
  persistSongsToLocalStorage(normalizedSongs);

  if (ownerKeys.length === 0) {
    return;
  }

  const primaryOwnerKey = ownerKeys[0];

  try {
    await ensureAuth();
    const collection = db.collection(ORIGINAL_MUSIC_BOX_COLLECTION);
    const result = (await collection.where({ ownerKey: primaryOwnerKey }).limit(1).get()) as DbListResponse<OriginalMusicBoxDoc>;
    const now = Date.now();

    if (result.data.length > 0) {
      await collection.doc(result.data[0]._id).update({
        songs: normalizedSongs,
        ownerUid: owner?.uid ?? '',
        ownerEmail: normalizeEmail(owner?.email),
        updatedAt: now,
      });
      return;
    }

    await collection.add({
      ownerKey: primaryOwnerKey,
      ownerUid: owner?.uid ?? '',
      ownerEmail: normalizeEmail(owner?.email),
      songs: normalizedSongs,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Save original music box to cloud failed:', error);
    // Keep local copy when cloud save fails.
  }
};

export const getSongDetail = (song: SongItem): SongDetail => {
  return (
    SONG_DETAILS[song.id] ?? {
      badge: '原创音乐盒',
      artist: 'JIEYOU',
      highlightLabel: '',
      credits: [
        { label: '作词', value: 'JIEYOU' },
        { label: '作曲', value: 'JIEYOU' },
      ],
      lyrics: [
        { time: 0, text: song.title },
        { time: 10, text: song.intro },
      ],
    }
  );
};




