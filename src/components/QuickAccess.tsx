import { Disc, LayoutGrid, MessageCircleHeart, Guitar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QUICK_ACCESS = [
  { id: '1', name: '路演', icon: Guitar, color: 'text-orange-500', bg: 'bg-orange-50', path: '/roadshow' },
  { id: '3', name: '单曲库', icon: Disc, color: 'text-purple-500', bg: 'bg-purple-50', path: '/music' },
  { id: '4', name: 'APP 铺子', icon: LayoutGrid, color: 'text-pink-500', bg: 'bg-pink-50', path: '/app-store' },
  { id: '5', name: '留言点歌', icon: MessageCircleHeart, color: 'text-white', bg: 'bg-gradient-to-r from-pink-400 to-purple-500', path: '/song-request' },
];

export const QuickAccess = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-4 gap-2 px-2">
      {(QUICK_ACCESS || []).map((item) => (
        <div
          key={item.id}
          onClick={() => navigate(item.path)}
          className="flex flex-col items-center justify-center space-y-2 p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-95 transition-transform"
        >
          <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color}`}>
            <item.icon size={24} />
          </div>
          <span className="text-xs font-medium text-jieyou-text">{item.name}</span>
        </div>
      ))}
    </div>
  );
};
