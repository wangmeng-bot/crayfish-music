import { supabase, isSupabaseConfigured } from './supabase'
import type { Database } from './database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Song = Database['public']['Tables']['songs']['Row']
type Comment = Database['public']['Tables']['comments']['Row']
type Playlist = Database['public']['Tables']['playlists']['Row']

// ============================================
// 认证服务
// ============================================

export const authService = {
  // 注册
  async signUp(email: string, password: string, username: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })
    if (error) throw error
    return data
  },

  // 登录
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // 获取当前用户
  async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      return null
    }
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // 监听认证状态变化
  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}

// ============================================
// 用户服务
// ============================================

export const userService = {
  // 获取用户资料
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured()) {
      return null
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  // 更新用户资料
  async updateProfile(userId: string, updates: Partial<Profile>) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 获取用户作品列表
  async getUserSongs(userId: string): Promise<Song[]> {
    if (!isSupabaseConfigured()) {
      return []
    }
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('creator_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }
}

// ============================================
// 歌曲服务
// ============================================

export const songService = {
  // 获取歌曲列表
  async getSongs(options?: {
    aiTool?: string
    styleTag?: string
    sort?: 'latest' | 'popular'
    limit?: number
  }): Promise<Song[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    let query = supabase
      .from('songs')
      .select('*')
      .eq('is_public', true)

    if (options?.aiTool) {
      query = query.eq('ai_tool', options.aiTool)
    }

    if (options?.styleTag) {
      query = query.contains('style_tags', [options.styleTag])
    }

    if (options?.sort === 'latest') {
      query = query.order('created_at', { ascending: false })
    } else if (options?.sort === 'popular') {
      query = query.order('play_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // 获取单个歌曲
  async getSong(songId: string): Promise<Song | null> {
    if (!isSupabaseConfigured()) {
      return null
    }
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', songId)
      .single()
    if (error) throw error
    return data
  },

  // 创建歌曲
  async createSong(song: Omit<Song, 'id' | 'created_at' | 'updated_at' | 'play_count' | 'like_count' | 'comment_count'>) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { data, error } = await supabase
      .from('songs')
      .insert(song)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 更新歌曲
  async updateSong(songId: string, updates: Partial<Song>) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { data, error } = await supabase
      .from('songs')
      .update(updates)
      .eq('id', songId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 删除歌曲
  async deleteSong(songId: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)
    if (error) throw error
  },

  // 增加播放量
  async incrementPlayCount(songId: string) {
    if (!isSupabaseConfigured()) {
      return
    }
    const { error } = await supabase.rpc('increment_play_count', { song_id: songId })
    if (error) {
      // 如果 RPC 不存在，直接更新
      await supabase
        .from('songs')
        .update({ play_count: supabase.sql`play_count + 1` })
        .eq('id', songId)
    }
  },

  // 搜索歌曲
  async searchSongs(query: string): Promise<Song[]> {
    if (!isSupabaseConfigured()) {
      return []
    }
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('is_public', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('play_count', { ascending: false })
    if (error) throw error
    return data || []
  }
}

// ============================================
// 点赞/收藏服务
// ============================================

export const interactionService = {
  // 点赞
  async toggleLike(userId: string, songId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }

    // 检查是否已点赞
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('song_id', songId)
      .single()

    if (existing) {
      // 取消点赞
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('song_id', songId)

      // 更新歌曲点赞数
      await supabase
        .from('songs')
        .update({ like_count: supabase.sql`like_count - 1` })
        .eq('id', songId)

      return false
    } else {
      // 添加点赞
      await supabase
        .from('likes')
        .insert({ user_id: userId, song_id: songId })

      // 更新歌曲点赞数
      await supabase
        .from('songs')
        .update({ like_count: supabase.sql`like_count + 1` })
        .eq('id', songId)

      return true
    }
  },

  // 检查是否已点赞
  async isLiked(userId: string, songId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false
    }
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('song_id', songId)
      .single()
    return !!data
  },

  // 获取用户点赞的歌曲
  async getUserLikes(userId: string): Promise<string[]> {
    if (!isSupabaseConfigured()) {
      return []
    }
    const { data, error } = await supabase
      .from('likes')
      .select('song_id')
      .eq('user_id', userId)
    if (error) throw error
    return data?.map(d => d.song_id) || []
  },

  // 收藏
  async toggleFavorite(userId: string, songId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }

    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('song_id', songId)
      .single()

    if (existing) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('song_id', songId)
      return false
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, song_id: songId })
      return true
    }
  },

  // 检查是否已收藏
  async isFavorited(userId: string, songId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false
    }
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('song_id', songId)
      .single()
    return !!data
  },

  // 获取用户收藏的歌曲
  async getUserFavorites(userId: string): Promise<Song[]> {
    if (!isSupabaseConfigured()) {
      return []
    }
    const { data, error } = await supabase
      .from('favorites')
      .select('song_id, songs(*)')
      .eq('user_id', userId)
    if (error) throw error

    // 提取歌曲数据
    return data?.map(d => (d as any).songs).filter(Boolean) || []
  }
}

// ============================================
// 评论服务
// ============================================

export const commentService = {
  // 获取歌曲评论
  async getComments(songId: string): Promise<Comment[]> {
    if (!isSupabaseConfigured()) {
      return []
    }
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('song_id', songId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
    if (error) throw error

    // 获取回复
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select('*')
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true })
        return { ...comment, replies: replies || [] }
      })
    )

    return commentsWithReplies
  },

  // 添加评论
  async addComment(userId: string, songId: string, content: string, parentId?: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        song_id: songId,
        content,
        parent_id: parentId || null
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 删除评论
  async deleteComment(commentId: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
    if (error) throw error
  },

  // 点赞评论
  async likeComment(commentId: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { error } = await supabase
      .from('comments')
      .update({ like_count: supabase.sql`like_count + 1` })
      .eq('id', commentId)
    if (error) throw error
  }
}

// ============================================
// 歌单服务
// ============================================

export const playlistService = {
  // 获取用户歌单
  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    if (!isSupabaseConfigured()) {
      return []
    }
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  // 创建歌单
  async createPlaylist(userId: string, title: string): Promise<Playlist> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { data, error } = await supabase
      .from('playlists')
      .insert({ user_id: userId, title })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 添加歌曲到歌单
  async addToPlaylist(playlistId: string, songId: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { error } = await supabase
      .from('playlist_songs')
      .insert({ playlist_id: playlistId, song_id: songId })
    if (error && error.code !== '23505') throw error // 忽略重复错误
  },

  // 从歌单移除歌曲
  async removeFromPlaylist(playlistId: string, songId: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId)
    if (error) throw error
  },

  // 删除歌单
  async deletePlaylist(playlistId: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId)
    if (error) throw error
  }
}

// ============================================
// 关注服务
// ============================================

export const followService = {
  // 关注/取消关注
  async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }

    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()

    if (existing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId)

      // 更新粉丝数
      await supabase
        .from('profiles')
        .update({ followers_count: supabase.sql`followers_count - 1` })
        .eq('id', followingId)

      await supabase
        .from('profiles')
        .update({ following_count: supabase.sql`following_count - 1` })
        .eq('id', followerId)

      return false
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId })

      await supabase
        .from('profiles')
        .update({ followers_count: supabase.sql`followers_count + 1` })
        .eq('id', followingId)

      await supabase
        .from('profiles')
        .update({ following_count: supabase.sql`following_count + 1` })
        .eq('id', followerId)

      return true
    }
  },

  // 检查是否已关注
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false
    }
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()
    return !!data
  }
}

// ============================================
// 通知服务
// ============================================

type NotificationType = 'like' | 'comment' | 'follow' | 'system' | 'milestone'

export const notificationService = {
  // 获取用户通知
  async getNotifications(userId: string, limit = 50) {
    if (!isSupabaseConfigured()) {
      return []
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  },

  // 获取未读通知数
  async getUnreadCount(userId: string): Promise<number> {
    if (!isSupabaseConfigured()) {
      return 0
    }
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    if (error) throw error
    return count || 0
  },

  // 标记通知已读
  async markAsRead(notificationId: string) {
    if (!isSupabaseConfigured()) {
      return
    }
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    if (error) throw error
  },

  // 标记所有通知已读
  async markAllAsRead(userId: string) {
    if (!isSupabaseConfigured()) {
      return
    }
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    if (error) throw error
  },

  // 删除通知
  async deleteNotification(notificationId: string) {
    if (!isSupabaseConfigured()) {
      return
    }
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
    if (error) throw error
  },

  // 创建通知
  async createNotification(notification: {
    user_id: string
    type: NotificationType
    title?: string
    content: string
    avatar_url?: string
    link?: string
    metadata?: Record<string, any>
  }) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 订阅实时通知
  subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    if (!isSupabaseConfigured()) {
      return null
    }
    
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new)
        }
      )
      .subscribe()

    return channel
  }
}

// ============================================
// 文件上传服务
// ============================================

export const storageService = {
  // 上传音频
  async uploadAudio(userId: string, file: File): Promise<string> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }

    const ext = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('audio')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(data.path)

    return publicUrl
  },

  // 上传封面
  async uploadCover(userId: string, file: File): Promise<string> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }

    const ext = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('covers')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(data.path)

    return publicUrl
  },

  // 上传歌词
  async uploadLyrics(userId: string, file: File): Promise<string> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }

    const ext = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('lyrics')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('lyrics')
      .getPublicUrl(data.path)

    return publicUrl
  },

  // 删除文件
  async deleteFile(bucket: string, path: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置')
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  }
}
