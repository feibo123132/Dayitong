import { ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOCATIONS = [
  { id: '1', name: '广西一颗蛋🥚', active: true, locationKey: 'gx-egg' },
  { id: '2', name: '南湖', active: true, locationKey: 'nanhu' },
  { id: '3', name: '广西菜园', active: true, locationKey: 'gx-garden' },
  { id: '4', name: '更多地点敬请期待', active: false, isPlaceholder: true },
];

export const LocationSelectPage = () => {
  const navigate = useNavigate();
  const bannerImageUrl = `${import.meta.env.BASE_URL}images/roadshow/location-select-banner.png`;

  const handleLocationClick = (location: typeof LOCATIONS[0]) => {
    if (!location.active) return;
    const locationKey = location.locationKey ?? 'gx-egg';
    navigate(`/guess-music?location=${locationKey}`);
  };

  return (
    <div className="min-h-screen bg-teal-50/50">
      <div className="relative h-48 w-full overflow-hidden rounded-b-[2rem] shadow-md">
        <img src={bannerImageUrl} alt="路演地点背景图" className="absolute inset-0 h-full w-full object-cover" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 rounded-full bg-black/10 p-2 text-white/80 backdrop-blur-sm transition-colors hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-md px-4 pb-10">
        <div className="space-y-4">
          {LOCATIONS.map((location) => (
            <div
              key={location.id}
              onClick={() => handleLocationClick(location)}
              className={`
                relative overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-300
                ${
                  location.active
                    ? 'cursor-pointer border-2 border-transparent bg-white hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl active:scale-98'
                    : 'cursor-not-allowed bg-gray-100 opacity-80'
                }
              `}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`
                  flex h-12 w-12 items-center justify-center rounded-full shadow-inner
                  ${location.active ? 'bg-teal-50 text-teal-500' : 'bg-gray-200 text-gray-400'}
                `}
                >
                  <MapPin size={24} />
                </div>

                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${location.active ? 'text-gray-800' : 'text-gray-500'}`}>{location.name}</h3>
                  {location.active && (
                    <p className="mt-1 flex items-center text-xs text-teal-500">
                      <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-teal-500"></span>
                      正在进行中
                    </p>
                  )}
                  {!location.active && !location.isPlaceholder && <p className="mt-1 text-xs text-gray-400">暂无数据</p>}
                </div>

                {location.active && (
                  <div className="text-teal-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
