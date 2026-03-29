import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import MobileNav, { MobileUploadFAB } from './components/MobileNav'
import MiniPlayer from './components/MiniPlayer'
import FullscreenPlayer from './components/FullscreenPlayer'
import HomePage from './pages/HomePage'
import DiscoverPage from './pages/DiscoverPage'
import SongDetailPage from './pages/SongDetailPage'
import UploadPage from './pages/UploadPage'
import SearchPage from './pages/SearchPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import CreatorPage from './pages/CreatorPage'
import LeaderboardPage from './pages/LeaderboardPage'
import SettingsPage from './pages/SettingsPage'
import HistoryPage from './pages/HistoryPage'
import AboutPage from './pages/AboutPage'
import HelpPage from './pages/HelpPage'
import PrivacyPage from './pages/PrivacyPage'
import LanguagePage from './pages/LanguagePage'
import { usePlayerStore } from './store/playerStore'
import { useThemeStore } from './store/themeStore'

export default function App() {
  const [showFullscreen, setShowFullscreen] = useState(false)
  const { currentSong } = usePlayerStore()
  const { theme } = useThemeStore()

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-bg-primary ${theme === 'light' ? 'light' : 'dark'}`}>
        {/* Desktop Navbar */}
        <div className="hidden md:block">
          <Navbar />
        </div>

        {/* Mobile Bottom Nav */}
        <MobileNav />

        <main className="pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/song/:id" element={<SongDetailPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/creator/:id" element={<CreatorPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
 第 58 行: <Route path="/settings" element={<SettingsPage />} />
第 59 行: <Route path="/history" element={<HistoryPage />} />
第 60 行: <Route path="/about" element={<AboutPage />} />      ← 新增
第 61 行: <Route path="/help" element={<HelpPage />} />        ← 新增
第 62 行: <Route path="/privacy" element={<PrivacyPage />} />  ← 新增
第 63 行: <Route path="/language" element={<LanguagePage />} /> ← 新增
第 64 行: </Routes>

          </Routes>
        </main>

        {/* Mobile Upload FAB */}
        <MobileUploadFAB />

        {/* Mini Player - 向上偏移避免遮挡底部导航 */}
        {currentSong && !showFullscreen && (
          <div className="md:static fixed bottom-16 md:bottom-0 left-0 right-0 z-30">
            <MiniPlayer onExpand={() => setShowFullscreen(true)} />
          </div>
        )}

        {/* Fullscreen Player */}
        {showFullscreen && (
          <FullscreenPlayer onClose={() => setShowFullscreen(false)} />
        )}
      </div>
    </BrowserRouter>
  )
}
