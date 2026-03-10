import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const CULTURE_LINES = [
  {
    title: '一念',
    label: '情绪疗愈',
    content: '世界是足够有趣的，让音乐成为我们疗愈情绪的好伙伴吧。',
  },
  {
    title: '一句',
    label: '苏轼《定风波》',
    content: '莫听穿林打叶声，何妨吟啸且徐行。',
  },
];

const BENEFITS = [
  '身体：强健呼吸，增强免疫、记忆和专注，改善睡眠；',
  '心理：在忙碌中停靠，感受音乐带来的放松与心灵愉悦；',
  '社会：以音乐为纽带，让人与人之间多些正向联结。',
];

const JIEYOU_EXPLANATION = [
  '解忧：心灵驿站，让心灵片刻休憩；',
  '结友：建立积极联结，相互多些社会和情感支持；',
  '皆有：曲库较丰富，欢迎每个热爱音乐的友友；',
  '借由：为“2030健康中国”目标贡献一点力量。',
];

export const ClubCulture = () => {
  const [nianExpanded, setNianExpanded] = useState(false);
  const [juExpanded, setJuExpanded] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const [jieyouExpanded, setJieyouExpanded] = useState(false);

  return (
    <section className="px-2">
      <h2 className="text-lg font-semibold text-jieyou-text mb-3">社团文化</h2>
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm space-y-4">
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          {/* 一念 */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setNianExpanded(!nianExpanded)}
            >
              <p className="font-semibold text-orange-500 mb-1">一念：{CULTURE_LINES[0].label}</p>
              <ChevronRight 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${nianExpanded ? 'rotate-90' : ''}`} 
              />
            </div>
            {nianExpanded && (
              <div className="space-y-1">
                <p>{CULTURE_LINES[0].content}</p>
              </div>
            )}
          </div>

          {/* 一句 */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setJuExpanded(!juExpanded)}
            >
              <p className="font-semibold text-orange-500 mb-1">一句：{CULTURE_LINES[1].label}</p>
              <ChevronRight 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${juExpanded ? 'rotate-90' : ''}`} 
              />
            </div>
            {juExpanded && (
              <div className="space-y-1">
                <p>{CULTURE_LINES[1].content}</p>
              </div>
            )}
          </div>

          {/* 一益 */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setBenefitsExpanded(!benefitsExpanded)}
            >
              <p className="font-semibold text-orange-500 mb-1">一益：音乐 & 健康</p>
              <ChevronRight 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${benefitsExpanded ? 'rotate-90' : ''}`} 
              />
            </div>
            {benefitsExpanded && (
              <div className="space-y-1">
                {BENEFITS.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            )}
          </div>

          {/* 一释 */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setJieyouExpanded(!jieyouExpanded)}
            >
              <p className="font-semibold text-orange-500 mb-1">一释：JIEYOU</p>
              <ChevronRight 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${jieyouExpanded ? 'rotate-90' : ''}`} 
              />
            </div>
            {jieyouExpanded && (
              <div className="space-y-1">
                {JIEYOU_EXPLANATION.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
