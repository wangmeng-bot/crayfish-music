import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Comment } from '../types'
import { commentService } from '../lib/services'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuthStore } from './authStore'

interface CommentStore {
  // 评论数据：songId -> 评论列表
  commentsBySong: Record<string, Comment[]>
  // 是否已加载远程数据
  isLoaded: boolean

  // 获取歌曲的所有评论
  getComments: (songId: string) => Comment[]

  // 添加评论
  addComment: (songId: string, content: string) => Promise<void>

  // 回复评论
  addReply: (songId: string, commentId: string, content: string) => Promise<void>

  // 删除评论
  deleteComment: (songId: string, commentId: string) => Promise<void>

  // 点赞评论
  likeComment: (songId: string, commentId: string) => Promise<void>

  // 获取评论数量
  getCommentCount: (songId: string) => number

  // 加载远程数据
  loadComments: (songId: string) => Promise<void>
}

// 模拟初始评论数据
const initialComments: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1',
      userId: 'u2',
      username: 'AI音乐发烧友',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      content: '这首曲子太有感觉了！Suno生成的旋律层次感很强，前奏就抓住了耳朵 🎵',
      createdAt: '2024-01-15T10:30:00Z',
      likes: 42,
      replies: [
        {
          id: 'c1r1',
          userId: 'u3',
          username: '电子音乐人',
          userAvatar: 'https://i.pravatar.cc/150?img=5',
          content: '同意！Suno在氛围音乐上真的很强',
          createdAt: '2024-01-15T11:00:00Z',
          likes: 12,
          replies: []
        }
      ]
    },
    {
      id: 'c2',
      userId: 'u4',
      username: '创作新人小王',
      userAvatar: 'https://i.pravatar.cc/150?img=8',
      content: '请问是用Suno的什么模式生成的？我也想试试这种风格',
      createdAt: '2024-01-16T14:20:00Z',
      likes: 8,
      replies: []
    }
  ],
  '2': [
    {
      id: 'c3',
      userId: 'u5',
      username: 'HipHop爱好者',
      userAvatar: 'https://i.pravatar.cc/150?img=12',
      content: 'flow太稳了！Verse和Hook的衔接很自然，完全听不出是AI生成的',
      createdAt: '2024-01-14T09:15:00Z',
      likes: 56,
      replies: []
    }
  ],
  '3': [
    {
      id: 'c4',
      userId: 'u6',
      username: '古风控',
      userAvatar: 'https://i.pravatar.cc/150?img=20',
      content: '编曲太有意境了！二胡和琵琶的音色用AI还原得很到位 🌸',
      createdAt: '2024-01-13T16:45:00Z',
      likes: 89,
      replies: [
        {
          id: 'c4r1',
          userId: 'u7',
          username: '音乐制作人',
          userAvatar: 'https://i.pravatar.cc/150?img=25',
          content: '关键是人声也很自然，古风歌词押韵也做得很好',
          createdAt: '2024-01-13T17:30:00Z',
          likes: 34,
          replies: []
        }
      ]
    }
  ]
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const useCommentStore = create<CommentStore>()(
  persist(
    (set, get) => ({
      commentsBySong: initialComments,
      isLoaded: false,

      getComments: (songId: string) => {
        return get().commentsBySong[songId] || []
      },

      addComment: async (songId: string, content: string) => {
        const user = useAuthStore.getState().currentUser
        if (!user) return

        const newComment: Comment = {
          id: generateId(),
          userId: user.id,
          username: user.username,
          userAvatar: user.avatar,
          content,
          createdAt: new Date().toISOString(),
          likes: 0,
          replies: []
        }

        set((state) => {
          const songComments = state.commentsBySong[songId] || []
          return {
            commentsBySong: {
              ...state.commentsBySong,
              [songId]: [newComment, ...songComments]
            }
          }
        })

        if (isSupabaseConfigured()) {
          try {
            await commentService.addComment(user.id, songId, content)
          } catch (error) {
            console.error('Add comment error:', error)
          }
        }
      },

      addReply: async (songId: string, commentId: string, content: string) => {
        const user = useAuthStore.getState().currentUser
        if (!user) return

        const newReply: Comment = {
          id: generateId(),
          userId: user.id,
          username: user.username,
          userAvatar: user.avatar,
          content,
          createdAt: new Date().toISOString(),
          likes: 0,
          replies: []
        }

        set((state) => {
          const songComments = state.commentsBySong[songId] || []
          const updatedComments = songComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [...comment.replies, newReply]
              }
            }
            return comment
          })
          return {
            commentsBySong: {
              ...state.commentsBySong,
              [songId]: updatedComments
            }
          }
        })

        if (isSupabaseConfigured()) {
          try {
            await commentService.addComment(user.id, songId, content, commentId)
          } catch (error) {
            console.error('Add reply error:', error)
          }
        }
      },

      deleteComment: async (songId: string, commentId: string) => {
        set((state) => {
          const songComments = state.commentsBySong[songId] || []

          // 检查是否是主评论
          const mainComment = songComments.find(c => c.id === commentId)
          let updatedComments: Comment[]

          if (mainComment) {
            // 删除主评论
            updatedComments = songComments.filter(c => c.id !== commentId)
          } else {
            // 删除回复
            updatedComments = songComments.map(comment => ({
              ...comment,
              replies: comment.replies.filter(r => r.id !== commentId)
            }))
          }

          return {
            commentsBySong: {
              ...state.commentsBySong,
              [songId]: updatedComments
            }
          }
        })

        if (isSupabaseConfigured()) {
          try {
            await commentService.deleteComment(commentId)
          } catch (error) {
            console.error('Delete comment error:', error)
          }
        }
      },

      likeComment: async (songId: string, commentId: string) => {
        // 更新本地状态
        set((state) => {
          const songComments = state.commentsBySong[songId] || []
          const updatedComments = songComments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, likes: comment.likes + 1 }
            }
            if (comment.replies.some(r => r.id === commentId)) {
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply.id === commentId) {
                    return { ...reply, likes: reply.likes + 1 }
                  }
                  return reply
                })
              }
            }
            return comment
          })
          return {
            commentsBySong: {
              ...state.commentsBySong,
              [songId]: updatedComments
            }
          }
        })

        if (isSupabaseConfigured()) {
          try {
            await commentService.likeComment(commentId)
          } catch (error) {
            console.error('Like comment error:', error)
          }
        }
      },

      getCommentCount: (songId: string) => {
        const comments = get().commentsBySong[songId] || []
        return comments.reduce((total, comment) => {
          return total + 1 + comment.replies.length
        }, 0)
      },

      loadComments: async (songId: string) => {
        if (!isSupabaseConfigured()) return

        try {
          const remoteComments = await commentService.getComments(songId)
          if (remoteComments.length > 0) {
            // 转换远程评论格式
            const formattedComments: Comment[] = remoteComments.map(c => ({
              id: c.id,
              userId: c.user_id,
              username: '', // 需要关联 profiles 表
              userAvatar: '', // 需要关联 profiles 表
              content: c.content,
              createdAt: c.created_at,
              likes: c.like_count,
              replies: (c as any).replies?.map((r: any) => ({
                id: r.id,
                userId: r.user_id,
                username: '',
                userAvatar: '',
                content: r.content,
                createdAt: r.created_at,
                likes: r.like_count,
                replies: []
              })) || []
            }))

            // 合并本地和远程数据
            set((state) => ({
              commentsBySong: {
                ...state.commentsBySong,
                [songId]: formattedComments
              },
              isLoaded: true
            }))
          }
        } catch (error) {
          console.error('Load comments error:', error)
        }
      }
    }),
    {
      name: 'xiaolongxia-comments-storage'
    }
  )
)
