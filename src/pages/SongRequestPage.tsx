import { ArrowLeft, Clock, Flame, Heart, MessageCircleHeart, Music, Send, Edit2, Trash2, Menu, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRASH_RETENTION_MS, useSongRequestStore } from '../store/useSongRequestStore';
import type { SongRequest } from '../store/useSongRequestStore';

export const SongRequestPage = () => {
  const navigate = useNavigate();
  const { requests, addRequest, likeRequest, updateRequest, deleteRequest, fetchRequests } = useSongRequestStore();
  const [activeTab, setActiveTab] = useState<'latest' | 'hot'>('latest');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [songName, setSongName] = useState('');
  const [artist, setArtist] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const resetForm = () => {
    setEditingId(null);
    setSongName('');
    setArtist('');
    setMessage('');
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (req: SongRequest) => {
    setEditingId(req.id);
    setSongName(req.songName);
    setArtist(req.artist || '');
    setMessage(req.message || '');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songName.trim()) return;

    if (editingId) {
      updateRequest(editingId, {
        songName,
        artist,
        message,
      });
    } else {
      addRequest(songName, artist, message);
    }

    closeForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要将这条点歌移入回收站吗？')) {
      deleteRequest(id);
    }
  };

  const visibleRequests = requests.filter((request) => !request.deletedAt);

  const sortedRequests = [...visibleRequests].sort((a, b) => {
    if (activeTab === 'latest') {
      return b.createdAt - a.createdAt;
    }
    return b.likes - a.likes;
  });

  const getStatusBadge = (status: SongRequest['status']) => {
    switch (status) {
      case 'playing':
        return (
          <span className="flex items-center text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full animate-pulse">
            <Music size={12} className="mr-1" /> 正在播放
          </span>
        );
      case 'accepted':
        return (
          <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
            已安排
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            待处理
          </span>
        );
    }
  };

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
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 p-2 text-white/80 hover:text-white transition-colors bg-black/10 rounded-full backdrop-blur-sm"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-white/80 hover:text-white transition-colors bg-black/10 rounded-full backdrop-blur-sm"
        >
          <Menu size={24} />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-12 mt-2 w-40 bg-white rounded-xl shadow-lg z-50 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div
              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
              onClick={() => {
                setShowMenu(false);
                setIsEditing(!isEditing);
              }}
            >
              <Edit2 size={18} className="mr-3 text-blue-500" />
              <span className="text-sm font-medium">{isEditing ? '退出编辑' : '编辑模式'}</span>
            </div>

            <div
              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
              onClick={() => {
                setShowMenu(false);
                navigate('/song-request/trash');
              }}
            >
              <Trash2 size={18} className="mr-3 text-red-500" />
              <span className="text-sm font-medium">回收站</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center -mt-6 relative z-10 mb-4">
        <div className="bg-white rounded-full p-1 shadow-md flex space-x-1">
          <button
            onClick={() => setActiveTab('latest')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'latest'
                ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center"><Clock size={14} className="mr-1" /> 最新</span>
          </button>
          <button
            onClick={() => setActiveTab('hot')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'hot'
                ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center"><Flame size={14} className="mr-1" /> 热门</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4">
        {sortedRequests.map((req) => (
          <div
            key={req.id}
            onClick={() => {
              if (!isEditing) openEditForm(req);
            }}
            className={`rounded-2xl p-4 shadow-sm border relative overflow-hidden group transition-all bg-white border-pink-100 ${
              isEditing ? 'cursor-default' : 'cursor-pointer hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{req.songName}</h3>
                {req.artist && <p className="text-xs text-gray-500">{req.artist}</p>}
              </div>
              {getStatusBadge(req.status)}
            </div>

            {req.message && (
              <div className="bg-pink-50 rounded-xl p-3 text-sm text-gray-600 mb-3 relative">
                <div className="absolute -top-1 left-4 w-2 h-2 bg-pink-50 rotate-45"></div>
                "{req.message}"
              </div>
            )}

            <div className="flex justify-end items-center text-gray-400 text-xs gap-3">
              {isEditing ? (
                <div className="flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditForm(req);
                    }}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(req.id);
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    likeRequest(req.id);
                  }}
                  className="flex items-center space-x-1 hover:text-pink-500 transition-colors group"
                >
                  <Heart size={16} className={`group-active:scale-125 transition-transform ${req.likes > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
                  <span>{req.likes}</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {sortedRequests.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
            暂无点歌记录
          </div>
        ) : null}

        <div className="h-36"></div>
      </div>

      {!isEditing && (
        <div className="fixed left-1/2 -translate-x-1/2 w-full max-w-md px-4 pt-4 pb-3 bg-gradient-to-t from-white via-white to-transparent z-40 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)]">
          <button
            onClick={openCreateForm}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-bold shadow-lg shadow-pink-500/30 flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all"
          >
            参与点歌
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Music className="mr-2 text-pink-500" /> {editingId ? '编辑点歌' : '我要点歌'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">想听什么歌？<span className="text-red-500">*</span></label>
                <input
                  autoFocus
                  type="text"
                  required
                  placeholder="歌名"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">歌手（选填）</label>
                <input
                  type="text"
                  placeholder="歌手名"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">想说的话（选填）</label>
                <textarea
                  rows={3}
                  placeholder="写下你的心情或祝福..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all flex items-center justify-center"
                >
                  <Send size={18} className="mr-2" /> {editingId ? '保存' : '提交'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
