import { ArrowLeft, ChevronRight, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PROFILE_ITEMS = [
  { id: 'name', label: '用户名', value: 'JIEYOU' },
  { id: 'gender', label: '性别', value: '男' },
  { id: 'hobby', label: '爱好', value: '音乐、电影、旅行' },
  { id: 'signature', label: '签名', value: '愿音乐陪你解忧。' },
];

export const ProfileInfoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24">
      <header className="bg-white px-4 py-3 flex items-center border-b border-gray-100 sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={22} className="text-gray-600" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 pr-7">个人资料</h1>
      </header>

      <section className="mt-2 bg-white border-y border-gray-100">
        <div className="px-4 py-4 flex items-center border-b border-gray-100">
          <span className="text-[20px] text-gray-900">头像</span>
          <span className="ml-auto flex items-center gap-3">
            <span className="w-10 h-10 rounded-md bg-gradient-to-br from-teal-200 to-cyan-300 flex items-center justify-center shadow-sm">
              <UserRound size={20} className="text-white" />
            </span>
            <ChevronRight size={18} className="text-gray-300" />
          </span>
        </div>

        {PROFILE_ITEMS.map((item, index) => {
          const isLast = index === PROFILE_ITEMS.length - 1;
          return (
            <div key={item.id} className={`px-4 py-4 flex items-center ${!isLast ? 'border-b border-gray-100' : ''}`}>
              <span className="text-[20px] text-gray-900">{item.label}</span>
              <span className="ml-auto flex items-center gap-2 text-gray-500 max-w-[58%]">
                <span className="text-[20px] truncate">{item.value}</span>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </span>
            </div>
          );
        })}
      </section>
    </div>
  );
};
