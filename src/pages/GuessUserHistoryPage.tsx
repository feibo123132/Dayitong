import { ArrowLeft, Calendar, Cloud, Edit2, MapPin, PartyPopper, Save, Smile, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useGuessMusicStore, type GuessLocationKey } from '../store/useGuessMusicStore';
import type { HistoryRecord } from '../types/history';

const getLocationKey = (value: string | null): GuessLocationKey => {
  if (value === 'nanhu') return 'nanhu';
  if (value === 'gx-garden') return 'gx-garden';
  return 'gx-egg';
};

export const GuessUserHistoryPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const locationKey = getLocationKey(searchParams.get('location'));
  const { users, updateUserHistory, setActiveLocation, isLoading } = useGuessMusicStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<HistoryRecord>>({});

  useEffect(() => {
    void setActiveLocation(locationKey);
  }, [locationKey, setActiveLocation]);

  const user = users.find((item) => item.id === userId);
  const history = user?.history ?? [];

  const startEdit = (record: HistoryRecord) => {
    setEditingId(record.id);
    setEditForm(record);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!userId || !editingId) return;
    void updateUserHistory(userId, editingId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50/50">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">未找到用户</p>
          <button onClick={() => navigate(-1)} className="text-orange-500 hover:underline">
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-50/50 pb-10">
      <div className="bg-gradient-to-r from-jieyou-mint to-teal-400 pt-12 pb-20 px-6 relative rounded-b-[2.5rem] shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 text-white/80 hover:text-white transition-colors bg-black/10 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-1">{user.name} 的听歌之旅</h1>
          <p className="opacity-90 text-sm">
            累计参与 {user.participationCount} 次 · 答对 {user.count} 首
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10">
        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-teal-100 relative overflow-hidden group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-jieyou-mint to-teal-300"></div>

                {editingId === item.id ? (
                  <div className="pl-3 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-teal-600">编辑记录</span>
                      <div className="flex space-x-2">
                        <button onClick={saveEdit} className="p-1 text-teal-500 hover:bg-teal-50 rounded-full">
                          <Save size={18} />
                        </button>
                        <button onClick={cancelEdit} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full">
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">日期</label>
                        <input
                          type="date"
                          value={editForm.date || ''}
                          onChange={(event) => setEditForm({ ...editForm, date: event.target.value })}
                          className="w-full text-sm border-b border-gray-200 focus:border-teal-500 outline-none py-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">答对数 / 总数</label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="0"
                            max={editForm.total}
                            value={editForm.score ?? 0}
                            onChange={(event) => setEditForm({ ...editForm, score: Number(event.target.value) })}
                            className="w-12 text-sm border-b border-gray-200 focus:border-teal-500 outline-none py-1 text-center font-bold text-teal-600"
                          />
                          <span className="text-gray-400">/</span>
                          <input
                            type="number"
                            min="1"
                            value={editForm.total ?? 4}
                            onChange={(event) => setEditForm({ ...editForm, total: Number(event.target.value) })}
                            className="w-12 text-sm border-b border-gray-200 focus:border-teal-500 outline-none py-1 text-center text-gray-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">地点</label>
                        <input
                          type="text"
                          value={editForm.location || ''}
                          onChange={(event) => setEditForm({ ...editForm, location: event.target.value })}
                          className="w-full text-sm border-b border-gray-200 focus:border-teal-500 outline-none py-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">天气</label>
                        <input
                          type="text"
                          value={editForm.weather || ''}
                          onChange={(event) => setEditForm({ ...editForm, weather: event.target.value })}
                          className="w-full text-sm border-b border-gray-200 focus:border-teal-500 outline-none py-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">心情</label>
                        <input
                          type="text"
                          value={editForm.mood || ''}
                          onChange={(event) => setEditForm({ ...editForm, mood: event.target.value })}
                          className="w-full text-sm border-b border-gray-200 focus:border-teal-500 outline-none py-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">节日 (选填)</label>
                        <input
                          type="text"
                          value={editForm.festival || ''}
                          onChange={(event) => setEditForm({ ...editForm, festival: event.target.value })}
                          className="w-full text-sm border-b border-gray-200 focus:border-teal-500 outline-none py-1"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-full transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>

                    <div className="flex justify-between items-start mb-3 pl-3">
                      <div className="flex items-center text-gray-800 font-bold text-lg">
                        <Calendar size={18} className="mr-2 text-teal-500" />
                        {item.date}
                      </div>
                      <div className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                        答对 {item.score}/{item.total}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 pl-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1.5 text-gray-400" />
                        {item.location}
                      </div>
                      <div className="flex items-center">
                        <Cloud size={14} className="mr-1.5 text-blue-400" />
                        {item.weather}
                      </div>
                      <div className="flex items-center">
                        <Smile size={14} className="mr-1.5 text-yellow-500" />
                        心情: {item.mood}
                      </div>
                      {item.festival ? (
                        <div className="flex items-center text-red-500 font-medium">
                          <PartyPopper size={14} className="mr-1.5" />
                          {item.festival}
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 bg-white/50 rounded-xl">暂无参与记录</div>
          )}
        </div>

        <div className="text-center text-gray-400 text-xs mt-8">只展示最近的参与记录</div>
      </div>
    </div>
  );
};
