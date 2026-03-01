import { ArrowLeft, Music, Trophy, Settings, Gift, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const RoadshowPage = () => {
  const navigate = useNavigate();
  const [showGiftModal, setShowGiftModal] = useState(false);

  const ROADSHOW_ITEMS = [
    { 
      id: '1', 
      name: '个人排行', 
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
      {/* Header - Changed to White as requested */}
      <div className="bg-white text-gray-900 px-4 py-3 flex items-center shadow-sm sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-2"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">路演</h1>
        
        {/* Right Settings Icon */}
        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <Settings size={24} />
        </button>
      </div>

      {/* Content - Referencing Fig 3 (Grid) */}
      <div className="p-4">
        {/* Section Header - Replacing 'Basic Transaction' with 'Listen to Song' */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-800 font-bold text-lg">听歌识曲</h2>
          
          {/* Menu Button */}
          {/* <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Dropdown Menu */}
            {/* {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg z-20 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors">
                    <Edit2 size={18} className="mr-3 text-blue-500" />
                    <span className="text-sm font-medium">编辑功能</span>
                  </div>
                  <div 
                    className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
                    onClick={() => { setShowGiftModal(true); setShowMenu(false); }}
                  >
                    <Gift size={18} className="mr-3 text-pink-500" />
                    <span className="text-sm font-medium">积分换奖</span>
                  </div>
                </div>
              </>
            )}
          </div> */}
        </div>
        
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

      {/* Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowGiftModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
                <Gift size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">积分换奖说明</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                参与路演互动获取积分，积分可用于兑换精美礼品和专属特权。
                <br/><br/>
                更多兑换规则和奖品清单即将上线，敬请期待！
              </p>
              <button 
                onClick={() => setShowGiftModal(false)}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
