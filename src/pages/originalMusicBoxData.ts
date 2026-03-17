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

export const DEFAULT_SONGS: SongItem[] = [
  {
    id: 'song-1',
    title: '晚风写信',
    duration: '03:42',
    intro: '给深夜留一盏温柔小灯，和你慢慢把心事说完。',
    styles: ['治愈民谣'],
    coverClassName: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'song-2',
    title: '海边的答案',
    duration: '04:06',
    intro: '当潮声退去，答案会在脚印之间悄悄出现。',
    styles: ['清新流行'],
    coverClassName: 'from-cyan-400 to-sky-500',
  },
  {
    id: 'song-3',
    title: '银河慢跑',
    duration: '03:18',
    intro: '把焦虑折成纸飞机，交给今晚的星空保管。',
    styles: ['电子独立'],
    coverClassName: 'from-violet-400 to-indigo-500',
  },
  {
    id: 'song-4',
    title: '雨停之后',
    duration: '04:23',
    intro: '雨停后的街道有新的呼吸，也有新的勇气。',
    styles: ['城市抒情'],
    coverClassName: 'from-slate-400 to-blue-500',
  },
  {
    id: 'song-5',
    title: '你终将会找到属于自己的月亮',
    duration: '05:07',
    intro: '愿每一次出发，都能带着轻快与明亮回来。',
    styles: ['暖调群像'],
    coverClassName: 'from-orange-400 to-rose-500',
    audioUrl: `${import.meta.env.BASE_URL}audio/moon.wav`,
  },
];

const SONG_DETAILS: Record<string, SongDetail> = {
  'song-1': {
    badge: '深夜特调',
    artist: 'JIEYOU Session',
    highlightLabel: '民谣来信',
    credits: [
      { label: '作词', value: '川页' },
      { label: '作曲', value: '林峤' },
      { label: '编曲', value: '张原野' },
      { label: '制作', value: 'JIEYOU FM' },
    ],
    lyrics: [
      { time: 0, text: '把今天没说出口的话' },
      { time: 13, text: '折成一封晚风色的信' },
      { time: 28, text: '路灯陪着影子走得很慢' },
      { time: 43, text: '你也终于肯停下来听听自己' },
      { time: 58, text: '愿每个夜归的人都有地方落笔' },
      { time: 73, text: '把心事写完 就把疲惫轻轻放低' },
    ],
    durationSeconds: 222,
  },
  'song-2': {
    badge: '海风电台',
    artist: 'Blue Shore',
    highlightLabel: '流行海岸',
    credits: [
      { label: '作词', value: '阿澄' },
      { label: '作曲', value: '李浪' },
      { label: '编曲', value: '群青' },
      { label: '混音', value: '夏泉' },
    ],
    lyrics: [
      { time: 0, text: '海边的答案总是来得很轻' },
      { time: 16, text: '像浪花把犹豫一点点抹平' },
      { time: 34, text: '你看天色从灰蓝慢慢转亮' },
      { time: 51, text: '脚印也学会向前 不再回望' },
    ],
    durationSeconds: 246,
  },
  'song-3': {
    badge: '夜航模式',
    artist: 'Nebula Run',
    highlightLabel: '电子独立',
    credits: [
      { label: '作词', value: '九旻' },
      { label: '作曲', value: 'K' },
      { label: '音色设计', value: 'Float' },
      { label: '制作', value: 'JIEYOU Lab' },
    ],
    lyrics: [
      { time: 0, text: '把焦虑折成纸飞机' },
      { time: 14, text: '沿着星轨慢跑一个来回' },
      { time: 31, text: '世界把噪音关到门外' },
      { time: 47, text: '今晚只留下你的呼吸和月辉' },
    ],
    durationSeconds: 198,
  },
  'song-4': {
    badge: '雨后频道',
    artist: 'After Rain',
    highlightLabel: '城市抒情',
    credits: [
      { label: '作词', value: '简野' },
      { label: '作曲', value: '温平' },
      { label: '编曲', value: '张迟' },
      { label: '制作', value: 'JIEYOU Studio' },
    ],
    lyrics: [
      { time: 0, text: '雨停之后 街道开始重新发光' },
      { time: 18, text: '鞋底踩过积水 像踩过旧日迷茫' },
      { time: 36, text: '有人把乌云收进背包' },
      { time: 53, text: '也有人学会给明天让出一扇窗' },
    ],
    durationSeconds: 263,
  },
  'song-5': {
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
    durationSeconds: 307,
  },
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
        audioUrl: typeof songSource.audioUrl === 'string' ? songSource.audioUrl : fallback.audioUrl,
      } as SongItem;
    })
    .filter((song): song is SongItem => song !== null);

  return normalized.length > 0 ? normalized : DEFAULT_SONGS;
};

const persistSongsToLocalStorage = (songs: SongItem[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(SONG_STORAGE_KEY, JSON.stringify(songs));
};

const normalizeEmail = (email?: string | null): string => (email ?? '').trim().toLowerCase();

const getOwnerKey = (owner: MusicBoxOwner): string | null => {
  if (!owner) {
    return null;
  }
  const email = normalizeEmail(owner.email);
  if (email) {
    return `email:${email}`;
  }
  if (owner.uid && owner.uid.trim()) {
    return `uid:${owner.uid.trim()}`;
  }
  return null;
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
    return normalizeSongs(JSON.parse(raw));
  } catch {
    return DEFAULT_SONGS;
  }
};

export const loadSongsForOwner = async (owner: MusicBoxOwner): Promise<SongItem[]> => {
  const ownerKey = getOwnerKey(owner);
  if (!ownerKey) {
    return loadSongsFromStorage();
  }

  const localSongs = loadSongsFromStorage();
  const fallbackSongs = localSongs.length > 0 ? localSongs : DEFAULT_SONGS;

  try {
    await ensureAuth();
    const collection = db.collection(ORIGINAL_MUSIC_BOX_COLLECTION);
    const result = (await collection.where({ ownerKey }).limit(1).get()) as DbListResponse<OriginalMusicBoxDoc>;
    const doc = result.data[0];

    if (doc?.songs) {
      const cloudSongs = normalizeSongs(doc.songs);
      persistSongsToLocalStorage(cloudSongs);
      return cloudSongs;
    }

    persistSongsToLocalStorage(fallbackSongs);
    return fallbackSongs;
  } catch {
    return fallbackSongs;
  }
};

export const saveSongsForOwner = async (owner: MusicBoxOwner, songs: SongItem[]): Promise<void> => {
  const ownerKey = getOwnerKey(owner);
  persistSongsToLocalStorage(songs);

  if (!ownerKey) {
    return;
  }

  try {
    await ensureAuth();
    const collection = db.collection(ORIGINAL_MUSIC_BOX_COLLECTION);
    const result = (await collection.where({ ownerKey }).limit(1).get()) as DbListResponse<OriginalMusicBoxDoc>;
    const now = Date.now();

    if (result.data.length > 0) {
      await collection.doc(result.data[0]._id).update({
        songs,
        ownerUid: owner?.uid ?? '',
        ownerEmail: normalizeEmail(owner?.email),
        updatedAt: now,
      });
      return;
    }

    await collection.add({
      ownerKey,
      ownerUid: owner?.uid ?? '',
      ownerEmail: normalizeEmail(owner?.email),
      songs,
      createdAt: now,
      updatedAt: now,
    });
  } catch {
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
