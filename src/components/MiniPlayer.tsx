import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, ListMusic, ChevronUp, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { formatDuration, getAiToolClass, cn } from '../lib/utils'
import { Slider } from './ui/Slider'

interface MiniPlayerProps {
  onExpand: () => void
}

export default function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const handleTimeUpdate = () => {
    if (!isDragging && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
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

  // 进度条拖动
  const handleProgressStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    handleProgressMove(e)
  }

  const handleProgressMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!progressRef.current || !duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    handleSeek(percent * duration)
  }

  const handleProgressEnd = () => {
    setIsDragging(false)
  }

  const cyclePlayMode = () => {
    const modes: ('order' | 'repeat' | 'shuffle')[] = ['order', 'repeat', 'shuffle']
    const currentIndex = modes.indexOf(playMode)
    setPlayMode(modes[(currentIndex + 1) % modes.length])
  }

  const getPlayModeIcon = () => {
    if (playMode === 'repeat') return <Repeat className="w-4 h-4" />
    if (playMode === 'shuffle') return <Shuffle className="w-4 h-4" />
    return <ListMusic className="w-4 h-4" />
  }

  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="bg-[#0a0a1a]/95 backdrop-blur-lg border-t border-cyan-500/20 safe-area-pb">
      {/* Progress Bar - 触摸优化 */}
      <div
        ref={progressRef}
        className="h-1.5 bg-cyan-500/10 cursor-pointer group touch-none"
        onMouseDown={handleProgressStart}
        onMouseMove={handleProgressMove}
        onMouseUp={handleProgressEnd}
        onMouseLeave={handleProgressEnd}
        onTouchStart={handleProgressStart}
        onTouchMove={handleProgressMove}
        onTouchEnd={handleProgressEnd}
      >
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all relative"
          style={{ width: `${progress}%` }}
        >
          {/* 进度条上的拖动手柄 */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-active:scale-100" />
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Cover + Info - 点击展开全屏 */}
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
            onClick={onExpand}
          >
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-11 h-11 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0 ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                {currentSong.title}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('text-[10px] md:text-xs px-1.5 py-0.5 rounded', getAiToolClass(currentSong.aiTool))}>
                  {currentSong.aiTool}
                </span>
                <span className="text-xs text-cyan-400/50 truncate hidden sm:block">{currentSong.creator.username}</span>
              </div>
            </div>
          </div>

          {/* Controls - 放大触摸区域 */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevSong}
              className="p-2 md:p-2.5 text-cyan-400/70 hover:text-cyan-400 transition-colors active:scale-90"
            >
              <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white flex items-center justify-center transition-all active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
              )}
            </button>
            <button
              onClick={nextSong}
              className="p-2 md:p-2.5 text-cyan-400/70 hover:text-cyan-400 transition-colors active:scale-90"
            >
              <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Right Side - 时间/音量/展开 */}
          <div className="flex items-center gap-2">
            {/* Time - 桌面端显示 */}
            <span className="text-xs text-cyan-400/50 font-mono hidden lg:block">
              {formatDuration(currentTime)}
            </span>

            {/* Play Mode - 桌面端显示 */}
            <button
              onClick={cyclePlayMode}
              className={cn(
                'hidden lg:flex p-1.5 rounded transition-colors',
                playMode === 'order' ? 'text-cyan-400/50' : 'text-purple-400'
              )}
            >
              {getPlayModeIcon()}
            </button>

            {/* Volume - 桌面端显示 */}
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={toggleMute} className="p-1.5 text-cyan-400/50 hover:text-cyan-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="w-20">
                <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={([v]) => setVolume(v)} />
              </div>
            </div>

            {/* Expand Button - 点击展开全屏播放器 */}
            <button
              onClick={onExpand}
              className="p-2 text-cyan-400/70 hover:text-cyan-400 transition-colors active:scale-90"
            >
              <ChevronUp className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            {/* History Button */}
            <Link
              to="/history"
              className="p-2 text-cyan-400/70 hover:text-cyan-400 transition-colors active:scale-90"
            >
              <History className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          </div>
        </div>
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
