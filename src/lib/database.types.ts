// Supabase Database Types
// 对应 supabase.sql 中的表结构

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          bio: string | null
          followers_count: number
          following_count: number
          songs_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          followers_count?: number
          following_count?: number
          songs_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          followers_count?: number
          following_count?: number
          songs_count?: number
          updated_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          description: string | null
          audio_url: string
          cover_url: string | null
          lrc_url: string | null
          plain_lyrics: string | null
          ai_tool: 'Suno' | 'Udio' | 'MusicGen' | 'Stable Audio' | '其他'
          style_tags: string[]
          creator_id: string
          play_count: number
          like_count: number
          comment_count: number
          duration: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          audio_url: string
          cover_url?: string | null
          lrc_url?: string | null
          plain_lyrics?: string | null
          ai_tool: 'Suno' | 'Udio' | 'MusicGen' | 'Stable Audio' | '其他'
          style_tags?: string[]
          creator_id: string
          play_count?: number
          like_count?: number
          comment_count?: number
          duration?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          audio_url?: string
          cover_url?: string | null
          lrc_url?: string | null
          plain_lyrics?: string | null
          ai_tool?: 'Suno' | 'Udio' | 'MusicGen' | 'Stable Audio' | '其他'
          style_tags?: string[]
          play_count?: number
          like_count?: number
          comment_count?: number
          duration?: number
          is_public?: boolean
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          song_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          song_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          song_id?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          song_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          song_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          song_id?: string
        }
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          title: string
          cover_url: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          cover_url?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          cover_url?: string | null
          is_public?: boolean
          updated_at?: string
        }
      }
      playlist_songs: {
        Row: {
          id: string
          playlist_id: string
          song_id: string
          added_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          song_id: string
          added_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          song_id?: string
        }
      }
      comments: {
        Row: {
          id: string
          song_id: string
          user_id: string
          content: string
          parent_id: string | null
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          song_id: string
          user_id: string
          content: string
          parent_id?: string | null
          like_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          like_count?: number
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'like' | 'comment' | 'follow' | 'system' | 'milestone'
          title: string | null
          content: string
          avatar_url: string | null
          link: string | null
          is_read: boolean
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'like' | 'comment' | 'follow' | 'system' | 'milestone'
          title?: string | null
          content: string
          avatar_url?: string | null
          link?: string | null
          is_read?: boolean
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'like' | 'comment' | 'follow' | 'system' | 'milestone'
          title?: string | null
          content?: string
          avatar_url?: string | null
          link?: string | null
          is_read?: boolean
          metadata?: Record<string, any> | null
        }
      }
    }
  }
}

// 辅助函数：将数据库行转换为应用类型
export const transformProfile = (row: Database['public']['Tables']['profiles']['Row']) => ({
  id: row.id,
  username: row.username,
  avatar: row.avatar_url || '',
  bio: row.bio || '',
  followers: row.followers_count,
  following: row.following_count,
  songs: row.songs_count,
  createdAt: row.created_at,
})

export const transformSong = (row: Database['public']['Tables']['songs']['Row']) => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  audioUrl: row.audio_url,
  coverUrl: row.cover_url || '',
  lrcUrl: row.lrc_url,
  plainLyrics: row.plain_lyrics,
  aiTool: row.ai_tool,
  styleTags: row.style_tags,
  creatorId: row.creator_id,
  playCount: row.play_count,
  likeCount: row.like_count,
  commentCount: row.comment_count,
  duration: row.duration,
  isPublic: row.is_public,
  createdAt: row.created_at,
})
