import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, Share2, Play, Pause, ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { useLikedStore } from '../store/likedStore'
import { mockSongs } from '../data/mockData'
import { formatCount, formatDuration, getAiToolClass, cn } from '../lib/utils'
import SongCard from '../components/SongCard'
import CommentSection from '../components/CommentSection'

export default function SongDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore()
  const { toggleLike, toggleFavorite, isLiked, isFavorited } = useLikedStore()
  const [showShareTip, setShowShareTip] = useState(false)

  const song = mockSongs.find(s => s.id === id)
  if (!song) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">404</div>
          <p className="text-text-muted mb-4">歌曲不存在</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-accent-purple text-white rounded-full">返回首页</button>
        </div>
      </div>
    )
  }

  const isCurrentSong = currentSong?.id === song.id
  const liked = isLiked(song.id)
  const favorited = isFavorited(song.id)
  const relatedSongs = mockSongs.filter(s => s.id !== song.id && (s.aiTool === song.aiTool || s.styleTags.some(tag => song.styleTags.includes(tag)))).slice(0, 4)

  const handlePlay = () => {
    if (isCurrentSong) togglePlay()
    else playSong(song, mockSongs, mockSongs.indexOf(song))
  }

  const handleLike = () => {
    toggleLike(song.id)
  }

  const handleFavorite = () => {
    toggleFavorite(song.id)
  }

  const handleShare = async () => {
    const shareData = {
      title: song.title,
      text: `来听这首由 ${song.aiTool} 生成的歌曲：${song.title}`,
      url: window.location.origin + `/song/${song.id}`
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (e) {
        // 用户取消分享
      }
    } else {
      navigator.clipboard.writeText(shareData.url)
      setShowShareTip(true)
      setTimeout(() => setShowShareTip(false), 2000)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Player Card */}
            <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className={cn(
                        'w-48 h-48 rounded-xl object-cover',
                        isCurrentSong && isPlaying && 'animate-pulse-slow'
                      )}
                    />
                    <button
                      onClick={handlePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity rounded-xl"
                    >
                      <div className="w-16 h-16 rounded-full bg-accent-purple text-white flex items-center justify-center shadow-lg">
                        {isCurrentSong && isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                      </div>
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-text-primary mb-2">{song.title}</h1>
                    <div
                      className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/creator/${song.creator.id}`)}
                    >
                      <img src={song.creator.avatar} alt={song.creator.username} className="w-8 h-8 rounded-full" />
                      <span className="text-text-secondary">{song.creator.username}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={cn('text-sm px-3 py-1 rounded-full font-medium', getAiToolClass(song.aiTool))}>{song.aiTool}</span>
                      {song.styleTags.map(tag => (
                        <span key={tag} className="text-sm px-3 py-1 rounded-full bg-bg-secondary text-text-muted">{tag}</span>
                      ))}
                    </div>
                    <p className="text-sm text-text-muted mb-4">{song.description}</p>
                    <div className="flex items-center gap-6 text-sm text-text-muted">
                      <span>▶ {formatCount(song.playCount)}</span>
                      <span className={liked ? 'text-accent-pink' : ''}>❤️ {formatCount(song.likeCount + (liked ? 1 : 0))}</span>
                      <span>🕐 {formatDuration(song.duration)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                      <button
                        onClick={handlePlay}
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-full font-medium transition-all hover:scale-105"
                      >
                        {isCurrentSong && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {isCurrentSong && isPlaying ? '暂停' : '播放'}
                      </button>
                      <button
                        onClick={handleLike}
                        className={cn(
                          'flex items-center gap-1 px-4 py-2 rounded-full border transition-all',
                          liked ? 'bg-accent-pink/20 border-accent-pink text-accent-pink' : 'border-border text-text-secondary hover:text-accent-pink hover:border-accent-pink'
                        )}
                      >
                        <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
                        {liked ? formatCount(song.likeCount + 1) : formatCount(song.likeCount)}
                      </button>
                      <button
                        onClick={handleFavorite}
                        className={cn(
                          'flex items-center gap-1 px-4 py-2 rounded-full border transition-all',
                          favorited ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan' : 'border-border text-text-secondary hover:text-accent-cyan hover:border-accent-cyan'
                        )}
                      >
                        {favorited ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        {favorited ? '已收藏' : '收藏'}
                      </button>
                      <button
                        onClick={handleShare}
                        className="relative flex items-center gap-1 px-4 py-2 rounded-full border border-border text-text-secondary hover:text-accent-cyan transition-all"
                      >
                        <Share2 className="w-4 h-4" /> 分享
                        {showShareTip && (
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-bg-card border border-border rounded text-xs whitespace-nowrap">
                            链接已复制！
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lyrics */}
            {song.plainLyrics && (
              <div className="bg-bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">歌词</h3>
                <pre className="whitespace-pre-wrap text-text-secondary leading-relaxed font-sans text-sm">{song.plainLyrics}</pre>
              </div>
            )}

            {/* Comments */}
            <div className="bg-bg-card rounded-2xl border border-border p-6">
              <CommentSection songId={song.id} />
            </div>
          </div>

          {/* Right: Related */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-4">相关推荐</h3>
              <div className="space-y-3">
                {relatedSongs.map(s => (
                  <SongCard key={s.id} song={s} variant="horizontal" />
                ))}
              </div>
            </div>
            <div className="bg-bg-card rounded-2xl border border-border p-5">
              <h3 className="text-sm font-semibold text-text-muted mb-4">创作者</h3>
              <div
                className="flex items-center gap-3 mb-4 cursor-pointer"
                onClick={() => navigate(`/creator/${song.creator.id}`)}
              >
                <img src={song.creator.avatar} alt={song.creator.username} className="w-14 h-14 rounded-full" />
                <div>
                  <h4 className="font-semibold text-text-primary">{song.creator.username}</h4>
                  <div className="flex gap-3 text-xs text-text-muted mt-1">
                    <span>{formatCount(song.creator.followers)} 粉丝</span>
                    <span>{song.creator.songs} 作品</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-2 border border-accent-purple text-accent-purple rounded-full text-sm font-medium hover:bg-accent-purple hover:text-white transition-all">
                关注
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
