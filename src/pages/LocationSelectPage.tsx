import { ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOCATIONS = [
  { id: '1', name: '广西一颗蛋🥚', active: true },
  { id: '2', name: '这里的路演', active: false },
  { id: '3', name: '那个路演', active: false },
  { id: '4', name: '更多地点敬请期待', active: false, isPlaceholder: true },
];

export const LocationSelectPage = () => {
  const navigate = useNavigate();
  const bannerImageUrl = `${import.meta.env.BASE_URL}images/roadshow/location-select-banner.png`;

  const handleLocationClick = (location: typeof LOCATIONS[0]) => {
    if (location.active) {
      navigate('/guess-music');
    }
  };

  return (
    <div className="min-h-screen bg-teal-50/50">
      {/* Top Banner */}
      <div className="relative h-48 w-full bg-gradient-to-r from-jieyou-mint to-teal-400 overflow-hidden rounded-b-[2rem] shadow-md">
        <img
          src={bannerImageUrl}
          alt="路演地点背景图"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-wide">选择路演地点</h1>
          <p className="text-white/80 mt-2 text-sm">查看不同地点的听歌识曲榜</p>
        </div>

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 text-white/80 hover:text-white transition-colors bg-black/10 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Location List */}
      <div className="max-w-md mx-auto px-4 -mt-10 relative z-10 pb-10">
        <div className="space-y-4">
          {LOCATIONS.map((location) => (
            <div 
              key={location.id}
              onClick={() => handleLocationClick(location)}
              className={`
                relative overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-300
                ${location.active 
                  ? 'bg-white cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-98 border-2 border-transparent hover:border-teal-300' 
                  : 'bg-gray-100 cursor-not-allowed opacity-80'
                }
              `}
            >
              <div className="flex items-center space-x-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center shadow-inner
                  ${location.active ? 'bg-teal-50 text-teal-500' : 'bg-gray-200 text-gray-400'}
                `}>
                  <MapPin size={24} />
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${location.active ? 'text-gray-800' : 'text-gray-500'}`}>
                    {location.name}
                  </h3>
                  {location.active && (
                    <p className="text-xs text-teal-500 mt-1 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-teal-500 mr-2 animate-pulse"></span>
                      正在进行中
                    </p>
                  )}
                  {!location.active && !location.isPlaceholder && (
                    <p className="text-xs text-gray-400 mt-1">暂无数据</p>
                  )}
                </div>

                {location.active && (
                  <div className="text-teal-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
