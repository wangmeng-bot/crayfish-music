import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Database } from '../lib/database.types'

export type NotificationType = 'like' | 'comment' | 'follow' | 'system' | 'milestone'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  content: string
  avatar?: string
  link?: string
  isRead: boolean
  createdAt: string
  metadata?: Record<string, any> // 附加数据，如 songId, userId 等
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  realtimeEnabled: boolean

  // 操作
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  
  // 数据加载
  loadNotifications: (userId: string) => Promise<void>
  refreshNotifications: () => Promise<void>
  
  // 实时通知
  enableRealtime: (userId: string) => void
  disableRealtime: () => void
}

// 获取用户头像
const getUserAvatar = async (userId: string): Promise<string | undefined> => {
  if (!isSupabaseConfigured()) return undefined
  try {
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()
    return data?.avatar_url || undefined
  } catch {
    return undefined
  }
}

// 模拟初始通知数据
const getMockNotifications = (): Notification[] => [
  {
    id: 'mock-1',
    type: 'like',
    title: '收到新的点赞',
    content: '用户「星空漫步」赞了你的歌曲《夜曲》',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    link: '/song/1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 'mock-2',
    type: 'comment',
    title: '收到新的评论',
    content: '用户「音乐精灵」评论了你的歌曲《晴天》：「这首歌太治愈了！」',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    link: '/song/2',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'mock-3',
    type: 'follow',
    title: '收到新的关注',
    content: '用户「电音小子」关注了你',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    link: '/profile',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'mock-4',
    type: 'system',
    title: '恭喜进入热歌榜',
    content: '你的歌曲《起风了》已进入新歌榜 Top 10！',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'mock-5',
    type: 'milestone',
    title: '里程碑达成',
    content: '恭喜！你的作品总播放量突破 100 万！',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  }
]

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: getMockNotifications(),
      unreadCount: 3,
      isLoading: false,
      realtimeEnabled: false,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isRead: false,
          createdAt: new Date().toISOString()
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }))

        // 如果已配置 Supabase，同步到服务器
        if (isSupabaseConfigured()) {
          syncNotificationToServer(newNotification).catch(console.error)
        }
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          if (!notification || notification.isRead) return state

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }
        })

        // 同步到服务器
        if (isSupabaseConfigured()) {
          markNotificationReadOnServer(id).catch(console.error)
        }
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0
        }))

        // 同步到服务器
        if (isSupabaseConfigured()) {
          markAllNotificationsReadOnServer().catch(console.error)
        }
      },

      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.isRead
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount
          }
        })

        // 同步到服务器
        if (isSupabaseConfigured()) {
          deleteNotificationOnServer(id).catch(console.error)
        }
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      // 从 Supabase 加载通知
      loadNotifications: async (userId: string) => {
        if (!isSupabaseConfigured()) {
          // 使用模拟数据
          const mockNotifications = getMockNotifications()
          set({
            notifications: mockNotifications,
            unreadCount: mockNotifications.filter(n => !n.isRead).length
          })
          return
        }

        set({ isLoading: true })
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50)

          if (error) throw error

          const notifications: Notification[] = (data || []).map(row => ({
            id: row.id,
            type: row.type as NotificationType,
            title: row.title || '',
            content: row.content,
            avatar: (row as any).avatar_url || undefined,
            link: (row as any).link || undefined,
            isRead: (row as any).is_read || false,
            createdAt: row.created_at,
            metadata: (row as any).metadata || {}
          }))

          set({
            notifications,
            unreadCount: notifications.filter(n => !n.isRead).length,
            isLoading: false
          })
        } catch (error) {
          console.error('加载通知失败:', error)
          // 失败时使用模拟数据
          const mockNotifications = getMockNotifications()
          set({
            notifications: mockNotifications,
            unreadCount: mockNotifications.filter(n => !n.isRead).length,
            isLoading: false
          })
        }
      },

      refreshNotifications: async () => {
        if (!isSupabaseConfigured()) return
        
        try {
          // 重新加载通知
          const { data } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

          if (data) {
            const notifications: Notification[] = data.map(row => ({
              id: row.id,
              type: row.type as NotificationType,
              title: (row as any).title || '',
              content: row.content,
              avatar: (row as any).avatar_url || undefined,
              link: (row as any).link || undefined,
              isRead: (row as any).is_read || false,
              createdAt: row.created_at
            }))

            set({
              notifications,
              unreadCount: notifications.filter(n => !n.isRead).length
            })
          }
        } catch (error) {
          console.error('刷新通知失败:', error)
        }
      },

      // 启用实时通知
      enableRealtime: (userId: string) => {
        if (!isSupabaseConfigured()) {
          console.warn('Supabase 未配置，无法启用实时通知')
          return
        }

        // 取消之前的订阅
        get().disableRealtime()

        // 订阅新通知
        const channel = supabase
          .channel('notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`
            },
            async (payload) => {
              const newNotification: Notification = {
                id: payload.new.id,
                type: payload.new.type as NotificationType,
                title: payload.new.title || '',
                content: payload.new.content,
                avatar: payload.new.avatar_url || undefined,
                link: payload.new.link || undefined,
                isRead: payload.new.is_read,
                createdAt: payload.new.created_at
              }

              set((state) => ({
                notifications: [newNotification, ...state.notifications],
                unreadCount: state.unreadCount + 1
              }))

              // 可以添加浏览器通知
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(newNotification.title, {
                  body: newNotification.content,
                  icon: newNotification.avatar
                })
              }
            }
          )
          .subscribe()

        set({ realtimeEnabled: true })
      },

      // 禁用实时通知
      disableRealtime: () => {
        if (isSupabaseConfigured()) {
          supabase.removeChannel(supabase.channel('notifications'))
        }
        set({ realtimeEnabled: false })
      }
    }),
    {
      name: 'xiaolongxia-notifications'
    }
  )
)

// 后端同步函数

async function syncNotificationToServer(notification: Notification) {
  if (!isSupabaseConfigured()) return
  
  try {
    await supabase.from('notifications').insert({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      avatar_url: notification.avatar,
      link: notification.link,
      is_read: notification.isRead,
      metadata: notification.metadata
    })
  } catch (error) {
    console.error('同步通知到服务器失败:', error)
  }
}

async function markNotificationReadOnServer(id: string) {
  if (!isSupabaseConfigured()) return
  
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
  } catch (error) {
    console.error('标记通知已读失败:', error)
  }
}

async function markAllNotificationsReadOnServer() {
  if (!isSupabaseConfigured()) return
  
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
  } catch (error) {
    console.error('标记全部通知已读失败:', error)
  }
}

async function deleteNotificationOnServer(id: string) {
  if (!isSupabaseConfigured()) return
  
  try {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
  } catch (error) {
    console.error('删除通知失败:', error)
  }
}

// 辅助函数：请求浏览器通知权限
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('此浏览器不支持通知')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}
