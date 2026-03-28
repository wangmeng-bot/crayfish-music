import { Heart, Play, MoreHorizontal, Bookmark, BookmarkCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { useLikedStore } from '../store/likedStore'
import { useState } from 'react'
import { Song } from '../types'
import { formatCount, formatDuration, getAiToolClass, cn } from '../lib/utils'

interface SongCardProps {
  song: Song
  queue?: Song[]
  index?: number
  className?: string
  variant?: 'default' | 'compact' | 'horizontal'
  showFavorite?: boolean
}

export default function SongCard({ song, queue, index = 0, className, variant = 'default', showFavorite = true }: SongCardProps) {
  const navigate = useNavigate()
  const { playSong, currentSong, isPlaying } = usePlayerStore()
  const { toggleLike, toggleFavorite, isLiked, isFavorited } = useLikedStore()
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)

  const isCurrentSong = currentSong?.id === song.id
  const liked = isLiked(song.id)
  const favorited = isFavorited(song.id)

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCurrentSong) {
      navigate(`/song/${song.id}`)
    } else {
      playSong(song, queue || [song], index)
    }
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleLike(song.id)
    setIsLikeAnimating(true)
    setTimeout(() => setIsLikeAnimating(false), 300)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(song.id)
  }

  if (variant === 'horizontal') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-transparent hover:border-border hover:bg-bg-hover transition-all cursor-pointer group',
          isCurrentSong && 'border-accent-purple/30 bg-accent-purple/5',
          className
        )}
        onClick={() => navigate(`/song/${song.id}`)}
      >
        <img src={song.coverUrl} alt={song.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className={cn('text-sm font-medium truncate', isCurrentSong ? 'text-accent-purple' : 'text-text-primary group-hover:text-accent-purple')}>
            {song.title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('text-xs px-1.5 py-0.5 rounded flex-shrink-0', getAiToolClass(song.aiTool))}>{song.aiTool}</span>
            <span className="text-xs text-text-muted truncate">{song.creator.username}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-text-muted font-mono">{formatDuration(song.duration)}</span>
          {showFavorite && (
            <button onClick={handleFavorite} className="opacity-0 group-hover:opacity-100 transition-opacity">
              {favorited ? (
                <BookmarkCheck className="w-4 h-4 text-accent-cyan" />
              ) : (
                <Bookmark className="w-4 h-4 text-text-muted hover:text-accent-cyan" />
              )}
            </button>
          )}
          <button onClick={handlePlay} className="w-8 h-8 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-accent-purple hover:text-white">
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn('rounded-xl overflow-hidden bg-bg-card border border-transparent hover:border-border transition-all cursor-pointer group', isCurrentSong && 'border-accent-purple/30', className)}
        onClick={() => navigate(`/song/${song.id}`)}
      >
        <div className="relative aspect-square">
          <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button onClick={handlePlay} className="w-12 h-12 rounded-full bg-accent-purple text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              {isCurrentSong && isPlaying ? <Play className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
          </div>
          {showFavorite && (
            <button
              onClick={handleFavorite}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {favorited ? <BookmarkCheck className="w-4 h-4 text-accent-cyan" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>
        <div className="p-3">
          <h4 className={cn('text-sm font-medium truncate', isCurrentSong ? 'text-accent-purple' : 'text-text-primary')} title={song.title}>
            {song.title}
          </h4>
          <div className="flex items-center justify-between mt-1">
            <span className={cn('text-xs px-1.5 py-0.5 rounded', getAiToolClass(song.aiTool))}>{song.aiTool}</span>
            <span className="text-xs text-text-muted">{formatDuration(song.duration)}</span>
          </div>
        </div>
      </div>
    )
  }

  // Default card
  return (
    <div
      className={cn('rounded-2xl overflow-hidden bg-bg-card border border-transparent hover:border-border card-glow transition-all cursor-pointer group', isCurrentSong && 'border-accent-purple/30', className)}
      onClick={() => navigate(`/song/${song.id}`)}
    >
      <div className="relative aspect-square">
        <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={handleLike}
              className={cn(
                'w-9 h-9 rounded-full bg-black/50 flex items-center justify-center transition-all hover:bg-accent-pink',
                liked && 'bg-accent-pink text-white'
              )}
            >
              <Heart className={cn('w-4 h-4', liked && 'fill-current', isLikeAnimating && 'animate-ping')} />
            </button>
            <button onClick={handlePlay} className="w-12 h-12 rounded-full bg-accent-purple text-white flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all hover:scale-110">
              {isCurrentSong && isPlaying ? <Play className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            {showFavorite && (
              <button
                onClick={handleFavorite}
                className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-accent-cyan transition-colors"
              >
                {favorited ? <BookmarkCheck className="w-4 h-4 text-accent-cyan" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
        {/* Always show play on hover for non-current songs */}
        <button
          onClick={handlePlay}
          className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-accent-purple text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        >
          {isCurrentSong && isPlaying ? <Play className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className={cn('font-semibold text-text-primary truncate group-hover:text-accent-purple transition-colors', isCurrentSong && 'text-accent-purple')} title={song.title}>
            {song.title}
          </h3>
          <p className="text-sm text-text-secondary truncate mt-0.5" title={song.creator.username}>
            {song.creator.username}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className={cn('text-xs px-2 py-1 rounded-full', getAiToolClass(song.aiTool))}>
            {song.aiTool}
          </span>
          {song.styleTags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-bg-secondary text-text-muted">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <span>▶</span> {formatCount(song.playCount)}
          </span>
          <button
            onClick={handleLike}
            className={cn('flex items-center gap-1 hover:text-accent-pink transition-colors', liked && 'text-accent-pink')}
          >
            <Heart className={cn('w-3 h-3', liked && 'fill-current')} /> {formatCount(song.likeCount + (liked ? 1 : 0))}
          </button>
          <span>{formatDuration(song.duration)}</span>
        </div>
      </div>
    </div>
  )
}
