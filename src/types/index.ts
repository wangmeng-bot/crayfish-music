// AITune 类型定义

export interface User {
  id: string
  username: string
  avatar: string
  bio: string
  followers: number
  following: number
  songs: number
  createdAt: string
}

export interface Song {
  id: string
  title: string
  description: string
  audioUrl: string
  coverUrl: string
  lrcUrl?: string
  plainLyrics?: string
  aiTool: 'Suno' | 'Udio' | 'MusicGen' | 'Stable Audio' | '其他'
  styleTags: string[]
  creator: User
  playCount: number
  likeCount: number
  commentCount: number
  duration: number // 秒
  isPublic: boolean
  createdAt: string
}

export interface Comment {
  id: string
  songId?: string // 可选，因为评论可能在commentsBySong中按songId存储
  userId: string
  username: string
  userAvatar: string
  content: string
  likes: number
  replies: Comment[]
  createdAt: string
}

export interface Playlist {
  id: string
  title: string
  coverUrl: string
  songs: string[] // 歌曲ID数组
  songCount?: number
  user?: User
  creatorId?: string
  isPublic: boolean
  createdAt: string
}

export interface LrcLine {
  time: number // 秒
  text: string
}

export type SortBy = 'latest' | 'popular' | 'random'
export type PlayMode = 'order' | 'repeat' | 'shuffle'
