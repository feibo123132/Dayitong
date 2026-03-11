import { ArrowLeft, ChevronRight, Menu, Play, Plus, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SongItem } from './originalMusicBoxData';
import { SONG_STORAGE_KEY, TRASH_RETENTION_MS, loadSongsFromStorage } from './originalMusicBoxData';

export const OriginalMusicBoxPage = () => {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [showTrashBin, setShowTrashBin] = useState(false);
  const [songs, setSongs] = useState<SongItem[]>(() => {
    const now = Date.now();
    return loadSongsFromStorage().filter((song) => !song.deletedAt || now - song.deletedAt < TRASH_RETENTION_MS);
  });
  const [renderNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(SONG_STORAGE_KEY, JSON.stringify(songs));
  }, [songs]);

  const displaySongs = useMemo(
    () => (showTrashBin ? songs.filter((song) => song.deletedAt) : songs.filter((song) => !song.deletedAt)),
    [showTrashBin, songs]
  );

  const handleUpdateSong = (id: string, field: 'title' | 'duration' | 'intro', value: string) => {
    setSongs((prev) => prev.map((song) => (song.id === id ? { ...song, [field]: value } : song)));
  };

  const handleUpdateStyle = (id: string, index: number, value: string) => {
    setSongs((prev) =>
      prev.map((song) => {
        if (song.id !== id) {
          return song;
        }

        const newStyles = [...song.styles];
        newStyles[index] = value;
        return { ...song, styles: newStyles };
      })
    );
  };

  const handleDeleteSong = (id: string) => {
    const now = Date.now();
    setSongs((prev) => prev.map((song) => (song.id === id ? { ...song, deletedAt: now } : song)));
  };

  const handleRestoreSong = (id: string) => {
    setSongs((prev) => prev.map((song) => (song.id === id ? { ...song, deletedAt: undefined } : song)));
  };

  const handlePermanentDelete = (id: string) => {
    setSongs((prev) => prev.filter((song) => song.id !== id));
  };

  const handleAddSong = () => {
    const newSong: SongItem = {
      id: `song-${Date.now()}`,
      title: '新歌曲',
      duration: '00:00',
      intro: '请输入歌曲简介...',
      styles: ['新风格'],
      coverClassName: 'from-slate-300 to-slate-400',
    };

    setSongs((prev) => [...prev, newSong]);
    setEditingSongId(newSong.id);
  };

  const handleReorder = (newOrder: SongItem[]) => {
    if (showTrashBin) {
      return;
    }

    setSongs((prev) => {
      const deletedSongs = prev.filter((song) => song.deletedAt);
      return [...newOrder, ...deletedSongs];
    });
  };

  const getDaysRemaining = (deletedAt: number) => {
    const expiryDate = deletedAt + TRASH_RETENTION_MS;
    const diff = expiryDate - renderNow;
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    return days > 0 ? days : 0;
  };

  const canOpenSongDetail = (songId: string) => !showTrashBin && !isEditMode && editingSongId !== songId;
  const openSongDetail = (songId: string) => navigate(`/original-music-box/${songId}`);

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (showTrashBin) {
                setShowTrashBin(false);
              } else {
                navigate(-1);
              }
            }}
            className="h-10 w-10 rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="返回"
          >
            <ArrowLeft size={22} className="mx-auto" />
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-slate-900">
            {showTrashBin ? '回收站' : '原创音乐盒'}
          </h1>

          <button
            type="button"
            onClick={() => setShowMenu((value) => !value)}
            className="h-10 w-10 rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="菜单"
          >
            <Menu size={22} className="mx-auto" />
          </button>

          {showMenu && (
            <>
              <button
                type="button"
                aria-label="关闭菜单"
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-12 z-20 w-44 space-y-4 overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span>⚙️</span> 管理模式
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(!isEditMode);
                      if (showTrashBin) {
                        setShowTrashBin(false);
                      }
                      if (isEditMode) {
                        setEditingSongId(null);
                      }
                    }}
                    disabled={showTrashBin}
                    className={`relative h-5 w-10 rounded-full transition-colors ${
                      isEditMode && !showTrashBin ? 'bg-teal-500' : 'bg-slate-200'
                    } ${showTrashBin ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        isEditMode && !showTrashBin ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowTrashBin(!showTrashBin);
                    setShowMenu(false);
                    setIsEditMode(false);
                    setEditingSongId(null);
                  }}
                  className="group flex w-full items-center justify-between text-sm font-medium text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <span>{showTrashBin ? '🔊' : '🗏'}</span>
                    {showTrashBin ? '返回列表' : '回收站'}
                  </span>
                  <ChevronRight size={16} className="text-slate-400 transition-colors group-hover:text-slate-600" />
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="px-4 py-4">
        {showTrashBin && displaySongs.length === 0 && <div className="py-10 text-center text-sm text-slate-400">回收站是空的</div>}

        <Reorder.Group axis="y" values={displaySongs} onReorder={handleReorder} className="space-y-3">
          {displaySongs.map((song) => (
            <Reorder.Item
              key={song.id}
              value={song}
              dragListener={!showTrashBin}
              onDoubleClick={() => {
                if (!showTrashBin) {
                  setEditingSongId((current) => (current === song.id ? null : song.id));
                }
              }}
            >
              <article
                className={`relative overflow-hidden rounded-2xl border bg-white p-3 shadow-sm transition-colors ${
                  editingSongId === song.id ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-100'
                } ${canOpenSongDetail(song.id) ? 'cursor-pointer select-none hover:border-slate-200' : 'select-text'}`}
                role={canOpenSongDetail(song.id) ? 'button' : undefined}
                tabIndex={canOpenSongDetail(song.id) ? 0 : undefined}
                onClick={() => {
                  if (canOpenSongDetail(song.id)) {
                    openSongDetail(song.id);
                  }
                }}
                onKeyDown={(event) => {
                  if ((event.key === 'Enter' || event.key === ' ') && canOpenSongDetail(song.id)) {
                    event.preventDefault();
                    openSongDetail(song.id);
                  }
                }}
              >
                {showTrashBin && song.deletedAt && (
                  <div className="absolute right-0 top-0 rounded-bl-lg bg-red-50 px-2 py-1 text-[10px] font-medium text-red-500">
                    {getDaysRemaining(song.deletedAt)}天后过期
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-16 w-16 flex-shrink-0 items-center justify-center self-center rounded-xl bg-gradient-to-br ${song.coverClassName} font-bold text-white shadow-inner`}
                  >
                    乐
                  </div>

                  <div className="min-w-0 flex-1 self-center">
                    {editingSongId === song.id ? (
                      <div className="space-y-2" onClick={(event) => event.stopPropagation()}>
                        <input
                          value={song.title}
                          onChange={(e) => handleUpdateSong(song.id, 'title', e.target.value)}
                          className="w-full border-b border-slate-200 bg-transparent py-0.5 text-base font-semibold focus:border-teal-500 focus:outline-none"
                          placeholder="歌名"
                        />
                        <div className="flex gap-2">
                          <div className="flex flex-1 gap-2">
                            {[0, 1, 2].map((index) => (
                              <input
                                key={index}
                                value={song.styles[index] || ''}
                                onChange={(e) => handleUpdateStyle(song.id, index, e.target.value)}
                                className="w-full min-w-0 border-b border-slate-200 bg-transparent py-0.5 text-xs focus:border-teal-500 focus:outline-none"
                                placeholder={`风格${index + 1}`}
                              />
                            ))}
                          </div>
                          <input
                            value={song.duration}
                            onChange={(e) => handleUpdateSong(song.id, 'duration', e.target.value)}
                            className="w-12 shrink-0 border-b border-slate-200 bg-transparent py-0.5 text-right text-xs focus:border-teal-500 focus:outline-none"
                            placeholder="时长"
                          />
                        </div>
                        <textarea
                          value={song.intro}
                          onChange={(e) => handleUpdateSong(song.id, 'intro', e.target.value)}
                          className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 text-xs focus:border-teal-500 focus:outline-none"
                          rows={2}
                          placeholder="简介"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="truncate text-base font-semibold text-slate-900">{song.title}</h2>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{song.intro}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-2">
                            {song.styles
                              .filter((style) => style.trim().length > 0)
                              .map((style, index) => (
                                <span
                                  key={`${song.id}-${index}-${style}`}
                                  className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-600"
                                >
                                  {style}
                                </span>
                              ))}
                          </div>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{song.duration}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2 self-center">
                    {!showTrashBin ? (
                      <>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (canOpenSongDetail(song.id)) {
                              openSongDetail(song.id);
                            }
                          }}
                          disabled={!canOpenSongDetail(song.id)}
                          className={`h-11 w-11 flex-shrink-0 rounded-full transition-all ${
                            canOpenSongDetail(song.id)
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'cursor-not-allowed bg-slate-100/70 text-slate-300'
                          }`}
                          aria-label={`进入 ${song.title}`}
                        >
                          <Play size={18} className="mx-auto translate-x-[1px]" />
                        </button>

                        {(isEditMode || editingSongId === song.id) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteSong(song.id);
                            }}
                            className="p-2 text-red-400 transition-colors hover:text-red-600"
                            aria-label="删除"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRestoreSong(song.id);
                          }}
                          className="rounded-full bg-blue-50 p-2 text-blue-500 transition-colors hover:bg-blue-100"
                          aria-label="恢复"
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handlePermanentDelete(song.id);
                          }}
                          className="rounded-full bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100"
                          aria-label="彻底删除"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {!showTrashBin && (
          <button
            onClick={handleAddSong}
            className="mt-4 flex w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-3 font-medium text-slate-400 transition-all hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-500"
          >
            <Plus size={20} />
          </button>
        )}
      </main>
    </div>
  );
};
