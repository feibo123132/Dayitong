import { motion } from 'framer-motion';

const MOCK_DATA = [
  { rank: 1, name: '小橘同学', score: '28首', college: '音乐学院' },
  { rank: 2, name: '吉他手阿泽', score: '25首', college: '传媒学院' },
  { rank: 3, name: '听歌达人小夏', score: '22首', college: '文理学院' },
  { rank: 4, name: '校园歌神', score: '20首', college: '艺术学院' },
  { rank: 5, name: '民谣爱好者', score: '18首', college: '人文学院' },
  { rank: 6, name: '节奏大师', score: '15首', college: '体育学院' },
];

export const GuessMusicRankingPage = () => {
  return (
    <div className="min-h-screen bg-orange-50 pb-safe">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 p-6 text-white text-center rounded-b-3xl shadow-lg mb-6">
        <h1 className="text-2xl font-bold tracking-wider">医大猜歌榜</h1>
        <p className="text-sm opacity-90 mt-2">快来挑战你的曲库量！</p>
      </div>

      {/* Table Header */}
      <div className="px-4 mb-2">
        <div className="bg-orange-500 text-white rounded-t-xl p-3 flex text-sm font-bold shadow-sm">
          <div className="w-12 text-center">排名</div>
          <div className="flex-1 text-center">参赛者昵称</div>
          <div className="w-20 text-center">答对歌曲数</div>
          <div className="w-24 text-center">所在院校</div>
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-2">
        {MOCK_DATA.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 flex items-center shadow-sm border-b-2 border-orange-100"
          >
            <div className={`w-12 text-center font-bold text-xl ${
              index < 3 ? 'text-orange-500' : 'text-gray-400'
            }`}>
              {item.rank}
            </div>
            <div className="flex-1 text-center font-medium text-gray-800">
              {item.name}
            </div>
            <div className="w-20 text-center font-bold text-orange-600">
              {item.score}
            </div>
            <div className="w-24 text-center text-sm text-gray-500">
              {item.college}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center text-gray-400 text-xs py-6">
        数据实时更新中...
      </div>
    </div>
  );
};
