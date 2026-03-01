import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRankingStore } from '../store/useRankingStore';
import { ArrowLeft, Edit2, Plus, Trash2, Check, X, Menu, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RankingUserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { users, addHistoryRecord, updateHistoryRecord, deleteHistoryRecord, restoreHistoryRecord, permanentDeleteHistoryRecord, cleanupTrash } = useRankingStore();
  
  const user = users.find(u => u.id === userId);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null); // Track which record is being edited
  const [showMenu, setShowMenu] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

  // Auto cleanup on mount
  useEffect(() => {
    cleanupTrash();
  }, [cleanupTrash]);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [scoreChange, setScoreChange] = useState('');

  // Reset form when closing
  useEffect(() => {
    if (!showAddForm) {
      setDate(new Date().toISOString().split('T')[0]);
      setReason('');
      setScoreChange('');
      setEditingRecordId(null);
    }
  }, [showAddForm]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">用户不存在</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-100 rounded-lg"
        >
          返回
        </button>
      </div>
    );
  }

  const handleEditClick = (record: any) => {
    // Only allow editing if NOT in trash mode
    if (showTrash) return;
    
    setEditingRecordId(record.id);
    setDate(record.date);
    setReason(record.reason);
    setScoreChange(String(record.scoreChange));
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !scoreChange) return;

    if (editingRecordId) {
      // Update existing record
      updateHistoryRecord(user.id, editingRecordId, {
        date,
        reason,
        scoreChange: Number(scoreChange)
      });
    } else {
      // Add new record
      addHistoryRecord(user.id, {
        date,
        reason,
        scoreChange: Number(scoreChange)
      });
    }

    setShowAddForm(false);
  };

  const handleDelete = (recordId: string) => {
    if (window.confirm('确定要将这条记录移入回收站吗？积分将自动扣除。')) {
      deleteHistoryRecord(user.id, recordId);
    }
  };

  const handleRestore = (recordId: string) => {
    restoreHistoryRecord(user.id, recordId);
  };

  const handlePermanentDelete = (recordId: string) => {
    if (window.confirm('确定要彻底删除这条记录吗？此操作无法撤销。')) {
      permanentDeleteHistoryRecord(user.id, recordId);
    }
  };

  // Filter records based on view mode (Trash or Normal)
  const displayRecords = user.history.filter(record => 
    showTrash ? !!record.deletedAt : !record.deletedAt
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <button 
          onClick={() => {
            if (showTrash) setShowTrash(false);
            else navigate(-1);
          }}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        
        <h1 className="text-lg font-bold text-gray-800">
          {showTrash ? '回收站' : user.name}
        </h1>
        
        {/* Menu Button (Replacing Edit Button) */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg z-20 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div 
                  className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
                  onClick={() => { setIsEditing(!isEditing); setShowMenu(false); setShowTrash(false); }}
                >
                  {isEditing ? <Check size={18} className="mr-3 text-green-500" /> : <Edit2 size={18} className="mr-3 text-blue-500" />}
                  <span className="text-sm font-medium">{isEditing ? '完成编辑' : '编辑模式'}</span>
                </div>
                <div 
                  className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
                  onClick={() => { setShowTrash(true); setShowMenu(false); setIsEditing(false); }}
                >
                  <Trash2 size={18} className="mr-3 text-gray-500" />
                  <span className="text-sm font-medium">回收站</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Card (Hide in Trash Mode) */}
      {!showTrash && (
        <div className="m-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/80 text-sm mb-1">当前排名</p>
              <p className="text-3xl font-bold">#{user.rank}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">累计积分</p>
              <p className="text-4xl font-bold">{user.score}</p>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-700">
            {showTrash ? '已删除记录 (7天后自动清除)' : '积分记录'}
          </h2>
          {isEditing && !showTrash && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center text-sm font-bold text-jieyou-mint bg-teal-50 px-3 py-1.5 rounded-full"
            >
              <Plus size={16} className="mr-1" />
              添加记录
            </button>
          )}
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {displayRecords.length > 0 ? (
              displayRecords.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  onClick={() => handleEditClick(record)}
                  className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden transition-all ${
                    !showTrash ? 'cursor-pointer hover:shadow-md hover:border-jieyou-mint/30 active:scale-[0.99]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{record.date}</p>
                      <p className={`font-bold text-lg ${showTrash ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {record.reason}
                      </p>
                      {showTrash && record.deletedAt && (
                        <p className="text-xs text-red-400 mt-1">
                          {Math.ceil((record.deletedAt + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))}天后过期
                        </p>
                      )}
                    </div>
                    <div className={`text-xl font-bold ${
                      showTrash ? 'text-gray-400' : (record.scoreChange > 0 ? 'text-orange-500' : 'text-gray-400')
                    }`}>
                      {record.scoreChange > 0 ? '+' : ''}{record.scoreChange}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-xs text-gray-400">变动后总分: {record.totalScore}</span>
                    
                    {showTrash ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleRestore(record.id)}
                          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center text-xs font-bold px-2"
                        >
                          <RefreshCcw size={14} className="mr-1" /> 恢复
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(record.id)}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors flex items-center text-xs font-bold px-2"
                        >
                          <Trash2 size={14} className="mr-1" /> 彻底删除
                        </button>
                      </div>
                    ) : (
                      isEditing && (
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                {showTrash ? '回收站空空如也' : '暂无积分记录'}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">{editingRecordId ? '编辑积分记录' : '添加积分记录'}</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-jieyou-mint"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">事由 / 动作</label>
                <input
                  type="text"
                  required
                  placeholder="例如：路演打赏"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-jieyou-mint"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">积分变动</label>
                <input
                  type="number"
                  required
                  placeholder="输入分值 (负数表示扣分)"
                  value={scoreChange}
                  onChange={(e) => setScoreChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-jieyou-mint font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-jieyou-mint to-teal-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all mt-2"
              >
                {editingRecordId ? '保存修改' : '确认添加'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
