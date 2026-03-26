import { ArrowDown, ArrowLeft, ArrowUp, Check, Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGuessMusicRankSections, getGuessMusicTableMetrics, type GuessMusicRankSectionKey } from '../lib/guessMusicRanking';
import { isAdminEmail } from '../lib/permissions';
import { useAuthStore } from '../store/useAuthStore';
import { useGuessMusicStore, type GuessLocationKey, type GuessUser } from '../store/useGuessMusicStore';

type SortKey = 'count' | 'rate' | 'rank' | 'participationCount' | null;
type SortDirection = 'asc' | 'desc';
type GuessUserDraft = {
  name: string;
  count: string;
  participationCount: string;
};

const toDraft = (user: { name: string; count: number; participationCount: number }): GuessUserDraft => ({
  name: user.name,
  count: String(user.count),
  participationCount: String(user.participationCount),
});

export const GuessMusicPage = () => {
  const navigate = useNavigate();
  const locationKey: GuessLocationKey = 'gx-egg';
  const locationTitle = '医大猜歌榜';
  const bannerImageUrl = `${import.meta.env.BASE_URL}images/roadshow/location-select-banner.png`;

  const { users, addUser, updateUser, deleteUser, setActiveLocation, isLoading, error } = useGuessMusicStore();
  const isAdmin = useAuthStore((state) => isAdminEmail(state.user?.email));
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [editDrafts, setEditDrafts] = useState<Record<string, GuessUserDraft>>({});
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'rank',
    direction: 'asc',
  });
  const [collapsedSections, setCollapsedSections] = useState<Record<GuessMusicRankSectionKey, boolean>>({
    top10: true,
    top50: true,
    top200: true,
  });
  const editable = isAdmin && isEditing;
  const tableMetrics = useMemo(() => getGuessMusicTableMetrics(editable), [editable]);

  useEffect(() => {
    void setActiveLocation(locationKey);
  }, [locationKey, setActiveLocation]);

  const updateDraft = (userId: string, field: keyof GuessUserDraft, value: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;

    setEditDrafts((previous) => {
      const current = previous[userId] ?? toDraft(user);
      return {
        ...previous,
        [userId]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const commitDraft = async (userId: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;

    const draft = editDrafts[userId] ?? toDraft(user);
    const nextName = draft.name.trim() || user.name;
    const parsedCount = Number.parseInt(draft.count, 10);
    const parsedParticipationCount = Number.parseInt(draft.participationCount, 10);
    const nextCount = Number.isFinite(parsedCount) ? parsedCount : user.count;
    const nextParticipationCount = Number.isFinite(parsedParticipationCount) ? parsedParticipationCount : user.participationCount;

    if (nextName === user.name && nextCount === user.count && nextParticipationCount === user.participationCount) {
      setEditDrafts((previous) => {
        if (!(user.id in previous)) return previous;
        const next = { ...previous };
        delete next[user.id];
        return next;
      });
      return;
    }

    await updateUser(user.id, nextName, nextCount, nextParticipationCount);
    setEditDrafts((previous) => {
      if (!(user.id in previous)) return previous;
      const next = { ...previous };
      delete next[user.id];
      return next;
    });
  };

  const handleEnterToCommit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.currentTarget.blur();
    }
  };

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

  const toggleSection = (key: GuessMusicRankSectionKey) => {
    setCollapsedSections((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const rankSections = useMemo(() => getGuessMusicRankSections(filteredAndSortedUsers), [filteredAndSortedUsers]);

  const renderUserRow = (item: GuessUser) => (
    <div
      key={item.id}
      className="grid items-center rounded-xl border border-teal-100/50 bg-white px-4 py-3 text-sm shadow-sm transition-shadow hover:shadow-md"
      style={{ gridTemplateColumns: tableMetrics.templateColumns }}
    >
      <div className="text-center">
        <span className={`text-lg font-bold ${item.rank <= 3 ? 'text-teal-500' : 'text-gray-500'}`}>{item.rank}</span>
      </div>

      <div className="overflow-hidden px-1 text-center">
        {editable ? (
          <input
            type="text"
            value={(editDrafts[item.id] ?? toDraft(item)).name}
            onChange={(event) => updateDraft(item.id, 'name', event.target.value)}
            onBlur={() => void commitDraft(item.id)}
            onKeyDown={handleEnterToCommit}
            className="w-full truncate border-b border-teal-200 bg-gray-50 text-center text-gray-700 outline-none focus:border-teal-500"
          />
        ) : (
          <div className="truncate font-medium text-gray-700">{item.name}</div>
        )}
      </div>

      <div className="text-center">
        {editable ? (
          <input
            type="number"
            value={(editDrafts[item.id] ?? toDraft(item)).count}
            onChange={(event) => updateDraft(item.id, 'count', event.target.value)}
            onBlur={() => void commitDraft(item.id)}
            onKeyDown={handleEnterToCommit}
            className="w-full border-b border-teal-200 bg-gray-50 text-center font-bold text-teal-600 outline-none focus:border-teal-500"
          />
        ) : (
          <div className="font-bold text-teal-600">{item.count}</div>
        )}
      </div>

      <div className="truncate text-center text-xs text-gray-500">{item.rate}</div>

      <div className="text-center">
        {editable ? (
          <input
            type="number"
            min="0"
            value={(editDrafts[item.id] ?? toDraft(item)).participationCount}
            onChange={(event) => updateDraft(item.id, 'participationCount', event.target.value)}
            onBlur={() => void commitDraft(item.id)}
            onKeyDown={handleEnterToCommit}
            className="w-full border-b border-teal-200 bg-gray-50 text-center font-bold text-gray-600 outline-none focus:border-teal-500"
          />
        ) : (
          <div className="font-medium text-gray-600">{item.participationCount}</div>
        )}
      </div>

      {editable ? (
        <button onClick={() => void deleteUser(item.id)} className="flex justify-center text-red-400 transition-colors hover:text-red-600">
          <Trash2 size={16} />
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-teal-50/50">
      <div className="relative h-48 w-full overflow-hidden rounded-b-[2rem] shadow-md">
        <img src={bannerImageUrl} alt="医大猜歌榜横幅" className="absolute inset-0 h-full w-full object-cover" />

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
            onClick={() => {
              setEditDrafts({});
              setIsEditing((value) => !value);
            }}
            className="absolute top-4 right-4 rounded-full bg-black/10 p-2 text-white/80 backdrop-blur-sm transition-colors hover:text-white"
          >
            {isEditing ? <Check size={24} /> : <Edit2 size={24} />}
          </button>
        ) : null}
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-md px-4 pb-10">
        <div className="rounded-3xl border border-white/50 bg-white/40 p-2 shadow-lg backdrop-blur-sm">
          <div className="mt-2 px-1 pb-2">
            <div className="space-y-2 overflow-x-auto overflow-y-visible">
              <div style={{ minWidth: `${tableMetrics.tableMinWidth}px` }}>
                <div
                  className="grid items-center rounded-t-2xl bg-gradient-to-r from-jieyou-mint to-teal-400 px-4 py-3 text-sm font-bold text-white shadow-sm"
                  style={{ gridTemplateColumns: tableMetrics.templateColumns }}
                >
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded py-1 text-center transition-colors hover:bg-white/10"
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

                  <div className="group relative overflow-visible text-center">
                    <div className="flex cursor-pointer items-center justify-center truncate rounded py-1 transition-colors hover:bg-white/10" onClick={() => setShowSearch((value) => !value)}>
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
                    className="flex cursor-pointer flex-col items-center justify-center rounded py-1 text-center transition-colors hover:bg-white/10"
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
                    className="flex cursor-pointer flex-col items-center justify-center rounded py-1 text-center transition-colors hover:bg-white/10"
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
                    className="flex cursor-pointer flex-col items-center justify-center rounded py-1 text-center transition-colors hover:bg-white/10"
                    onClick={() => handleSort('participationCount')}
                  >
                    <div className="flex items-center">
                      次数
                      <div className="-space-y-1 ml-0.5 flex flex-col">
                        <ArrowUp size={8} className={sortConfig.key === 'participationCount' && sortConfig.direction === 'asc' ? 'text-white' : 'text-white/40'} />
                        <ArrowDown size={8} className={sortConfig.key === 'participationCount' && sortConfig.direction === 'desc' ? 'text-white' : 'text-white/40'} />
                      </div>
                    </div>
                  </div>

                  {editable ? <div></div> : null}
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-xs text-red-500">
                  数据加载失败：{error}
                </div>
              ) : null}
              {isLoading ? (
                <div className="rounded-xl bg-white/50 py-10 text-center text-gray-400">加载中...</div>
              ) : filteredAndSortedUsers.length > 0 ? (
                rankSections.map((section) => {
                  const isCollapsed = searchTerm ? false : collapsedSections[section.key];
                  const isEmpty = section.users.length === 0;

                  return (
                    <div key={section.key} className="rounded-2xl border border-white/60 bg-white/50 p-2 shadow-sm">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.key)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/70"
                      >
                        <div>
                          <div className="text-sm font-bold text-gray-700">{section.title}</div>
                          <div className="text-xs text-gray-400">{isEmpty ? '暂无选手' : `共 ${section.users.length} 人`}</div>
                        </div>

                        <div className="flex items-center text-teal-500">
                          <span className="text-base leading-none">{searchTerm || !isCollapsed ? '⌄' : '›'}</span>
                        </div>
                      </button>

                      {!isCollapsed ? (
                        <div className="pt-2">
                          {isEmpty ? (
                            <div className="rounded-xl bg-white/70 py-6 text-center text-sm text-gray-400">该分组暂无选手</div>
                          ) : (
                            <div className="space-y-2" style={{ minWidth: `${tableMetrics.tableMinWidth}px` }}>
                              {section.users.map(renderUserRow)}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl bg-white/50 py-10 text-center text-gray-400">暂无数据</div>
              )}
            </div>
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
