import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const createEmojiIcon = (emoji: string) =>
  function EmojiIcon({ size = 32 }: { size?: number }) {
    return <span style={{ fontSize: size, lineHeight: 1 }}>{emoji}</span>;
  };

const APPS = [
  { 
    id: '1', 
    name: 'JIEYOU 不解忧', 
    desc: '你的专属情绪观察员', 
    icon: createEmojiIcon('🫶'), 
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    url: 'https://loveyourself.jieyouyuzhou.cn/' 
  },
  { 
    id: '2', 
    name: '世界上的另一个你', 
    desc: '进入 JIEYOU 宇宙网页应用', 
    icon: createEmojiIcon('🌍'), 
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    url: 'https://jieyouyuzhou.cn/' 
  },
  { 
    id: '3', 
    name: '任务看板', 
    desc: '高效管理任务与进度', 
    icon: createEmojiIcon('📋'), 
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    url: 'https://kanban.jieyouyuzhou.cn/' 
  },
  { 
    id: '4', 
    name: '存钱罐', 
    desc: '记录目标，养成储蓄习惯', 
    icon: createEmojiIcon('🐷'), 
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    url: 'https://cunqianguan.jieyouyuzhou.cn/' 
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
      <div className="relative h-48 w-full overflow-hidden rounded-b-[2rem] shadow-md">
        <div className="absolute inset-0 bg-[url('/images/app-store/app-store-banner.png')] bg-cover bg-center"></div>
        
        {/* Banner Text Overlay Removed */}

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
