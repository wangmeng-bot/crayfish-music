import { Link, useNavigate } from 'react-router-dom'
import { Play, Clock, Trash2, ChevronRight, Music2, Heart } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { formatDuration, formatTimeAgo, cn } from '../lib/utils'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { playHistory, setCurrentSong, currentSong, isPlaying, togglePlay, addToHistory, removeFromHistory, clearHistory } = usePlayerStore()

  const handlePlaySong = (song: any, index: number) => {
    setCurrentSong(song, playHistory, index)
  }

  const handleClearHistory = () => {
    if (confirm('确定要清空所有播放历史吗？')) {
      clearHistory()
    }
  }

  // 按日期分组
  const groupedHistory = playHistory.reduce((groups: Record<string, typeof playHistory>, song) => {
    const date = song.playedAt ? new Date(song.playedAt).toLocaleDateString('zh-CN', { 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    }) : '今天'
    
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(song)
    return groups
  }, {})

  if (playHistory.length === 0) {
    return (
      <div className="min-h-screen pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-bg-card transition-colors">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">播放历史</h1>
          </div>

          {/* Empty State */}
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-bg-card flex items-center justify-center mx-auto mb-4">
              <Music2 className="w-10 h-10 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">暂无播放历史</h3>
            <p className="text-text-muted mb-6">开始听歌，记录你的音乐之旅</p>
            <Link 
              to="/discover" 
              className="inline-flex items-center gap-2 px-6 py-2 bg-accent-purple text-white rounded-full text-sm font-medium hover:bg-accent-purple/80 transition-all"
            >
              <Play className="w-4 h-4" />
              去发现
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-bg-card transition-colors">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">播放历史</h1>
          </div>
          <button 
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-accent-pink transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          <button 
            onClick={() => handlePlaySong(playHistory[0], 0)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-full text-sm font-medium whitespace-nowrap hover:bg-accent-purple/80 transition-all"
          >
            <Play className="w-4 h-4" />
            继续播放
          </button>
          <Link 
            to="/discover" 
            className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border rounded-full text-sm text-text-secondary whitespace-nowrap hover:border-accent-purple/50 transition-all"
          >
            <Heart className="w-4 h-4" />
            听歌识曲
          </Link>
        </div>

        {/* History List */}
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([date, songs]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {date}
              </h2>
              <div className="bg-bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
                {songs.map((song, index) => {
                  const globalIndex = playHistory.indexOf(song)
                  const isCurrentSong = currentSong?.id === song.id
                  
                  return (
                    <div 
                      key={`${song.id}-${globalIndex}`}
                      className={cn(
                        'flex items-center gap-3 p-3 hover:bg-bg-hover transition-colors group',
                        isCurrentSong && 'bg-accent-purple/10'
                      )}
                    >
                      {/* Cover */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={song.coverUrl || song.cover} alt={song.title} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => handlePlaySong(song, globalIndex)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Play className="w-5 h-5 text-white" fill="white" />
                        </button>
                        {isCurrentSong && isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="flex gap-0.5">
                              <span className="w-0.5 h-3 bg-accent-purple animate-music-bar-1 rounded-full" />
                              <span className="w-0.5 h-4 bg-accent-purple animate-music-bar-2 rounded-full" />
                              <span className="w-0.5 h-2 bg-accent-purple animate-music-bar-3 rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          'font-medium truncate',
                          isCurrentSong ? 'text-accent-purple' : 'text-text-primary'
                        )}>
                          {song.title}
                        </h4>
                        <p className="text-sm text-text-muted truncate">
                          {typeof song.artist === 'object' ? song.artist.username : song.artist}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="text-sm text-text-muted">
                        {formatDuration(song.duration)}
                      </div>

                      {/* Delete */}
                      <button 
                        onClick={() => removeFromHistory(song.id)}
                        className="p-2 text-text-muted hover:text-accent-pink opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
