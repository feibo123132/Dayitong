import { ArrowLeft, ChevronRight, UserRound } from 'lucide-react';
import { useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/useProfileStore';

export const ProfileInfoPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { name, gender, hobby, signature, avatarUrl, updateAvatar } = useProfileStore();

  const profileItems = [
    { id: 'name', label: '用户名', value: name, editable: true },
    { id: 'gender', label: '性别', value: gender, editable: true },
    { id: 'hobby', label: '爱好', value: hobby, editable: true },
    { id: 'signature', label: '签名', value: signature, editable: true },
  ] as const;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('请选择图片文件');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        void updateAvatar(result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24">
      <header className="bg-white px-4 py-3 flex items-center border-b border-gray-100 sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={22} className="text-gray-600" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 pr-7">个人资料</h1>
      </header>

      <section className="mt-2 bg-white border-y border-gray-100">
        <button
          type="button"
          onClick={handleAvatarClick}
          className="w-full px-4 py-4 flex items-center text-left border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <span className="text-[17px] text-gray-900">头像</span>
          <span className="ml-auto flex items-center gap-3">
            <span className="w-10 h-10 rounded-md bg-gradient-to-br from-teal-200 to-cyan-300 flex items-center justify-center shadow-sm overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <UserRound size={20} className="text-white" />
              )}
            </span>
            <ChevronRight size={18} className="text-gray-300" />
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {profileItems.map((item, index) => {
          const isLast = index === profileItems.length - 1;
          const rowClassName = `w-full px-4 py-4 flex items-center text-left ${!isLast ? 'border-b border-gray-100' : ''} hover:bg-gray-50 active:bg-gray-100 transition-colors`;

          return (
            <button key={item.id} onClick={() => navigate(`/profile-info/edit/${item.id}`)} className={rowClassName}>
              <span className="text-[17px] text-gray-900">{item.label}</span>
              <span className="ml-auto flex items-center gap-2 text-gray-500 max-w-[58%]">
                <span className="text-[17px] truncate">{item.value}</span>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </span>
            </button>
          );
        })}
      </section>
    </div>
  );
};
