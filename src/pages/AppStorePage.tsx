import { ArrowLeft, ExternalLink, Globe, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const APPS = [
  { 
    id: '1', 
    name: 'JIEYOU 不解忧', 
    desc: '你的专属情绪观察员', 
    icon: Heart, 
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    url: 'https://loveyourself.jieyouyuzhou.cn/' 
  },
  { 
    id: '2', 
    name: '世界上的另一个你', 
    desc: '进入 JIEYOU 宇宙网页应用', 
    icon: Globe, 
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    url: 'https://jieyouyuzhou.cn/' 
  },
  { 
    id: '3', 
    name: '更多应用', 
    desc: '敬请期待...', 
    icon: ExternalLink, 
    color: 'text-gray-400',
    bgColor: 'bg-gray-100',
    url: null 
  },
];

export const AppStorePage = () => {
  const navigate = useNavigate();

  const handleAppClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-teal-50/50">
      {/* Top Banner */}
      <div className="relative h-48 w-full bg-gradient-to-r from-jieyou-mint to-teal-400 overflow-hidden rounded-b-[2rem] shadow-md">
        <div className="absolute inset-0 opacity-30 bg-[url('/images/app-store/app-store-banner.png')] bg-cover bg-center"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-wide">APP 铺子</h1>
          <p className="text-white/80 mt-2 text-sm">探索更多有趣应用</p>
        </div>

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 text-white/80 hover:text-white transition-colors bg-black/10 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* APP List */}
      <div className="max-w-md mx-auto px-4 -mt-10 relative z-10 pb-10">
        <div className="grid grid-cols-2 gap-4">
          {APPS.map((app) => (
            <div 
              key={app.id}
              onClick={() => handleAppClick(app.url)}
              className={`
                bg-white rounded-2xl p-5 shadow-sm transition-all duration-300 flex flex-col items-center text-center
                ${app.url 
                  ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-95' 
                  : 'cursor-default opacity-80'
                }
              `}
            >
              <div className={`
                w-16 h-16 rounded-2xl mb-3 flex items-center justify-center shadow-inner
                ${app.bgColor} ${app.color}
              `}>
                <app.icon size={32} />
              </div>
              
              <h3 className="font-bold text-gray-800 mb-1">{app.name}</h3>
              <p className="text-xs text-gray-500">{app.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
