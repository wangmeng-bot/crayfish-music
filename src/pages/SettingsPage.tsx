import { Link, useNavigate } from 'react-router-dom'
import { 
  User, Moon, Sun, Bell, Shield, Globe, Palette, 
  HelpCircle, Info, LogOut, ChevronRight, Download,
  Volume2, VolumeX, Smartphone, Monitor
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { usePlayerStore } from '../store/playerStore'
import type { LucideIcon } from 'lucide-react'

// 设置项类型
interface BaseSettingItem {
  icon: LucideIcon
  label: string
  description: string
  type?: 'toggle' | 'slider' | 'color' | 'nav'
  value?: boolean | number
  onClick?: () => void
  onChange?: (value: number) => void
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { currentUser, isAuthenticated, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const settingSections: { title: string; items: BaseSettingItem[] }[] = [
    {
      title: '账号',
      items: [
        {
          icon: User,
          label: '编辑个人资料',
          description: '修改头像、用户名和简介',
          onClick: () => navigate('/profile'),
        },
      ]
    },
    {
      title: '外观',
      items: [
        {
          icon: theme === 'dark' ? Sun : Moon,
          label: '深色模式',
          description: theme === 'dark' ? '当前：深色' : '当前：浅色',
          type: 'toggle',
          value: theme === 'dark',
          onClick: toggleTheme,
        },
        {
          icon: Palette,
          label: '主题色',
          description: '自定义强调色',
          type: 'color',
        },
      ]
    },
    {
      title: '播放',
      items: [
        {
          icon: isMuted ? VolumeX : Volume2,
          label: '静音',
          description: isMuted ? '已静音' : '已开启声音',
          type: 'toggle',
          value: !isMuted,
          onClick: toggleMute,
        },
        {
          icon: Volume2,
          label: '音量',
          description: `${Math.round(volume * 100)}%`,
          type: 'slider',
          value: volume,
          onChange: (v: number) => setVolume(v),
        },
      ]
    },
    {
      title: '通知',
      items: [
        {
          icon: Bell,
          label: '推送通知',
          description: '新粉丝、评论、点赞',
          type: 'toggle',
          value: true,
        },
      ]
    },
    {
      title: '通用',
      items: [
        {
          icon: Globe,
          label: '语言',
          description: '简体中文',
          type: 'nav',
        },
        {
          icon: Download,
          label: '下载管理',
          description: '查看已下载的音乐',
          type: 'nav',
        },
      ]
    },
    {
      title: '关于',
      items: [
        {
          icon: Info,
          label: '关于我们',
          description: '小龙虾音乐 v1.0.0',
          type: 'nav',
        },
        {
          icon: HelpCircle,
          label: '帮助与反馈',
          description: '常见问题、联系客服',
          type: 'nav',
        },
        {
          icon: Shield,
          label: '隐私政策',
          description: '了解我们如何保护您的隐私',
          type: 'nav',
        },
      ]
    },
  ]

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/profile" className="p-2 rounded-full hover:bg-bg-card transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">设置</h1>
        </div>

        {/* User Info Card */}
        {isAuthenticated && currentUser && (
          <div className="bg-bg-card rounded-2xl border border-border p-4 mb-6">
            <Link to="/profile" className="flex items-center gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-14 h-14 rounded-full object-cover border-2 border-accent-purple"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">{currentUser.username}</h3>
                <p className="text-sm text-text-muted truncate">{currentUser.bio || '暂无简介'}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </Link>
          </div>
        )}

        {/* Setting Sections */}
        <div className="space-y-6">
          {settingSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-medium text-text-muted mb-3 px-1">{section.title}</h2>
              <div className="bg-bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-4 p-4 hover:bg-bg-hover transition-colors cursor-pointer"
                      onClick={item.type !== 'toggle' && item.type !== 'slider' && item.onClick ? () => item.onClick?.() : undefined}
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-accent-purple" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-text-primary">{item.label}</h4>
                        <p className="text-sm text-text-muted">{item.description}</p>
                      </div>
                      
                      {/* Right Action */}
                      <div>
                        {item.type === 'toggle' && (
                          <button
                            onClick={() => item.onClick?.()}
                            className={`relative w-12 h-7 rounded-full transition-colors ${
                              item.value ? 'bg-accent-purple' : 'bg-bg-secondary'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                item.value ? 'left-6' : 'left-1'
                              }`}
                            />
                          </button>
                        )}
                        
                        {item.type === 'slider' && (
                          <div className="flex items-center gap-2 w-32">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={item.value}
                              onChange={(e) => item.onChange?.(parseFloat(e.target.value))}
                              className="flex-1 h-2 bg-bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-purple"
                            />
                          </div>
                        )}
                        
                        {item.type === 'color' && (
                          <div className="flex gap-1">
                            {['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'].map((color) => (
                              <button
                                key={color}
                                className="w-6 h-6 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        )}
                        
                        {item.type === 'nav' && (
                          <ChevronRight className="w-5 h-5 text-text-muted" />
                        )}
                        
                        {!item.type && (
                          <ChevronRight className="w-5 h-5 text-text-muted" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl bg-accent-pink/10 text-accent-pink font-medium hover:bg-accent-pink/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        )}

        {/* Version */}
        <p className="text-center text-xs text-text-muted mt-6">
          小龙虾音乐 v1.0.0 · Made with ❤️ by AI
        </p>
      </div>
    </div>
  )
}
