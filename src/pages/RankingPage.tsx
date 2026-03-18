import { useState } from 'react';
import { LiveRanking } from '../components/LiveRanking';
import { ArrowLeft, Edit2, Check, Plus, Menu, Gift, UsersRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRankingStore } from '../store/useRankingStore';
import { useAuthStore } from '../store/useAuthStore';
import { isAdminEmail } from '../lib/permissions';

const DEFAULT_BATCH_REASON = '猜歌但没答对全部';
const DEFAULT_BATCH_SCORE_CHANGE = '10';

export const RankingPage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isBatchSelecting, setIsBatchSelecting] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchReason, setBatchReason] = useState(DEFAULT_BATCH_REASON);
  const [batchScoreChange, setBatchScoreChange] = useState(DEFAULT_BATCH_SCORE_CHANGE);
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);

  const { addUser, addHistoryRecordBatch, reorderUsers } = useRankingStore();
  const isAdmin = useAuthStore((state) => isAdminEmail(state.user?.email));

  const handleAddUser = () => {
    if (!isAdmin) return;
    void addUser('新用户', 0);
  };

  const handleToggleSelectUser = (userId: string) => {
    setSelectedUserIds((previous) => {
      if (previous.includes(userId)) {
        return previous.filter((id) => id !== userId);
      }
      return [...previous, userId];
    });
  };

  const resetBatchState = () => {
    setIsBatchSelecting(false);
    setSelectedUserIds([]);
    setShowBatchModal(false);
    setBatchDate(new Date().toISOString().split('T')[0]);
    setBatchReason(DEFAULT_BATCH_REASON);
    setBatchScoreChange(DEFAULT_BATCH_SCORE_CHANGE);
    setIsBatchSubmitting(false);
  };

  const handleOpenBatchSelect = () => {
    if (!isAdmin) return;
    setShowMenu(false);
    setIsEditing(false);
    setIsBatchSelecting(true);
    setSelectedUserIds([]);
  };

  const handleBatchSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAdmin) return;
    if (!selectedUserIds.length) return;

    const reason = batchReason.trim();
    if (!reason) return;
    const scoreChange = Number(batchScoreChange);
    if (!Number.isFinite(scoreChange)) return;

    setIsBatchSubmitting(true);
    await addHistoryRecordBatch(selectedUserIds, {
      date: batchDate,
      reason,
      scoreChange,
    });
    resetBatchState();
  };

  const handleReorderUsers = (orderedUserIds: string[]) => {
    if (!isAdmin) return;
    void reorderUsers(orderedUserIds);
  };

  const parsedBatchScoreChange = Number(batchScoreChange);
  const isBatchScoreChangeValid = batchScoreChange.trim() !== '' && Number.isFinite(parsedBatchScoreChange);

  return (
    <div className="space-y-6">
      {/* Custom Header for Ranking Page */}
      <header className="sticky top-0 z-40 mb-4 -mx-4 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-3 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 transition-colors hover:text-jieyou-mint">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-jieyou-text">积分榜</h1>

        {/* Menu Button (Replacing Edit Button) */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 -mr-2 text-gray-400 transition-colors hover:text-gray-600">
            <Menu size={24} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
              <div className="animate-in slide-in-from-top-2 absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg fade-in">
                {isAdmin ? (
                  <>
                    <div
                      className="flex cursor-pointer items-center px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                      onClick={() => {
                        setIsEditing(!isEditing);
                        setIsBatchSelecting(false);
                        setShowMenu(false);
                      }}
                    >
                      {isEditing ? <Check size={18} className="mr-3 text-green-500" /> : <Edit2 size={18} className="mr-3 text-blue-500" />}
                      <span className="text-sm font-medium">{isEditing ? '完成编辑' : '编辑功能'}</span>
                    </div>
                    <div className="flex cursor-pointer items-center px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50" onClick={handleOpenBatchSelect}>
                      <UsersRound size={18} className="mr-3 text-emerald-500" />
                      <span className="text-sm font-medium">一键加分</span>
                    </div>
                  </>
                ) : null}
                <div
                  className="flex cursor-pointer items-center px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                  onClick={() => {
                    setShowMenu(false);
                    window.location.assign(`${import.meta.env.BASE_URL}points-reward.html`);
                  }}
                >
                  <Gift size={18} className="mr-3 text-pink-500" />
                  <span className="text-sm font-medium">积分换奖</span>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {isAdmin && isBatchSelecting ? (
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-sm text-emerald-700">请选择要加分的同学（可多选）。确认后统一填写日期、理由和积分变动。</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={resetBatchState}
              className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              取消
            </button>
            <button
              onClick={() => setShowBatchModal(true)}
              disabled={!selectedUserIds.length}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              确定已选（{selectedUserIds.length}）
            </button>
          </div>
        </section>
      ) : null}

      <LiveRanking
        editable={isAdmin && isEditing && !isBatchSelecting}
        selectable={isAdmin && isBatchSelecting}
        reorderable={isAdmin && isEditing && !isBatchSelecting}
        selectedUserIds={selectedUserIds}
        onToggleSelect={handleToggleSelectUser}
        onReorder={handleReorderUsers}
      />

      {isAdmin && isEditing && !isBatchSelecting ? (
        <p className="-mt-3 text-xs text-gray-400">可拖动每行左侧的拖拽手柄，调整排名顺序。</p>
      ) : null}

      {isAdmin && isEditing && !isBatchSelecting && (
        <button
          onClick={handleAddUser}
          className="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-gray-400 transition-colors hover:border-jieyou-mint hover:text-jieyou-mint"
        >
          <Plus size={20} />
          <span>添加用户</span>
        </button>
      )}

      {isAdmin && showBatchModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">批量添加积分记录</h3>
              <button onClick={() => setShowBatchModal(false)} className="text-gray-400 transition-colors hover:text-gray-600" aria-label="关闭弹窗">
                <X size={22} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(event) => void handleBatchSubmit(event)}>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">日期</label>
                <input
                  type="date"
                  required
                  value={batchDate}
                  onChange={(event) => setBatchDate(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-jieyou-mint focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">事由 / 动作</label>
                <input
                  type="text"
                  required
                  placeholder="例如：路演打赏"
                  value={batchReason}
                  onChange={(event) => setBatchReason(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-jieyou-mint focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">积分变动</label>
                <input
                  type="number"
                  required
                  placeholder="输入分值（负数表示扣分）"
                  value={batchScoreChange}
                  onChange={(event) => setBatchScoreChange(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono focus:border-jieyou-mint focus:outline-none"
                />
              </div>

              <p className="text-sm text-gray-500">
                本次将为 {selectedUserIds.length} 位同学统一变更积分：
                {isBatchScoreChangeValid && parsedBatchScoreChange > 0 ? '+' : ''}
                {isBatchScoreChangeValid ? parsedBatchScoreChange : '-'}
              </p>

              <button
                type="submit"
                disabled={!selectedUserIds.length || !batchReason.trim() || !isBatchScoreChangeValid || isBatchSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-jieyou-mint to-teal-500 py-3 font-bold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBatchSubmitting ? '处理中...' : '确认添加'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
