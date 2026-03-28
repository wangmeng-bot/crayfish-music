import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Flame, TrendingUp, Play, Eye, Heart, Clock, Loader2 } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { songService, isSupabaseConfigured } from '../lib/services'
import { transformSong } from '../lib/database.types'

// 排行榜类型
type RankType = 'hot' | 'new' | 'trending'

// 排行榜歌曲类型（兼容前端）
interface LeaderboardSong {
  id: string
  title: string
  artist: { id: string; name: string; avatar: string }
  cover: string
  audio: string
  duration: number
  playCount: number
  likeCount: number
  commentCount: number
  createdAt: string
  lyrics?: string
}

// 模拟排行榜数据（Supabase 未配置时使用）
const MOCK_LEADERBOARD: LeaderboardSong[] = [
  {
    id: '1',
    title: '夜曲',
    artist: { id: 'a1', name: '星空漫步', avatar: '' },
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 210,
    playCount: 2580000,
    likeCount: 185000,
    commentCount: 23400,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: '晴天',
    artist: { id: 'a1', name: '音乐精灵', avatar: '' },
    cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 245,
    playCount: 2350000,
    likeCount: 168000,
    commentCount: 19800,
    createdAt: '2024-02-20'
  },
  {
    id: '3',
    title: '稻香',
    artist: { id: 'a1', name: '电音小子', avatar: '' },
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 198,
    playCount: 1980000,
    likeCount: 142000,
    commentCount: 15600,
    createdAt: '2024-03-10'
  },
  {
    id: '4',
    title: '起风了',
    artist: { id: 'a2', name: '海风轻拂', avatar: '' },
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 312,
    playCount: 1820000,
    likeCount: 135000,
    commentCount: 21200,
    createdAt: '2024-04-05'
  },
  {
    id: '5',
    title: '说散就散',
    artist: { id: 'a3', name: '午夜电台', avatar: '' },
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 225,
    playCount: 1650000,
    likeCount: 118000,
    commentCount: 14500,
    createdAt: '2024-05-18'
  },
  {
    id: '6',
    title: '光年之外',
    artist: { id: 'a4', name: '梦境制造者', avatar: '' },
    cover: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=300&h=300&fit=crop',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 234,
    playCount: 1520000,
    likeCount: 105000,
    commentCount: 12800,
    createdAt: '2024-06-22'
  },
  {
    id: '7',
    title: '演员',
    artist: { id: 'a5', name: '雨后彩虹', avatar: '' },
    cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    duration: 268,
    playCount: 1380000,
    likeCount: 98000,
    commentCount: 11200,
    createdAt: '2024-07-30'
  },
  {
    id: '8',
    title: '七里香',
    artist: { id: 'a1', name: '星空漫步', avatar: '' },
    cover: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 289,
    playCount: 1290000,
    likeCount: 92000,
    commentCount: 9800,
    createdAt: '2024-08-12'
  },
  {
    id: '9',
    title: '体面',
    artist: { id: 'a6', name: '时间旅人', avatar: '' },
    cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=300&h=300&fit=crop',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    duration: 245,
    playCount: 1150000,
    likeCount: 85000,
    commentCount: 8900,
    createdAt: '2024-09-05'
  },
  {
    id: '10',
    title: '年少有为',
    artist: { id: 'a7', name: '追梦少年', avatar: '' },
    cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    duration: 256,
    playCount: 1020000,
    likeCount: 78000,
    commentCount: 7600,
    createdAt: '2024-10-18'
  }
]

// 模拟新歌数据（按时间排序）
const MOCK_NEW_SONGS = [...MOCK_LEADERBOARD].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
)

// 模拟趋势数据（按增长计算）
const MOCK_TRENDING = [...MOCK_LEADERBOARD].sort(
  (a, b) => (b.playCount * 1.2 + b.likeCount * 0.8) - (a.playCount * 1.2 + a.likeCount * 0.8)
)

export default function LeaderboardPage() {
  const [rankType, setRankType] = useState<RankType>('hot')
  const [loading, setLoading] = useState(false)
  const [songs, setSongs] = useState<LeaderboardSong[]>(MOCK_LEADERBOARD)
  const { playSong, currentSong } = usePlayerStore()

  // 从 Supabase 获取排行榜数据
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!isSupabaseConfigured()) {
        // 使用 mock 数据
        switch (rankType) {
          case 'hot':
            setSongs(MOCK_LEADERBOARD)
            break
          case 'new':
            setSongs(MOCK_NEW_SONGS)
            break
          case 'trending':
            setSongs(MOCK_TRENDING)
            break
        }
        return
      }

      setLoading(true)
      try {
        let result
        
        switch (rankType) {
          case 'hot':
            // 热歌榜：按播放量排序
            result = await songService.getSongs({ sort: 'popular', limit: 50 })
            setSongs(result.map(song => ({
              id: song.id,
              title: song.title,
              artist: { id: song.creator_id, name: '', avatar: '' },
              cover: song.cover_url || '',
              audio: song.audio_url,
              duration: song.duration,
              playCount: song.play_count,
              likeCount: song.like_count,
              commentCount: song.comment_count,
              createdAt: song.created_at,
              lyrics: song.plain_lyrics || song.lrc_url || undefined
            })))
            break
            
          case 'new':
            // 新歌榜：按时间排序
            result = await songService.getSongs({ sort: 'latest', limit: 50 })
            setSongs(result.map(song => ({
              id: song.id,
              title: song.title,
              artist: { id: song.creator_id, name: '', avatar: '' },
              cover: song.cover_url || '',
              audio: song.audio_url,
              duration: song.duration,
              playCount: song.play_count,
              likeCount: song.like_count,
              commentCount: song.comment_count,
              createdAt: song.created_at,
              lyrics: song.plain_lyrics || song.lrc_url || undefined
            })))
            break
            
          case 'trending':
            // 飙升榜：按点赞增长估算
            result = await songService.getSongs({ sort: 'popular', limit: 50 })
            setSongs(result.map(song => ({
              id: song.id,
              title: song.title,
              artist: { id: song.creator_id, name: '', avatar: '' },
              cover: song.cover_url || '',
              audio: song.audio_url,
              duration: song.duration,
              playCount: song.play_count,
              likeCount: song.like_count,
              commentCount: song.comment_count,
              createdAt: song.created_at,
              lyrics: song.plain_lyrics || song.lrc_url || undefined
            })).sort((a, b) => (b.likeCount * 1.5 + b.playCount * 0.5) - (a.likeCount * 1.5 + a.playCount * 0.5)))
            break
        }
      } catch (error) {
        console.error('获取排行榜失败:', error)
        // 失败时使用 mock 数据
        switch (rankType) {
          case 'hot':
            setSongs(MOCK_LEADERBOARD)
            break
          case 'new':
            setSongs(MOCK_NEW_SONGS)
            break
          case 'trending':
            setSongs(MOCK_TRENDING)
            break
        }
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [rankType])

  // 格式化播放量
  const formatPlayCount = (count: number) => {
    if (count >= 100000000) return `${(count / 100000000).toFixed(1)}亿`
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`
    return count.toString()
  }

  // 播放歌曲
  const handlePlay = (song: LeaderboardSong) => {
    playSong({
      id: song.id,
      title: song.title,
      artist: song.artist.name,
      cover: song.cover,
      audioUrl: song.audio,
      duration: song.duration
    })
  }

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
    if (rank === 2) return <Trophy className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
    if (rank === 3) return <Trophy className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
    return <span className="text-sm md:text-lg font-bold text-cyan-400/40">#{rank}</span>
  }

  // 获取排行榜类型描述
  const getRankTypeDescription = () => {
    switch (rankType) {
      case 'hot':
        return '播放量最高的歌曲'
      case 'new':
        return '最新发布的歌曲'
      case 'trending':
        return '近期飙升最快的歌曲'
    }
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      {/* 顶部标题 */}
      <div className="sticky top-0 z-10 bg-[#0a0a1a]/95 backdrop-blur-lg border-b border-cyan-500/10">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            排行榜
          </h1>
          <p className="text-xs md:text-sm text-cyan-400/50 mt-1">
            {loading ? '加载中...' : getRankTypeDescription()}
          </p>
        </div>

        {/* 排行榜类型切换 - 移动端适配 */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setRankType('hot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
              rankType === 'hot'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                : 'bg-cyan-500/10 text-cyan-400/70 active:bg-cyan-500/20'
            }`}
          >
            <Flame className="w-3.5 h-3.5 md:w-4 md:h-4" />
            热歌榜
          </button>
          <button
            onClick={() => setRankType('new')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
              rankType === 'new'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'bg-cyan-500/10 text-cyan-400/70 active:bg-cyan-500/20'
            }`}
          >
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
            新歌榜
          </button>
          <button
            onClick={() => setRankType('trending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
              rankType === 'trending'
                ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-white'
                : 'bg-cyan-500/10 text-cyan-400/70 active:bg-cyan-500/20'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
            飙升榜
          </button>
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* 排行榜列表 - 移动端优化 */}
      {!loading && (
        <div className="px-3 md:px-4 py-3 md:py-4 space-y-2">
          {songs.map((song, index) => {
            const rank = index + 1
            const isPlaying = currentSong?.id === song.id

            return (
              <div
                key={song.id}
                className={`
                  flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl transition-all
                  ${isPlaying
                    ? 'bg-cyan-500/10 border border-cyan-500/20'
                    : 'bg-white/[0.02] active:bg-white/[0.04] border border-transparent'
                  }
                `}
              >
                {/* 排名 */}
                <div className="w-7 md:w-8 flex justify-center">
                  {getRankIcon(rank)}
                </div>

                {/* 封面 */}
                <Link
                  to={`/song/${song.id}`}
                  className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0"
                >
                  <img
                    src={song.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'}
                    alt={song.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'
                    }}
                  />
                </Link>

                {/* 歌曲信息 */}
                <Link
                  to={`/song/${song.id}`}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm md:text-base font-medium truncate ${isPlaying ? 'text-cyan-400' : 'text-white'}`}>
                      {song.title}
                    </h3>
                    {isPlaying && (
                      <div className="flex items-center gap-0.5">
                        <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        <span className="w-1 h-1.5 bg-cyan-400/60 rounded-full animate-pulse delay-75" />
                        <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse delay-150" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-cyan-400/50 truncate mt-0.5">
                    {song.artist.name || '未知创作者'}
                  </p>
                </Link>

                {/* 统计数据 - 移动端隐藏部分 */}
                <div className="hidden sm:flex flex-col items-end gap-0.5 text-xs text-cyan-400/40">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatPlayCount(song.playCount)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {formatPlayCount(song.likeCount)}
                  </div>
                </div>

                {/* 播放按钮 - 触摸友好 */}
                <button
                  onClick={() => handlePlay(song)}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 flex items-center justify-center transition-all active:scale-90"
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 空状态 */}
      {!loading && songs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-cyan-400/50">
          <Trophy className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-sm">暂无数据</p>
          <p className="text-xs mt-2 opacity-60">成为第一个上传歌曲的创作者吧！</p>
        </div>
      )}
    </div>
  )
}
