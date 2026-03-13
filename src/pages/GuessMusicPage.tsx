import { ArrowDown, ArrowLeft, ArrowUp, Check, Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuessMusicStore, type GuessLocationKey } from '../store/useGuessMusicStore';
import { useAuthStore } from '../store/useAuthStore';
import { isAdminEmail } from '../lib/permissions';

type SortKey = 'count' | 'rate' | 'rank' | 'participationCount' | null;
type SortDirection = 'asc' | 'desc';

export const GuessMusicPage = () => {
  const navigate = useNavigate();
  const locationKey: GuessLocationKey = 'gx-egg';
  const locationTitle = '校园路演听歌识曲榜';
  const bannerImageUrl = `${import.meta.env.BASE_URL}images/roadshow/location-select-banner.png`;

  const { users, addUser, updateUser, deleteUser, setActiveLocation, isLoading } = useGuessMusicStore();
  const isAdmin = useAuthStore((state) => isAdminEmail(state.user?.email));
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'rank',
    direction: 'asc',
  });

  useEffect(() => {
    void setActiveLocation(locationKey);
  }, [locationKey, setActiveLocation]);

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...(users || [])];

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      result = result.filter((user) => user.name?.toLowerCase().includes(keyword));
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortConfig.key === 'count') {
          valA = a.count;
          valB = b.count;
        } else if (sortConfig.key === 'rate') {
          valA = Number.parseFloat(a.rate);
          valB = Number.parseFloat(b.rate);
        } else if (sortConfig.key === 'rank') {
          valA = a.rank;
          valB = b.rank;
        } else if (sortConfig.key === 'participationCount') {
          valA = a.participationCount;
          valB = b.participationCount;
        }

        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [users, searchTerm, sortConfig]);

  const handleAddUser = () => {
    if (!isAdmin) return;
    void addUser('新选手', 0, 1);
  };

  const editable = isAdmin && isEditing;

  return (
    <div className="min-h-screen bg-teal-50/50">
      <div className="relative h-48 w-full overflow-hidden rounded-b-[2rem] shadow-md">
        <img src={bannerImageUrl} alt="路演背景图" className="absolute inset-0 h-full w-full object-cover" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow-md">{locationTitle}</h1>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 rounded-full bg-black/10 p-2 text-white/80 backdrop-blur-sm transition-colors hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>

        {isAdmin ? (
          <button
            onClick={() => setIsEditing((v) => !v)}
            className="absolute top-4 right-4 rounded-full bg-black/10 p-2 text-white/80 backdrop-blur-sm transition-colors hover:text-white"
          >
            {isEditing ? <Check size={24} /> : <Edit2 size={24} />}
          </button>
        ) : null}
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-md px-4 pb-10">
        <div className="rounded-3xl border border-white/50 bg-white/40 p-2 shadow-lg backdrop-blur-sm">
          <div className="flex items-center rounded-t-2xl bg-gradient-to-r from-jieyou-mint to-teal-400 px-4 py-3 text-sm font-bold text-white shadow-sm">
            <div
              className="flex w-10 cursor-pointer flex-col items-center justify-center rounded py-1 text-center transition-colors hover:bg-white/10"
              onClick={() => handleSort('rank')}
            >
              <div className="flex items-center">
                排名
                <div className="-space-y-1 ml-0.5 flex flex-col">
                  <ArrowUp size={8} className={sortConfig.key === 'rank' && sortConfig.direction === 'asc' ? 'text-white' : 'text-white/40'} />
                  <ArrowDown size={8} className={sortConfig.key === 'rank' && sortConfig.direction === 'desc' ? 'text-white' : 'text-white/40'} />
                </div>
              </div>
            </div>

            <div className="group relative flex-1 text-center">
              <div className="flex cursor-pointer items-center justify-center rounded py-1 transition-colors hover:bg-white/10" onClick={() => setShowSearch((v) => !v)}>
                昵称
                <Search size={14} className="ml-1 opacity-70" />
              </div>

              {showSearch ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-teal-100 bg-white p-2 shadow-xl">
                  <input
                    autoFocus
                    type="text"
                    placeholder="搜索昵称..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 focus:border-teal-500 focus:outline-none"
                    onClick={(event) => event.stopPropagation()}
                  />
                </div>
              ) : null}
            </div>

            <div
              className="flex w-16 cursor-pointer flex-col items-center justify-center rounded py-1 text-center transition-colors hover:bg-white/10"
              onClick={() => handleSort('count')}
            >
              <div className="flex items-center">
                答对数
                <div className="-space-y-1 ml-0.5 flex flex-col">
                  <ArrowUp size={8} className={sortConfig.key === 'count' && sortConfig.direction === 'asc' ? 'text-white' : 'text-white/40'} />
                  <ArrowDown size={8} className={sortConfig.key === 'count' && sortConfig.direction === 'desc' ? 'text-white' : 'text-white/40'} />
                </div>
              </div>
            </div>

            <div
              className="flex w-16 cursor-pointer flex-col items-center justify-center rounded py-1 text-center transition-colors hover:bg-white/10"
              onClick={() => handleSort('rate')}
            >
              <div className="flex items-center">
                答对率
                <div className="-space-y-1 ml-0.5 flex flex-col">
                  <ArrowUp size={8} className={sortConfig.key === 'rate' && sortConfig.direction === 'asc' ? 'text-white' : 'text-white/40'} />
                  <ArrowDown size={8} className={sortConfig.key === 'rate' && sortConfig.direction === 'desc' ? 'text-white' : 'text-white/40'} />
                </div>
              </div>
            </div>

            <div
              className="flex w-16 cursor-pointer flex-col items-center justify-center rounded py-1 text-center transition-colors hover:bg-white/10"
              onClick={() => handleSort('participationCount')}
            >
              <div className="flex items-center">
                参与
                <div className="-space-y-1 ml-0.5 flex flex-col">
                  <ArrowUp
                    size={8}
                    className={sortConfig.key === 'participationCount' && sortConfig.direction === 'asc' ? 'text-white' : 'text-white/40'}
                  />
                  <ArrowDown
                    size={8}
                    className={sortConfig.key === 'participationCount' && sortConfig.direction === 'desc' ? 'text-white' : 'text-white/40'}
                  />
                </div>
              </div>
            </div>
            {editable ? <div className="w-8"></div> : null}
          </div>

          <div className="mt-2 space-y-2 px-1">
            {isLoading ? (
              <div className="rounded-xl bg-white/50 py-10 text-center text-gray-400">加载中...</div>
            ) : filteredAndSortedUsers.length > 0 ? (
              filteredAndSortedUsers.map((item) => (
                <div key={item.id} className="flex items-center rounded-xl border border-teal-100/50 bg-white px-4 py-3 text-sm shadow-sm transition-shadow hover:shadow-md">
                  <div className="w-10 flex-shrink-0 text-center">
                    <span className={`text-lg font-bold ${item.rank <= 3 ? 'text-teal-500' : 'text-gray-500'}`}>{item.rank}</span>
                  </div>

                  <div className="min-w-0 flex-1 px-1">
                    {editable ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(event) => void updateUser(item.id, event.target.value, item.count, item.participationCount)}
                        className="w-full border-b border-teal-200 bg-gray-50 text-center text-gray-700 outline-none focus:border-teal-500"
                      />
                    ) : (
                      <div className="truncate text-center font-medium text-gray-700">{item.name}</div>
                    )}
                  </div>

                  <div className="w-16 flex-shrink-0 text-center">
                    {editable ? (
                      <input
                        type="number"
                        value={item.count}
                        onChange={(event) => void updateUser(item.id, item.name, Number(event.target.value), item.participationCount)}
                        className="w-full border-b border-teal-200 bg-gray-50 text-center font-bold text-teal-600 outline-none focus:border-teal-500"
                      />
                    ) : (
                      <div className="font-bold text-teal-600">{item.count}</div>
                    )}
                  </div>

                  <div className="w-16 flex-shrink-0 truncate text-center text-xs text-gray-500">{item.rate}</div>

                  <div className="w-16 flex-shrink-0 text-center">
                    {editable ? (
                      <input
                        type="number"
                        value={item.participationCount}
                        onChange={(event) => void updateUser(item.id, item.name, item.count, Number(event.target.value))}
                        className="w-full border-b border-teal-200 bg-gray-50 text-center text-xs text-gray-500 outline-none focus:border-teal-500"
                      />
                    ) : (
                      <div
                        onClick={() => navigate(`/guess-music/history/${item.id}?location=${locationKey}`)}
                        className="cursor-pointer py-1 text-xs text-gray-500 transition-colors hover:text-teal-500 hover:underline"
                      >
                        {item.participationCount}次
                      </div>
                    )}
                  </div>

                  {editable ? (
                    <button onClick={() => void deleteUser(item.id)} className="flex w-8 flex-shrink-0 justify-center text-red-400 transition-colors hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-white/50 py-10 text-center text-gray-400">暂无数据</div>
            )}
          </div>

          {editable ? (
            <button
              onClick={handleAddUser}
              className="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl border-2 border-dashed border-teal-300 py-3 text-teal-400 transition-colors hover:bg-teal-50"
            >
              <Plus size={20} />
              <span>添加选手</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
