import { ArrowLeft, Candy, Gamepad2, Gift, Menu, MessageCircleHeart, Music, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSongRequestStore } from '../store/useSongRequestStore';
import { useAuthStore } from '../store/useAuthStore';
import { isAdminEmail } from '../lib/permissions';
import { buildWishSyncPayload, type WishCategoryId, syncWishToFeishu } from '../lib/wishSync';

const WISH_TAB_ITEMS: Array<{ id: WishCategoryId; label: string; Icon: typeof Gift }> = [
  { id: 'gift', label: '礼品', Icon: Gift },
  { id: 'snack', label: '零食', Icon: Candy },
  { id: 'play', label: '玩法', Icon: Gamepad2 },
  { id: 'song', label: '点歌', Icon: Music },
];

const WISH_PLACEHOLDERS: Record<WishCategoryId, string> = {
  gift: '小友，写下你想要的礼品',
  snack: '小友，写下你想吃的零食',
  play: '小友，你觉得JIEYOU社团可以有哪些新玩法？',
  song: '小友，写下你想听的歌曲',
};

const MESSAGE_LIMIT = 300;

export const SongRequestPage = () => {
  const navigate = useNavigate();
  const { addRequest, fetchRequests } = useSongRequestStore();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => isAdminEmail(state.user?.email));

  const [activeTab, setActiveTab] = useState<WishCategoryId>('gift');
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const selectedCategory = useMemo(() => {
    return WISH_TAB_ITEMS.find((item) => item.id === activeTab) ?? WISH_TAB_ITEMS[0];
  }, [activeTab]);

  const messageCount = message.length;

  const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value.slice(0, MESSAGE_LIMIT));
  };

  const handleSendToJieyou = async () => {
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSyncFeedback(null);

    const trimmedMessage = message.trim();
    await addRequest(`${selectedCategory.label}愿望`, '', trimmedMessage);

    const syncResult = await syncWishToFeishu(
      buildWishSyncPayload({
        categoryId: selectedCategory.id,
        categoryLabel: selectedCategory.label,
        message: trimmedMessage,
        userId: user?.uid,
        userEmail: user?.email,
      }),
    );

    if (syncResult.status === 'ok') {
      setSyncFeedback('已提交并同步到飞书汇总。');
    } else if (syncResult.status === 'skipped') {
      if (syncResult.reason === 'endpoint_unreachable') {
        setSyncFeedback('已提交到许愿池，飞书同步服务未启动（127.0.0.1:8787）。');
      } else if (syncResult.reason === 'request_timeout') {
        setSyncFeedback('已提交到许愿池，飞书汇总请求超时，请稍后重试。');
      } else if (syncResult.reason === 'mobile_public_endpoint_not_configured') {
        setSyncFeedback('已提交到许愿池，手机端需要配置公网 HTTPS 飞书同步端点。');
      } else {
        setSyncFeedback('已提交到许愿池，飞书汇总未配置。');
      }
    } else {
      const missingEnvMatch = syncResult.error.match(/missing_env:([A-Z0-9_,]+)/i);
      if (missingEnvMatch?.[1]) {
        const missingEnvText = missingEnvMatch[1].split(',').join('、');
        setSyncFeedback(`已提交到许愿池，飞书网关缺少配置：${missingEnvText}。`);
      } else if (/lark-cli/i.test(syncResult.error)) {
        setSyncFeedback('已提交到许愿池，飞书 CLI 执行失败，请先完成 lark-cli 登录与权限配置。');
      } else {
        setSyncFeedback(`已提交到许愿池，飞书汇总失败：${syncResult.error}`);
      }
    }

    setMessage('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-pink-50/50 pb-20">
      <div className="relative h-48 w-full bg-gradient-to-r from-pink-400 to-purple-500 overflow-hidden rounded-b-[2rem] shadow-md">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 px-6 text-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-wide flex items-center">
            <MessageCircleHeart className="mr-2" /> 许愿池
          </h1>
          <p className="text-white/85 mt-2 text-sm">写下你的愿望，力所能及的，JIEYOU社团会尽力实现</p>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 p-2 text-white/80 hover:text-white transition-colors bg-black/10 rounded-full backdrop-blur-sm"
      >
        <ArrowLeft size={24} />
      </button>

      <div className={`${isAdmin ? '' : 'hidden '}absolute top-4 right-4 z-50`}>
        <button
          onClick={() => {
            if (!isAdmin) return;
            setShowMenu((prev) => !prev);
          }}
          className="p-2 text-white/80 hover:text-white transition-colors bg-black/10 rounded-full backdrop-blur-sm"
        >
          <Menu size={24} />
        </button>

        {isAdmin && showMenu && (
          <div className="absolute right-0 top-12 mt-2 w-40 bg-white rounded-xl shadow-lg z-50 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div
              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
              onClick={() => {
                setShowMenu(false);
                navigate('/song-request/trash');
              }}
            >
              <span className="text-sm font-medium">回收站</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center -mt-6 relative z-10 mb-4">
        <div className="bg-white rounded-full p-1 shadow-md flex space-x-1">
          {WISH_TAB_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === id
                  ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center">
                <Icon size={14} className="mr-1" /> {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="rounded-2xl p-4 shadow-sm border bg-white border-pink-100">
          <div className="mb-3 text-sm font-semibold text-gray-700">留言内容</div>
          <textarea
            rows={5}
            maxLength={MESSAGE_LIMIT}
            placeholder={WISH_PLACEHOLDERS[activeTab]}
            value={message}
            onChange={handleMessageChange}
            className="w-full h-44 bg-pink-50 border border-pink-100 rounded-xl px-4 py-3 text-sm text-gray-700 leading-7 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all resize-none overflow-y-auto"
          />
          <div className="mt-2 text-right text-xs text-gray-400">{messageCount}/{MESSAGE_LIMIT}</div>
          {syncFeedback ? <div className="mt-2 text-xs text-pink-500">{syncFeedback}</div> : null}
        </div>

        <div className="h-36"></div>
      </div>

      <div className="fixed left-1/2 -translate-x-1/2 w-full max-w-md px-4 pt-4 pb-3 bg-gradient-to-t from-white via-white to-transparent z-40 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)]">
        <button
          onClick={() => {
            void handleSendToJieyou();
          }}
          disabled={!message.trim() || isSubmitting}
          className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-bold shadow-lg shadow-pink-500/30 flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Send size={18} className="mr-2" /> {isSubmitting ? '发送中...' : '发给JIEYOU'}
        </button>
      </div>
    </div>
  );
};
