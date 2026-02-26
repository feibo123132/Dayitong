import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { MusicPage } from './pages/MusicPage';
import { UserPage } from './pages/UserPage';
import { RankingPage } from './pages/RankingPage';
import { GuessMusicPage } from './pages/GuessMusicPage';
import { LocationSelectPage } from './pages/LocationSelectPage';
import { GuessUserHistoryPage } from './pages/GuessUserHistoryPage';
import { AppStorePage } from './pages/AppStorePage';
import { SongRequestPage } from './pages/SongRequestPage';
import { RoadshowPage } from './pages/RoadshowPage';

// Placeholder for Activity Page
const ActivityPage = () => <div className="p-4 text-center text-gray-500">活动页面正在开发中...</div>;

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="music" element={<MusicPage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route path="guess-music" element={<GuessMusicPage />} />
          <Route path="guess-music-locations" element={<LocationSelectPage />} />
          <Route path="guess-music/history/:userId" element={<GuessUserHistoryPage />} />
          <Route path="song-request" element={<SongRequestPage />} />
          <Route path="roadshow" element={<RoadshowPage />} />
          <Route path="app-store" element={<AppStorePage />} />
          <Route path="profile" element={<UserPage />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
