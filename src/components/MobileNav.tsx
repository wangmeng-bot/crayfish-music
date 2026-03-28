import { Link, useLocation } from 'react-router-dom'
import { Home, Compass, Search, User, Plus } from 'lucide-react'
import { cn } from '../lib/utils'

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/discover', icon: Compass, label: '发现' },
  { path: '/search', icon: Search, label: '搜索' },
  { path: '/profile', icon: User, label: '我的' },
]

export default function MobileNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-lg border-t border-border md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-14 gap-1 transition-colors',
                isActive ? 'text-accent-purple' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'fill-current')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// 移动端上传按钮（悬浮在底部导航上方）
export function MobileUploadFAB() {
  return (
    <Link
      to="/upload"
      className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-accent-purple text-white flex items-center justify-center shadow-lg shadow-accent-purple/30 hover:scale-110 transition-transform md:hidden"
    >
      <Plus className="w-6 h-6" />
    </Link>
  )
}
