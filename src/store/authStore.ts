import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { mockUsers } from '../data/mockData'
import { authService, userService } from '../lib/services'
import { isSupabaseConfigured } from '../lib/supabase'

interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  supabaseMode: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, username: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  initAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      supabaseMode: false,

      initAuth: async () => {
        if (!isSupabaseConfigured()) {
          return
        }

        set({ isLoading: true })
        try {
          const user = await authService.getCurrentUser()
          if (user) {
            const profile = await userService.getProfile(user.id)
            if (profile) {
              set({
                currentUser: {
                  id: profile.id,
                  username: profile.username,
                  avatar: profile.avatar_url || '',
                  bio: profile.bio || '',
                  followers: profile.followers_count,
                  following: profile.following_count,
                  songs: profile.songs_count,
                  createdAt: profile.created_at,
                },
                isAuthenticated: true,
                supabaseMode: true,
                isLoading: false
              })
            }
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('Init auth error:', error)
          set({ isLoading: false })
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })

        // 如果配置了 Supabase，优先使用
        if (isSupabaseConfigured()) {
          try {
            const data = await authService.signIn(email, password)
            if (data.user) {
              const profile = await userService.getProfile(data.user.id)
              if (profile) {
                set({
                  currentUser: {
                    id: profile.id,
                    username: profile.username,
                    avatar: profile.avatar_url || '',
                    bio: profile.bio || '',
                    followers: profile.followers_count,
                    following: profile.following_count,
                    songs: profile.songs_count,
                    createdAt: profile.created_at,
                  },
                  isAuthenticated: true,
                  supabaseMode: true,
                  isLoading: false
                })
                return true
              }
            }
          } catch (error: any) {
            set({ error: error.message || '登录失败', isLoading: false })
            return false
          }
        }

        // 演示模式
        await new Promise(resolve => setTimeout(resolve, 800))
        if (email && password) {
          const user = { ...mockUsers[0], email }
          set({ currentUser: user, isAuthenticated: true, isLoading: false })
          return true
        } else {
          set({ error: '请输入邮箱和密码', isLoading: false })
          return false
        }
      },

      register: async (email, username, password) => {
        set({ isLoading: true, error: null })

        if (isSupabaseConfigured()) {
          try {
            const data = await authService.signUp(email, password, username)
            if (data.user) {
              set({
                currentUser: {
                  id: data.user.id,
                  username,
                  avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}&backgroundColor=8b5cf6`,
                  bio: '新晋 AI 音乐创作者',
                  followers: 0,
                  following: 0,
                  songs: 0,
                  createdAt: new Date().toISOString(),
                },
                isAuthenticated: true,
                supabaseMode: true,
                isLoading: false
              })
              return true
            }
          } catch (error: any) {
            set({ error: error.message || '注册失败', isLoading: false })
            return false
          }
        }

        // 演示模式
        await new Promise(resolve => setTimeout(resolve, 800))
        if (email && username && password) {
          const newUser: User = {
            id: `u${Date.now()}`,
            username,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}&backgroundColor=8b5cf6`,
            bio: '新晋 AI 音乐创作者',
            followers: 0,
            following: 0,
            songs: 0,
            createdAt: new Date().toISOString().split('T')[0],
          }
          set({ currentUser: { ...newUser, email } as User, isAuthenticated: true, isLoading: false })
          return true
        } else {
          set({ error: '请填写所有字段', isLoading: false })
          return false
        }
      },

      logout: async () => {
        if (isSupabaseConfigured() && get().supabaseMode) {
          await authService.signOut()
        }
        set({ currentUser: null, isAuthenticated: false, supabaseMode: false })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'xiaolongxia-auth-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        supabaseMode: state.supabaseMode
      })
    }
  )
)

// 初始化认证状态
if (typeof window !== 'undefined') {
  useAuthStore.getState().initAuth()
}
