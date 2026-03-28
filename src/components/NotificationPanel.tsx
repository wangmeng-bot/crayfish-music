import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, UserPlus, Bell, Check, Trash2, X } from 'lucide-react'
import { useNotificationStore, NotificationType } from '../store/notificationStore'
import { formatTimeAgo } from '../lib/utils'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotificationStore()

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // 获取通知图标
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-400" />
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-400" />
      case 'system':
        return <Bell className="w-4 h-4 text-yellow-400" />
    }
  }

  // 获取通知背景色
  const getNotificationBg = (type: NotificationType, isRead: boolean) => {
    if (!isRead) {
      switch (type) {
        case 'like':
          return 'bg-pink-500/10'
        case 'comment':
          return 'bg-blue-500/10'
        case 'follow':
          return 'bg-green-500/10'
        case 'system':
          return 'bg-yellow-500/10'
      }
    }
    return 'bg-transparent'
  }

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-80 max-h-[480px] 
                 bg-[#0a0a1a] border border-cyan-500/20 rounded-xl shadow-2xl
                 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-white">通知</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-pink-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="p-1.5 text-cyan-400/60 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
              title="全部已读"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="p-1.5 text-cyan-400/60 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
              title="清空全部"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-cyan-400/60 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 通知列表 */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-cyan-400/40">
            <Bell className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">暂无通知</p>
          </div>
        ) : (
          <div className="divide-y divide-cyan-500/5">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                to={notification.link || '#'}
                onClick={() => {
                  markAsRead(notification.id)
                  onClose()
                }}
                className={`
                  flex items-start gap-3 p-3 hover:bg-cyan-500/5 transition-colors
                  ${getNotificationBg(notification.type, notification.isRead)}
                  ${!notification.isRead ? 'border-l-2 border-l-cyan-500' : ''}
                `}
              >
                {/* 头像或图标 */}
                {notification.avatar ? (
                  <img
                    src={notification.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full bg-cyan-500/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notification.isRead ? 'text-cyan-400/60' : 'text-white'}`}>
                    {notification.content}
                  </p>
                  <p className="text-xs text-cyan-400/40 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                  className="p-1 text-cyan-400/30 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* 未读指示器 */}
                {!notification.isRead && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
