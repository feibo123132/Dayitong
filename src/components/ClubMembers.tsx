import { useState } from 'react';
import { ChevronRight, Users } from 'lucide-react';

const MEMBERS = [
  { role: '吉他兼主唱', name: 'JIEYOU' },
  { role: '财务大臣', name: '阿菜菜' },
  { role: '作词作曲', name: '白伦' },
  { role: '拍照记录', name: '影' },
  { role: '礼物、LOGO设计', name: '小美' },
  { role: '小程序、网页', name: '阿园' },
  { role: '灵感收集和实践', name: '灵慧' },
  { role: '社团宗旨、路线', name: '平心' },
  { role: '物资采购 & 搬运', name: '铁牛' },
  { role: '同学想法收集', name: '一念' },
];

export const ClubMembers = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayMembers = isExpanded ? MEMBERS : MEMBERS.slice(0, 5);

  return (
    <section className="px-2">
      <h2 className="text-lg font-semibold text-jieyou-text mb-3">社团成员</h2>
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center text-blue-600 font-semibold">
            <Users size={18} className="mr-2" />
            <span>核心成员名单</span>
          </div>
          <ChevronRight 
            size={16} 
            className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
          {displayMembers.map((member, index) => (
            <div key={member.name} className="flex justify-between items-center py-1.5 border-b border-blue-50/50 last:border-0">
              <span className="text-gray-500">{member.role}</span>
              <span className="font-medium text-gray-800">{member.name}</span>
            </div>
          ))}
          {!isExpanded && (
            <div className="text-center pt-2 text-xs text-blue-400">
              ... 展开查看更多 ...
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
