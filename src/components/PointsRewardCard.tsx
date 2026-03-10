import { Gift, Music, Camera, Award } from 'lucide-react';

export const PointsRewardCard = () => {
  const handleCardClick = () => {
    window.location.assign(`${import.meta.env.BASE_URL}points-reward.html`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="w-full text-left relative overflow-hidden rounded-3xl p-4 shadow-sm border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50 to-white cursor-pointer group hover:shadow-md transition-all h-40 flex flex-col justify-between"
    >
      <div className="absolute -top-2 right-3 text-2xl opacity-90">🎁</div>
      
      <div className="flex justify-between items-start">
        <div>
          <div className="inline-flex items-center rounded-full bg-orange-100 text-orange-600 text-[10px] font-semibold px-2 py-0.5 mb-1">
            <Gift size={10} className="mr-1" /> 积分换礼物
          </div>
          <h3 className="text-base font-bold text-slate-800 group-hover:text-orange-600 transition-colors">积分换礼物活动来咯</h3>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center text-xs text-slate-700 font-medium">
            <span className="bg-red-100 text-red-600 px-1.5 rounded mr-1.5 font-bold shrink-0">一等奖</span>
            <Music size={14} className="mr-1 text-red-400" />
            <span className="truncate">个人单曲</span>
          </div>
          <div className="flex items-center text-xs text-slate-700 font-medium">
            <span className="bg-orange-100 text-orange-600 px-1.5 rounded mr-1.5 font-bold shrink-0">二等奖</span>
            <Award size={14} className="mr-1 text-orange-400" />
            <span className="truncate">无人机试玩、吉他入门交流</span>
          </div>
        </div>
        <div className="flex items-center text-xs text-slate-700 font-medium">
          <span className="bg-yellow-100 text-yellow-600 px-1.5 rounded mr-1.5 font-bold shrink-0">三等奖</span>
          <Camera size={14} className="mr-1 text-yellow-400" />
          <span className="truncate">亚克力挂件、个人艺术照</span>
        </div>
      </div>
    </div>
  );
};
