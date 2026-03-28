import { Link, useNavigate } from 'react-router-dom'
import { Search, Upload, User, Menu, X, Music2, Bell, Trophy, Settings } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import { NotificationPanel } from './NotificationPanel'
import { cn } from '../lib/utils'

interface NavbarProps {
  className?: string
}

export default function Navbar({ className }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, currentUser } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className={cn('sticky top-0 z-50 glass border-b border-border', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center group-hover:scale-105 transition-transform">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">小龙虾音乐</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors">
              首页
            </Link>
            <Link to="/discover" className="text-text-secondary hover:text-text-primary transition-colors">
              发现
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors">
              <Trophy className="w-4 h-4" />
              排行榜
            </Link>
            <Link to="/upload" className="text-text-secondary hover:text-text-primary transition-colors">
              上传
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="搜索歌曲、创作者或AI工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border rounded-full text-sm text-text-primary placeholder:text-text-muted focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 transition-all"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center hover:border-accent-purple transition-colors"
                >
                  <Bell className="w-4 h-4 text-text-secondary" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationPanel
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>
            )}

            <Link
              to="/upload"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-full text-sm font-medium transition-all"
            >
              <Upload className="w-4 h-4" />
              上传
            </Link>

            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/settings"
                  className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center hover:border-accent-purple transition-colors"
                >
                  <Settings className="w-4 h-4 text-text-secondary" />
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 group"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-accent-purple transition-all"
                  />
                </Link>
              </div>
            ) : (
              <Link
                to="/auth"
                className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center hover:border-accent-purple transition-colors"
              >
                <User className="w-4 h-4 text-text-secondary" />
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-text-secondary"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="搜索歌曲..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border rounded-full text-sm"
                />
              </div>
            </form>
            <div className="flex flex-col gap-2">
              <Link to="/" className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>首页</Link>
              <Link to="/discover" className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>发现</Link>
              <Link to="/leaderboard" className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                <Trophy className="w-4 h-4" />
                排行榜
              </Link>
              <Link to="/upload" className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>上传</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
