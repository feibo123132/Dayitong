import { ArrowLeft, MessageCircleHeart, RefreshCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRASH_RETENTION_MS, useSongRequestStore } from '../store/useSongRequestStore';
import { useAuthStore } from '../store/useAuthStore';
import { isAdminEmail } from '../lib/permissions';

export const SongRequestTrashPage = () => {
  const navigate = useNavigate();
  const { requests, restoreRequest, permanentDeleteRequest, fetchRequests } = useSongRequestStore();
  const isAdmin = useAuthStore((state) => isAdminEmail(state.user?.email));
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleRestore = (id: string) => {
    if (!isAdmin) return;
    void restoreRequest(id);
  };

  const handlePermanentDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('确定要彻底删除这条点歌吗？此操作不可恢复。')) {
      void permanentDeleteRequest(id);
    }
  };

  const getDaysRemaining = (deletedAt: number) => {
    const expiryDate = deletedAt + TRASH_RETENTION_MS;
    const diff = expiryDate - nowTimestamp;
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    return days > 0 ? days : 0;
  };

  const trashRequests = requests
    .filter((request) => Boolean(request.deletedAt))
    .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));

  return (
    <div className="min-h-screen bg-pink-50/50 pb-20">
      <div className="relative h-48 w-full bg-gradient-to-r from-pink-400 to-purple-500 overflow-hidden rounded-b-[2rem] shadow-md">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-wide flex items-center">
            <MessageCircleHeart className="mr-2" /> 留言点歌台
          </h1>
          <p className="text-white/80 mt-2 text-sm">写下你想听的歌，送给想念的人</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/song-request')}
        className="absolute top-4 left-4 z-50 p-2 text-white/80 hover:text-white transition-colors bg-black/10 rounded-full backdrop-blur-sm"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="max-w-md mx-auto px-4 -mt-2 mb-3 relative z-10">
        <div className="rounded-xl border border-gray-100 bg-white/90 px-3 py-2 text-xs text-gray-500">
          已删除记录（7天后自动清除）
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4">
        {trashRequests.map((req) => (
          <div
            key={req.id}
            className="rounded-2xl p-4 shadow-sm border relative overflow-hidden group transition-all bg-gray-50 border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{req.songName}</h3>
                {req.artist && <p className="text-xs text-gray-500">{req.artist}</p>}
              </div>
              {req.deletedAt && (
                <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  {getDaysRemaining(req.deletedAt)}天后过期
                </span>
              )}
            </div>

            {req.message && (
              <div className="bg-gray-100 rounded-xl p-3 text-sm text-gray-600 mb-3 relative">
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-100 rotate-45"></div>
                "{req.message}"
              </div>
            )}

            <div className="flex justify-end items-center text-gray-400 text-xs gap-3">
              <div className="flex w-full items-center justify-between">
                <span className="text-gray-400 text-xs">剩余 {req.deletedAt ? getDaysRemaining(req.deletedAt) : 0} 天</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(req.id);
                    }}
                    disabled={!isAdmin}
                    className="inline-flex items-center text-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RefreshCcw size={14} className="mr-1" /> 恢复
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePermanentDelete(req.id);
                    }}
                    disabled={!isAdmin}
                    className="inline-flex items-center text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={14} className="mr-1" /> 彻底删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {trashRequests.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
            回收站是空的
          </div>
        ) : null}

        <div className="h-36"></div>
      </div>
    </div>
  );
};
