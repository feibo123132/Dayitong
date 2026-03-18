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
}

type RankingDraft = {
  name: string;
  score: string;
};

export const LiveRanking = ({
  limit,
  editable = false,
  selectable = false,
  selectedUserIds = [],
  onToggleSelect,
  reorderable = false,
  onReorder,
}: LiveRankingProps) => {
  const { users, updateUser, deleteUser, error } = useRankingStore();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Record<string, RankingDraft>>({});
  const [draggingUserId, setDraggingUserId] = useState<string | null>(null);
  const selectedUserIdSet = new Set(selectedUserIds);
  const isReorderMode = editable && reorderable && !selectable;

  // Take only top 5 for preview, or all if no limit
  const displayUsers = limit ? (users || []).slice(0, limit) : (users || []);

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
    const userIds = displayUsers.map((user) => user.id);
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

        {displayUsers.length > 0 ? (
          displayUsers.map((user, index) => {
          const effectiveRank = isReorderMode ? index + 1 : user.rank;
          const style = getRankStyle(effectiveRank);
          const isTop3 = effectiveRank <= 3;

          return (
            <motion.li
              key={user.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                  "rounded-3xl p-4 flex items-center shadow-sm border transition-all duration-300",
                  editable ? "cursor-default" : "cursor-pointer hover:shadow-md active:scale-[0.98]",
                  isTop3 ? style.bgColor : "bg-white",
                  isTop3 ? style.borderColor : "border-transparent hover:border-jieyou-mint",
                  selectable && selectedUserIdSet.has(user.id) && "ring-2 ring-jieyou-mint/60 border-jieyou-mint/50"
                )
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
              
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center mx-3 text-jieyou-text transition-all flex-shrink-0",
                isTop3 ? "bg-white shadow-sm scale-110" : "bg-jieyou-gray"
              )}>
                <Guitar size={20} className={isTop3 ? style.iconColor : "text-gray-500"} />
              </div>
              
              <div className="flex-1 min-w-0 mr-2">
                {editable ? (
                  <input 
                    type="text" 
                    value={getDraft(user).name}
                    onChange={(e) => updateDraft(user, 'name', e.target.value)}
                    onBlur={() => void commitDraft(user)}
                    onKeyDown={handleEnterToCommit}
                    className="w-full bg-transparent border-b border-gray-300 focus:border-jieyou-mint outline-none text-jieyou-text font-medium"
                  />
                ) : (
                  <div className={clsx(
                    "font-medium text-jieyou-text truncate",
                    isTop3 && "font-bold"
                  )}>{user.name}</div>
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
                    onChange={(e) => updateDraft(user, 'score', e.target.value)}
                    onBlur={() => void commitDraft(user)}
                    onKeyDown={handleEnterToCommit}
                    className={clsx(
                      "w-16 bg-transparent border-b border-gray-300 focus:border-jieyou-mint outline-none font-bold text-lg text-right",
                      isTop3 ? style.iconColor : "text-jieyou-text"
                    )}
                  />
                ) : (
                  <div className={clsx(
                    "font-bold text-lg",
                    isTop3 ? style.iconColor : "text-jieyou-text"
                  )}>
                    {user.score}
                  </div>
                )}
                
                {editable && !selectable && (
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </motion.li>
          );
        })
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
