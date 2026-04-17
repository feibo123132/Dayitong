import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, GripVertical, Guitar, Medal, Trash2 } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { useRankingStore, type User } from '../store/useRankingStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';

interface LiveRankingProps {
  limit?: number;
  editable?: boolean;
  selectable?: boolean;
  selectedUserIds?: string[];
  onToggleSelect?: (userId: string) => void;
  reorderable?: boolean;
  onReorder?: (orderedUserIds: string[]) => void;
  searchKeyword?: string;
}

type RankingDraft = {
  name: string;
  score: string;
};

type RankingSectionKey = 'top10' | 'top50' | 'top200';

type DisplayUser = {
  user: User;
  effectiveRank: number;
};

const SECTION_DEFINITIONS: Array<{
  key: RankingSectionKey;
  title: string;
  minRank: number;
  maxRank: number;
}> = [
  { key: 'top10', title: '1-10名', minRank: 1, maxRank: 10 },
  { key: 'top50', title: '11-50名', minRank: 11, maxRank: 50 },
  { key: 'top200', title: '51-200名', minRank: 51, maxRank: 200 },
];

export const LiveRanking = ({
  limit,
  editable = false,
  selectable = false,
  selectedUserIds = [],
  onToggleSelect,
  reorderable = false,
  onReorder,
  searchKeyword = '',
}: LiveRankingProps) => {
  const { users, updateUser, deleteUser, error } = useRankingStore();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Record<string, RankingDraft>>({});
  const [draggingUserId, setDraggingUserId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<RankingSectionKey, boolean>>({
    top10: true,
    top50: true,
    top200: true,
  });

  const selectedUserIdSet = new Set(selectedUserIds);
  const isReorderMode = editable && reorderable && !selectable;
  const useSectionedView = !limit;
  const normalizedSearchKeyword = searchKeyword.trim().toLowerCase();
  const hasSearchKeyword = normalizedSearchKeyword.length > 0;

  const displayUsers = limit ? (users || []).slice(0, limit) : (users || []);
  const filteredDisplayUsers = hasSearchKeyword
    ? displayUsers.filter((user) => {
        const candidates = [user.name, user.id, user.code ?? ''];
        return candidates.some((candidate) => candidate.toLowerCase().includes(normalizedSearchKeyword));
      })
    : displayUsers;
  const displayUsersWithRank: DisplayUser[] = displayUsers.map((user, index) => ({
    user,
    effectiveRank: isReorderMode ? index + 1 : user.rank,
  }));
  const filteredUsersWithRank: DisplayUser[] = filteredDisplayUsers.map((user) => {
    const existing = displayUsersWithRank.find((item) => item.user.id === user.id);
    return existing ?? { user, effectiveRank: isReorderMode ? 0 : user.rank };
  });

  const rankingSections = SECTION_DEFINITIONS.map((section) => ({
    ...section,
    users: filteredUsersWithRank.filter((item) => item.effectiveRank >= section.minRank && item.effectiveRank <= section.maxRank),
  }));
  const visibleSections = hasSearchKeyword ? rankingSections.filter((section) => section.users.length > 0) : rankingSections;

  const getDraft = (user: User): RankingDraft => drafts[user.id] ?? { name: user.name, score: String(user.score) };

  const updateDraft = (user: User, field: keyof RankingDraft, value: string) => {
    setDrafts((previous) => {
      const current = previous[user.id] ?? { name: user.name, score: String(user.score) };
      return {
        ...previous,
        [user.id]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const commitDraft = async (user: User) => {
    const draft = getDraft(user);
    const nextName = draft.name.trim() || user.name;
    const parsedScore = Number.parseInt(draft.score, 10);
    const nextScore = Number.isFinite(parsedScore) ? parsedScore : user.score;

    if (nextName === user.name && nextScore === user.score) {
      setDrafts((previous) => {
        if (!(user.id in previous)) return previous;
        const next = { ...previous };
        delete next[user.id];
        return next;
      });
      return;
    }

    await updateUser(user.id, nextName, nextScore);
    setDrafts((previous) => {
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

  const reorderUserIds = (sourceUserId: string, targetUserId: string): string[] => {
    const userIds = displayUsersWithRank.map((item) => item.user.id);
    const fromIndex = userIds.indexOf(sourceUserId);
    const toIndex = userIds.indexOf(targetUserId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return userIds;

    const nextUserIds = [...userIds];
    const [movedId] = nextUserIds.splice(fromIndex, 1);
    nextUserIds.splice(toIndex, 0, movedId);
    return nextUserIds;
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 2:
        return {
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
        };
      case 3:
        return {
          iconColor: 'text-orange-400',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        };
      default:
        return {
          iconColor: 'text-gray-300',
          bgColor: 'bg-white',
          borderColor: 'border-transparent',
        };
    }
  };

  const toggleSection = (key: RankingSectionKey) => {
    setCollapsedSections((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const renderUserCard = (displayUser: DisplayUser) => {
    const { user, effectiveRank } = displayUser;
    const style = getRankStyle(effectiveRank);
    const isTop3 = effectiveRank <= 3;

    return (
      <motion.div
        key={user.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={() => {
          if (selectable) {
            onToggleSelect?.(user.id);
            return;
          }
          if (!editable) {
            navigate(`/ranking/${user.id}`);
          }
        }}
        className={twMerge(
          clsx(
            'rounded-3xl p-4 flex items-center shadow-sm border transition-all duration-300',
            editable ? 'cursor-default' : 'cursor-pointer hover:shadow-md active:scale-[0.98]',
            isTop3 ? style.bgColor : 'bg-white',
            isTop3 ? style.borderColor : 'border-transparent hover:border-jieyou-mint',
            selectable && selectedUserIdSet.has(user.id) && 'ring-2 ring-jieyou-mint/60 border-jieyou-mint/50',
          ),
        )}
        onDragOver={(event) => {
          if (!isReorderMode || !draggingUserId) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(event) => {
          if (!isReorderMode || !draggingUserId) return;
          event.preventDefault();
          const nextUserIds = reorderUserIds(draggingUserId, user.id);
          setDraggingUserId(null);
          onReorder?.(nextUserIds);
        }}
        onDragEnd={() => setDraggingUserId(null)}
      >
        {isReorderMode ? (
          <button
            type="button"
            draggable
            onDragStart={(event) => {
              setDraggingUserId(user.id);
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', user.id);
            }}
            onClick={(event) => event.preventDefault()}
            className="mr-1 rounded p-1 text-gray-300 transition-colors hover:text-gray-500 cursor-grab active:cursor-grabbing"
            aria-label="拖动排序"
          >
            <GripVertical size={16} />
          </button>
        ) : null}
        <div className="w-8 flex justify-center flex-shrink-0">
          {isTop3 ? (
            <Medal size={24} className={style.iconColor} />
          ) : (
            <span className="font-bold text-xl text-gray-400">{effectiveRank}</span>
          )}
        </div>

        <div
          className={clsx(
            'w-10 h-10 rounded-full flex items-center justify-center mx-3 text-jieyou-text transition-all flex-shrink-0',
            isTop3 ? 'bg-white shadow-sm scale-110' : 'bg-jieyou-gray',
          )}
        >
          <Guitar size={20} className={isTop3 ? style.iconColor : 'text-gray-500'} />
        </div>

        <div className="flex-1 min-w-0 mr-2">
          {editable ? (
            <input
              type="text"
              value={getDraft(user).name}
              onChange={(event) => updateDraft(user, 'name', event.target.value)}
              onBlur={() => void commitDraft(user)}
              onKeyDown={handleEnterToCommit}
              className="w-full bg-transparent border-b border-gray-300 focus:border-jieyou-mint outline-none text-jieyou-text font-medium"
            />
          ) : (
            <div className={clsx('font-medium text-jieyou-text truncate', isTop3 && 'font-bold')}>{user.name}</div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {selectable ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleSelect?.(user.id);
              }}
              className="text-jieyou-mint"
              aria-label={selectedUserIdSet.has(user.id) ? '取消选择用户' : '选择用户'}
            >
              {selectedUserIdSet.has(user.id) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
          ) : null}
          {editable ? (
            <input
              type="number"
              value={getDraft(user).score}
              onChange={(event) => updateDraft(user, 'score', event.target.value)}
              onBlur={() => void commitDraft(user)}
              onKeyDown={handleEnterToCommit}
              className={clsx(
                'w-16 bg-transparent border-b border-gray-300 focus:border-jieyou-mint outline-none font-bold text-lg text-right',
                isTop3 ? style.iconColor : 'text-jieyou-text',
              )}
            />
          ) : (
            <div className={clsx('font-bold text-lg', isTop3 ? style.iconColor : 'text-jieyou-text')}>{user.score}</div>
          )}

          {editable && !selectable ? (
            <button
              onClick={() => deleteUser(user.id)}
              className="p-1 text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          ) : null}
        </div>
      </motion.div>
    );
  };

  return (
    <ul className="space-y-3">
      <AnimatePresence>
        {error ? (
          <motion.div
            key="ranking-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-xs text-red-500"
          >
            数据加载失败：{error}
          </motion.div>
        ) : null}

        {filteredUsersWithRank.length > 0 ? (
          useSectionedView ? (
            visibleSections.map((section) => {
              const isCollapsed = hasSearchKeyword ? false : collapsedSections[section.key];
              const isEmpty = section.users.length === 0;

              return (
                <motion.li
                  key={section.key}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-gray-100 bg-white/70 p-2 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-white"
                  >
                    <div>
                      <div className="text-sm font-bold text-gray-700">{section.title}</div>
                      <div className="text-xs text-gray-400">{isEmpty ? '暂无用户' : `共 ${section.users.length} 人`}</div>
                    </div>
                    <span className="text-base leading-none text-jieyou-mint">{isCollapsed ? '›' : '⌄'}</span>
                  </button>

                  {!isCollapsed ? (
                    <div className="space-y-3 pt-2">
                      {isEmpty ? (
                        <div className="rounded-xl bg-white py-6 text-center text-sm text-gray-400">该分组暂无用户</div>
                      ) : (
                        section.users.map(renderUserCard)
                      )}
                    </div>
                  ) : null}
                </motion.li>
              );
            })
          ) : (
            filteredUsersWithRank.map(renderUserCard)
          )
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400 bg-white/50 rounded-2xl"
          >
            暂无数据
          </motion.div>
        )}
      </AnimatePresence>
    </ul>
  );
};
