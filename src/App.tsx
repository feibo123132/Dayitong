import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ActivityDetailPage } from './pages/ActivityDetailPage';
import { ActivityCheckinPage } from './pages/ActivityCheckinPage';
import { MainLayout } from './layouts/MainLayout';
import { ActivityPage } from './pages/ActivityPage';
import { AppStorePage } from './pages/AppStorePage';
import { GuessMusicPage } from './pages/GuessMusicPage';
import { GuessUserHistoryPage } from './pages/GuessUserHistoryPage';
import { GuitarBeginnerPage } from './pages/GuitarBeginnerPage';
import { Home } from './pages/Home';
import { LyricsCarouselPage } from './pages/LyricsCarouselPage';
import { LocationSelectPage } from './pages/LocationSelectPage';
import { LoginPage } from './pages/LoginPage';
import { OriginalMusicBoxPage } from './pages/OriginalMusicBoxPage';
import { ProfileFieldEditPage } from './pages/ProfileFieldEditPage';
import { ProfileInfoPage } from './pages/ProfileInfoPage';
import { RankingPage } from './pages/RankingPage';
import { RankingUserDetailPage } from './pages/RankingUserDetailPage';
import { RoadshowPage } from './pages/RoadshowPage';
import { SettingsPage } from './pages/SettingsPage';
import { SongRequestPage } from './pages/SongRequestPage';
import { UserPage } from './pages/UserPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/original-music-box/:songId" element={<LyricsCarouselPage />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="activity/:festivalId" element={<ActivityDetailPage />} />
          <Route path="activity/:festivalId/checkin" element={<ActivityCheckinPage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route path="ranking/:userId" element={<RankingUserDetailPage />} />
          <Route path="guess-music" element={<GuessMusicPage />} />
          <Route path="guess-music-locations" element={<LocationSelectPage />} />
          <Route path="guess-music/history/:userId" element={<GuessUserHistoryPage />} />
          <Route path="song-request" element={<SongRequestPage />} />
          <Route path="roadshow" element={<RoadshowPage />} />
          <Route path="app-store" element={<AppStorePage />} />
          <Route path="original-music-box" element={<OriginalMusicBoxPage />} />
          <Route path="guitar-beginner" element={<GuitarBeginnerPage />} />
          <Route path="profile" element={<UserPage />} />
          <Route path="profile-info" element={<ProfileInfoPage />} />
          <Route path="profile-info/edit/:field" element={<ProfileFieldEditPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
