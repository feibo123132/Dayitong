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
  '身体：强健呼吸，增强免疫、记忆和专注，改善睡眠。',
  '心理：在忙碌中停靠，感受音乐带来的放松与心灵愉悦。',
  '社会：以音乐为纽带，让人与人之间多些正向联结。',
];

const JIEYOU_EXPLANATION = [
  '解忧：心灵驿站，让心灵片刻休憩。',
  '结友：建立积极联结，互相给予支持。',
  '皆有：曲库丰富，欢迎每位热爱音乐的朋友。',
  '借由：为“2030 健康中国”目标贡献一点力量。',
];

type ExpandSection = 'nian' | 'ju' | 'benefit' | 'jieyou' | null;

export const ClubCulture = () => {
  const [expanded, setExpanded] = useState<ExpandSection>(null);

  const toggle = (section: Exclude<ExpandSection, null>) => {
    setExpanded((current) => (current === section ? null : section));
  };

  return (
    <section className="px-2">
      <h2 className="mb-3 text-lg font-semibold text-jieyou-text">社团文化</h2>
      <div className="space-y-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <div>
            <button type="button" className="flex w-full items-center justify-between" onClick={() => toggle('nian')}>
              <p className="mb-1 font-semibold text-orange-500">一念：{CULTURE_LINES[0].label}</p>
              <ChevronRight size={16} className={`text-gray-400 transition-transform duration-200 ${expanded === 'nian' ? 'rotate-90' : ''}`} />
            </button>
            {expanded === 'nian' && <p>{CULTURE_LINES[0].content}</p>}
          </div>

          <div>
            <button type="button" className="flex w-full items-center justify-between" onClick={() => toggle('ju')}>
              <p className="mb-1 font-semibold text-orange-500">一句：{CULTURE_LINES[1].label}</p>
              <ChevronRight size={16} className={`text-gray-400 transition-transform duration-200 ${expanded === 'ju' ? 'rotate-90' : ''}`} />
            </button>
            {expanded === 'ju' && <p>{CULTURE_LINES[1].content}</p>}
          </div>

          <div>
            <button type="button" className="flex w-full items-center justify-between" onClick={() => toggle('benefit')}>
              <p className="mb-1 font-semibold text-orange-500">一益：音乐 & 健康</p>
              <ChevronRight
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${expanded === 'benefit' ? 'rotate-90' : ''}`}
              />
            </button>
            {expanded === 'benefit' && (
              <div className="space-y-1">
                {BENEFITS.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            )}
          </div>

          <div>
            <button type="button" className="flex w-full items-center justify-between" onClick={() => toggle('jieyou')}>
              <p className="mb-1 font-semibold text-orange-500">一释：JIEYOU</p>
              <ChevronRight size={16} className={`text-gray-400 transition-transform duration-200 ${expanded === 'jieyou' ? 'rotate-90' : ''}`} />
            </button>
            {expanded === 'jieyou' && (
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
