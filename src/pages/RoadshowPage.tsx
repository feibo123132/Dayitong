import { ArrowLeft, Music, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RoadshowPage = () => {
  const navigate = useNavigate();

  const ROADSHOW_ITEMS = [
    { 
      id: '1', 
      name: '听歌识曲', 
      icon: Music, 
      color: 'text-white', 
      bg: 'bg-gradient-to-r from-jieyou-mint to-teal-400', 
      path: '/guess-music-locations' 
    },
    { 
      id: '2', 
      name: '积分榜', 
      icon: Trophy, 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-50', 
      path: '/ranking' 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Referencing Fig 2 (Orange) */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 flex items-center shadow-md sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors mr-2"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center pr-8">路演</h1>
      </div>

      {/* Content - Referencing Fig 3 (Grid) */}
      <div className="p-4">
        {/* Section Header - Replacing 'Basic Transaction' with 'Listen to Song' */}
        <h2 className="text-gray-800 font-bold text-lg mb-4">听歌识曲</h2>
        
        <div className="grid grid-cols-4 gap-4">
          {ROADSHOW_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center space-y-2 cursor-pointer active:scale-95 transition-transform"
            >
              <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shadow-sm`}>
                <item.icon size={28} />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
