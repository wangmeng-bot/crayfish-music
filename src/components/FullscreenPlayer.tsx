import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, ListMusic, Heart, Share2, Bookmark, BookmarkCheck,
  Music, Languages
} from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { useLikedStore } from '../store/likedStore'
import { useLyricsStore } from '../store/lyricsStore'
import { formatDuration, getAiToolClass, cn } from '../lib/utils'
import { Slider } from './ui/Slider'
import { LyricsSynced } from './LyricsSynced'

interface FullscreenPlayerProps {
  onClose: () => void
}

export default function FullscreenPlayer({ onClose }: FullscreenPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [showLyrics, setShowLyrics] = useState(false)
  const [likeAnimating, setLikeAnimating] = useState(false)

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playMode,
    togglePlay,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    nextSong,
    prevSong,
    setPlayMode,
  } = usePlayerStore()

  const { toggleLike, toggleFavorite, isLiked, isFavorited } = useLikedStore()
  const { currentLyrics, translationEnabled, toggleTranslation } = useLyricsStore()

  const liked = currentSong ? isLiked(currentSong.id) : false
  const favorited = currentSong ? isFavorited(currentSong.id) : false

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    audio.src = currentSong.audioUrl
    audio.volume = isMuted ? 0 : volume
    if (isPlaying) {
      audio.play().catch(() => setCurrentTime(0))
    }
  }, [currentSong, isPlaying])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
  }
  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration)
  }
  const handleEnded = () => nextSong()

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value
      setCurrentTime(value)
    }
  }

  const cyclePlayMode = () => {
    const modes: ('order' | 'repeat' | 'shuffle')[] = ['order', 'repeat', 'shuffle']
    const currentIndex = modes.indexOf(playMode)
    setPlayMode(modes[(currentIndex + 1) % modes.length])
  }

  const getPlayModeIcon = () => {
    if (playMode === 'repeat') return <Repeat className="w-5 h-5" />
    if (playMode === 'shuffle') return <Shuffle className="w-5 h-5" />
    return <ListMusic className="w-5 h-5" />
  }

  const getPlayModeLabel = () => {
    if (playMode === 'repeat') return '单曲循环'
    if (playMode === 'shuffle') return '随机播放'
    return '列表循环'
  }

  const handleLike = () => {
    if (!currentSong) return
    toggleLike(currentSong.id)
    setLikeAnimating(true)
    setTimeout(() => setLikeAnimating(false), 300)
  }

  const handleShare = async () => {
    if (!currentSong) return
    const shareData = {
      title: currentSong.title,
      text: `来听这首由 ${currentSong.aiTool} 生成的歌曲：${currentSong.title}`,
      url: window.location.origin + `/song/${currentSong.id}`
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (e) {
        // 用户取消分享
      }
    } else {
      navigator.clipboard.writeText(shareData.url)
      alert('链接已复制到剪贴板')
    }
  }

  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="fixed inset-0 z-[100] bg-bg-primary flex flex-col"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={onClose}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-sm text-text-muted">正在播放</span>
        <button
          onClick={handleShare}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content - 根据显示模式切换 */}
      <div className="flex-1 flex flex-col items-center px-8 max-w-2xl mx-auto w-full">
        {showLyrics ? (
          // 歌词模式
          <div className="flex-1 w-full flex flex-col items-center">
            {/* 歌词切换按钮 */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setShowLyrics(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors"
              >
                <Music className="w-4 h-4" />
                歌曲
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-accent-cyan/20 text-accent-cyan">
                <Languages className="w-4 h-4" />
                歌词
              </button>
            </div>

            {/* 歌词内容 */}
            <div className="flex-1 w-full overflow-hidden">
              <LyricsSynced
                lyrics={currentLyrics || undefined}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                showTranslation={translationEnabled}
                onSeek={handleSeek}
              />
            </div>

            {/* 翻译切换 */}
            <button
              onClick={toggleTranslation}
              className={cn(
                'mt-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all',
                translationEnabled
                  ? 'bg-accent-cyan/20 text-accent-cyan'
                  : 'bg-bg-secondary text-text-muted hover:text-text-secondary'
              )}
            >
              <Languages className="w-4 h-4" />
              {translationEnabled ? '翻译：开' : '翻译：关'}
            </button>
          </div>
        ) : (
          // 封面模式
          <>
            {/* Cover */}
            <div className="relative group">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className={cn(
                  'w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-2xl transition-all',
                  isPlaying && 'animate-spin-slow'
                )}
                style={{ boxShadow: '0 20px 60px rgba(139,92,246,0.3)' }}
              />
              <div className="absolute inset-0 rounded-2xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* 歌词切换按钮浮在封面上 */}
              <button
                onClick={() => setShowLyrics(true)}
                className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm
                           flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                title="查看歌词"
              >
                <Languages className="w-5 h-5" />
              </button>
            </div>

            {/* Song Info */}
            <div className="text-center space-y-2 mt-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">{currentSong.title}</h2>
              <div className="flex items-center justify-center gap-3">
                <span className={cn('text-sm px-2 py-1 rounded', getAiToolClass(currentSong.aiTool))}>
                  {currentSong.aiTool}
                </span>
                <Link
                  to={`/creator/${currentSong.creator.id}`}
                  className="text-text-secondary hover:text-accent-cyan transition-colors"
                >
                  {currentSong.creator.username}
                </Link>
              </div>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {currentSong.styleTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-bg-secondary text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Progress */}
      <div className="w-full px-8 py-4 max-w-2xl mx-auto space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={([v]) => handleSeek(v)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-text-muted font-mono">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pb-6">
        <button
          onClick={cyclePlayMode}
          className={cn(
            'p-2 rounded-full transition-colors',
            playMode !== 'order' ? 'text-accent-purple' : 'text-text-muted hover:text-text-primary'
          )}
          title={getPlayModeLabel()}
        >
          {getPlayModeIcon()}
        </button>
        <button
          onClick={prevSong}
          className="p-3 text-text-secondary hover:text-text-primary transition-colors"
        >
          <SkipBack className="w-7 h-7" />
        </button>
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-accent-purple hover:bg-accent-purple/80 text-white
                     flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-accent-purple/30"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
        <button
          onClick={nextSong}
          className="p-3 text-text-secondary hover:text-text-primary transition-colors"
        >
          <SkipForward className="w-7 h-7" />
        </button>
        <button
          onClick={handleLike}
          className={cn(
            'p-2 rounded-full transition-all',
            liked ? 'text-accent-pink' : 'text-text-muted hover:text-accent-pink',
            likeAnimating && 'scale-125'
          )}
          title={liked ? '取消点赞' : '点赞'}
        >
          <Heart className={cn('w-5 h-5', liked && 'fill-current', likeAnimating && 'animate-ping')} />
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center justify-center gap-4 pb-8">
        <button
          onClick={() => currentSong && toggleFavorite(currentSong.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm',
            favorited
              ? 'bg-accent-cyan/20 text-accent-cyan'
              : 'bg-bg-card text-text-secondary hover:bg-bg-hover hover:text-accent-cyan'
          )}
          title={favorited ? '取消收藏' : '收藏到歌单'}
        >
          {favorited ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {favorited ? '已收藏' : '收藏'}
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto pb-8">
        <button
          onClick={toggleMute}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.01}
          onValueChange={([v]) => setVolume(v)}
          className="flex-1"
        />
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
    </div>
  )
}
