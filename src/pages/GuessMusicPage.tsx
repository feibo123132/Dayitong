import { ArrowDown, ArrowLeft, ArrowUp, Check, Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGuessMusicStore, type GuessLocationKey } from '../store/useGuessMusicStore';

type SortKey = 'count' | 'rate' | 'rank' | 'participationCount' | null;
type SortDirection = 'asc' | 'desc';

const getLocationKey = (value: string | null): GuessLocationKey => {
  if (value === 'nanhu') return 'nanhu';
  if (value === 'gx-garden') return 'gx-garden';
  return 'gx-egg';
};

const getLocationTitle = (location: GuessLocationKey): string => {
  if (location === 'nanhu') return '南湖听歌识曲榜';
  if (location === 'gx-garden') return '广西菜园听歌识曲榜';
  return '校园路演听歌识曲榜';
};

export const GuessMusicPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationKey = getLocationKey(searchParams.get('location'));
  const locationTitle = getLocationTitle(locationKey);
  const bannerImageUrl = `${import.meta.env.BASE_URL}images/roadshow/location-select-banner.png`;

  const { users, addUser, updateUser, deleteUser, setActiveLocation, isLoading } = useGuessMusicStore();
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
    void addUser('新选手', 0, 1);
  };

  return (
    <div className="min-h-screen bg-teal-50/50">
      <div className="relative h-48 w-full bg-gradient-to-r from-jieyou-mint to-teal-400 overflow-hidden rounded-b-[2rem] shadow-md">
        <img src={bannerImageUrl} alt="路演背景图" className="absolute inset-0 w-full h-full object-cover opacity-30" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-wide">{locationTitle}</h1>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 text-white/80 hover:text-white transition-colors bg-black/10 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft size={24} />
        </button>

        <button
          onClick={() => setIsEditing((v) => !v)}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors bg-black/10 rounded-full backdrop-blur-sm"
        >
          {isEditing ? <Check size={24} /> : <Edit2 size={24} />}
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10 relative z-10 pb-10">
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-2 shadow-lg border border-white/50">
          <div className="bg-gradient-to-r from-jieyou-mint to-teal-400 text-white rounded-t-2xl py-3 px-4 flex text-sm font-bold shadow-sm items-center">
            <div
              className="w-10 text-center cursor-pointer hover:bg-white/10 rounded py-1 transition-colors flex flex-col items-center justify-center"
              onClick={() => handleSort('rank')}
            >
              <div className="flex items-center">
                排名
                <div className="ml-0.5 flex flex-col -space-y-1">
                  <ArrowUp size={8} className={sortConfig.key === 'rank' && sortConfig.direction === 'asc' ? 'text-white' : 'text-white/40'} />
                  <ArrowDown size={8} className={sortConfig.key === 'rank' && sortConfig.direction === 'desc' ? 'text-white' : 'text-white/40'} />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center relative group">
              <div
                className="flex items-center justify-center cursor-pointer hover:bg-white/10 rounded py-1 transition-colors"
                onClick={() => setShowSearch((v) => !v)}
              >
                昵称
                <Search size={14} className="ml-1 opacity-70" />
              </div>

              {showSearch ? (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white p-2 rounded-xl shadow-xl z-20 border border-teal-100">
                  <input
                    autoFocus
                    type="text"
                    placeholder="搜索昵称..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-xs focus:outline-none focus:border-teal-500"
                    onClick={(event) => event.stopPropagation()}
                  />
                </div>
              ) : null}
            </div>

            <div
              className="w-16 text-center cursor-pointer hover:bg-white/10 rounded py-1 transition-colors flex flex-col items-center justify-center"
              onClick={() => handleSort('count')}
            >
              <div className="flex items-center">
                答对数
                <div className="ml-0.5 flex flex-col -space-y-1">
                  <ArrowUp size={8} className={sortConfig.key === 'count' && sortConfig.direction === 'asc' ? 'text-white' : 'text-white/40'} />
                  <ArrowDown size={8} className={sortConfig.key === 'count' && sortConfig.direction === 'desc' ? 'text-white' : 'text-white/40'} />
                </div>
              </div>
            </div>

            <div
              className="w-16 text-center cursor-pointer hover:bg-white/10 rounded py-1 transition-colors flex flex-col items-center justify-center"
              onClick={() => handleSort('rate')}
            >
              <div className="flex items-center">
                答对率
                <div className="ml-0.5 flex flex-col -space-y-1">
                  <ArrowUp size={8} className={sortConfig.key === 'rate' && sortConfig.direction === 'asc' ? 'text-white' : 'text-white/40'} />
                  <ArrowDown size={8} className={sortConfig.key === 'rate' && sortConfig.direction === 'desc' ? 'text-white' : 'text-white/40'} />
                </div>
              </div>
            </div>

            <div
              className="w-16 text-center cursor-pointer hover:bg-white/10 rounded py-1 transition-colors flex flex-col items-center justify-center"
              onClick={() => handleSort('participationCount')}
            >
              <div className="flex items-center">
                参与
                <div className="ml-0.5 flex flex-col -space-y-1">
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
            {isEditing ? <div className="w-8"></div> : null}
          </div>

          <div className="space-y-2 mt-2 px-1">
            {isLoading ? (
              <div className="text-center py-10 text-gray-400 bg-white/50 rounded-xl">加载中...</div>
            ) : filteredAndSortedUsers.length > 0 ? (
              filteredAndSortedUsers.map((item) => (
                <div key={item.id} className="bg-white rounded-xl py-3 px-4 flex items-center text-sm shadow-sm hover:shadow-md transition-shadow border border-teal-100/50">
                  <div className="w-10 text-center flex-shrink-0">
                    <span className={`font-bold text-lg ${item.rank <= 3 ? 'text-teal-500' : 'text-gray-500'}`}>{item.rank}</span>
                  </div>

                  <div className="flex-1 px-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(event) => void updateUser(item.id, event.target.value, item.count, item.participationCount)}
                        className="w-full text-center bg-gray-50 border-b border-teal-200 focus:border-teal-500 outline-none text-gray-700"
                      />
                    ) : (
                      <div className="text-center font-medium text-gray-700 truncate">{item.name}</div>
                    )}
                  </div>

                  <div className="w-16 text-center flex-shrink-0">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.count}
                        onChange={(event) => void updateUser(item.id, item.name, Number(event.target.value), item.participationCount)}
                        className="w-full text-center bg-gray-50 border-b border-teal-200 focus:border-teal-500 outline-none font-bold text-teal-600"
                      />
                    ) : (
                      <div className="font-bold text-teal-600">{item.count}</div>
                    )}
                  </div>

                  <div className="w-16 text-center text-gray-500 text-xs truncate flex-shrink-0">{item.rate}</div>

                  <div className="w-16 text-center flex-shrink-0">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.participationCount}
                        onChange={(event) => void updateUser(item.id, item.name, item.count, Number(event.target.value))}
                        className="w-full text-center bg-gray-50 border-b border-teal-200 focus:border-teal-500 outline-none text-gray-500 text-xs"
                      />
                    ) : (
                      <div
                        onClick={() => navigate(`/guess-music/history/${item.id}?location=${locationKey}`)}
                        className="text-gray-500 text-xs hover:text-teal-500 hover:underline cursor-pointer transition-colors py-1"
                      >
                        {item.participationCount}次
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <button onClick={() => void deleteUser(item.id)} className="w-8 flex justify-center text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 bg-white/50 rounded-xl">暂无数据</div>
            )}
          </div>

          {isEditing ? (
            <button
              onClick={handleAddUser}
              className="w-full py-3 mt-4 rounded-xl border-2 border-dashed border-teal-300 text-teal-400 hover:bg-teal-50 transition-colors flex items-center justify-center space-x-2"
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
