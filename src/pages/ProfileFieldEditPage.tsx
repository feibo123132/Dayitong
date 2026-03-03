import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type EditableProfileField, useProfileStore } from '../store/useProfileStore';

type FieldConfig = {
  field: EditableProfileField;
  title: string;
  helper: string;
  placeholder: string;
  multiline?: boolean;
  options?: readonly string[];
};

const FIELD_CONFIG_MAP: Record<EditableProfileField, FieldConfig> = {
  name: {
    field: 'name',
    title: '更改名字',
    helper: '好名字可以让你的朋友更容易记住你。',
    placeholder: '请输入用户名',
  },
  gender: {
    field: 'gender',
    title: '更改性别',
    helper: '选择你希望在个人资料中展示的性别。',
    placeholder: '',
    options: ['男', '女', '保密'],
  },
  hobby: {
    field: 'hobby',
    title: '更改爱好',
    helper: '添加兴趣爱好，方便展示你的个性。',
    placeholder: '请输入爱好',
  },
  signature: {
    field: 'signature',
    title: '更改签名',
    helper: '设置一句个性签名，让大家更了解你。',
    placeholder: '请输入签名',
    multiline: true,
  },
};

const isEditableField = (value: string | undefined): value is EditableProfileField =>
  value === 'name' || value === 'gender' || value === 'hobby' || value === 'signature';

export const ProfileFieldEditPage = () => {
  const navigate = useNavigate();
  const { field } = useParams();
  const { name, gender, hobby, signature, updateField } = useProfileStore();

  const config = useMemo(() => {
    if (!isEditableField(field)) return null;
    return FIELD_CONFIG_MAP[field];
  }, [field]);

  const currentValue = useMemo(() => {
    if (!config) return '';
    if (config.field === 'name') return name;
    if (config.field === 'gender') return gender;
    if (config.field === 'hobby') return hobby;
    return signature;
  }, [config, gender, hobby, name, signature]);

  const [value, setValue] = useState(currentValue);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  if (!config) {
    return (
      <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] flex items-center justify-center">
        <button onClick={() => navigate('/profile-info')} className="text-jieyou-mint text-base font-medium">
          返回个人资料
        </button>
      </div>
    );
  }

  const trimmedValue = value.trim();
  const canSave = trimmedValue.length > 0 && trimmedValue !== currentValue;

  const handleSave = async () => {
    if (!canSave) return;
    await updateField(config.field, trimmedValue);
    navigate(-1);
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f1f2f5] pb-24">
      <header className="px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-200/70 transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-gray-900 pr-10">{config.title}</h1>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="h-11 px-4 rounded-xl text-lg font-medium transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed bg-[#07c160] text-white hover:bg-[#06ad56]"
        >
          保存
        </button>
      </header>

      <section className="mt-3 bg-white px-6 py-6 border-y border-gray-200">
        {config.options ? (
          <div className="space-y-3">
            {config.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setValue(option)}
                className={`w-full h-11 rounded-lg border text-[17px] transition-colors ${
                  value === option
                    ? 'border-[#07c160] bg-green-50 text-[#07c160]'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : config.multiline ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={config.placeholder}
            rows={3}
            className="w-full resize-none bg-transparent outline-none text-[17px] text-gray-900 placeholder:text-gray-400"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={config.placeholder}
            className="w-full bg-transparent outline-none text-[17px] text-gray-900 placeholder:text-gray-400"
          />
        )}
        <p className="mt-4 pt-4 border-t border-gray-200 text-[17px] text-gray-400">{config.helper}</p>
      </section>
    </div>
  );
};
