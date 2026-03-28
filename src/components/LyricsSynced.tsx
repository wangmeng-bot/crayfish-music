import { useRef, useEffect, useMemo, useState } from 'react'
import { LyricLine, parseLRC, getCurrentLyricIndex } from '../lib/lyrics'
import { Play, Music } from 'lucide-react'

interface LyricsSyncedProps {
  lyrics?: string
  currentTime: number
  duration: number
  isPlaying: boolean
  className?: string
  showTranslation?: boolean
  onSeek?: (time: number) => void
}

export function LyricsSynced({
  lyrics,
  currentTime,
  duration,
  isPlaying,
  className = '',
  showTranslation = true,
  onSeek
}: LyricsSyncedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)
  const [isAutoScroll, setIsAutoScroll] = useState(true)

  // 解析歌词
  const parsedLyrics = useMemo(() => {
    if (!lyrics) return []
    try {
      return parseLRC(lyrics).lyrics
    } catch {
      return []
    }
  }, [lyrics])

  // 获取当前高亮的行索引
  const currentIndex = useMemo(() => {
    return getCurrentLyricIndex(parsedLyrics, currentTime)
  }, [parsedLyrics, currentTime])

  // 自动滚动到当前行
  useEffect(() => {
    if (isAutoScroll && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [currentIndex, isAutoScroll])

  // 手动滚动时停止自动滚动
  const handleScroll = () => {
    setIsAutoScroll(false)
  }

  // 点击某一行跳转到对应时间
  const handleLineClick = (time: number) => {
    if (onSeek) {
      onSeek(time)
    }
    setIsAutoScroll(true)
  }

  // 拖动滚动条时重新启用自动滚动
  const handleWheel = () => {
    setIsAutoScroll(false)
    setTimeout(() => setIsAutoScroll(true), 3000)
  }

  // 如果没有歌词，显示占位符
  if (parsedLyrics.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <Music className="w-16 h-16 text-cyan-500/30 mb-4" />
        <p className="text-cyan-500/40 text-sm">暂无歌词</p>
        <p className="text-cyan-500/30 text-xs mt-2">播放歌曲时歌词将同步显示</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto scrollbar-hide relative ${className}`}
      onScroll={handleScroll}
      onWheel={handleWheel}
    >
      {/* 顶部渐变遮罩 */}
      <div className="sticky top-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />

      {/* 自动滚动按钮 */}
      {!isAutoScroll && (
        <button
          onClick={() => setIsAutoScroll(true)}
          className="fixed top-20 right-4 z-20 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 
                     border border-cyan-500/30 rounded-full text-xs text-cyan-400 
                     flex items-center gap-1.5 transition-all"
        >
          <Play className="w-3 h-3" />
          跟随播放
        </button>
      )}

      {/* 歌词列表 */}
      <div className="space-y-6 pb-32">
        {parsedLyrics.map((line, index) => {
          const isActive = index === currentIndex
          const isPast = index < currentIndex

          return (
            <div
              key={`${line.time}-${index}`}
              ref={isActive ? activeLineRef : null}
              onClick={() => handleLineClick(line.time)}
              className={`
                cursor-pointer transition-all duration-300 text-center
                ${isActive ? 'scale-110' : 'scale-100'}
                ${!isPast && !isActive ? 'opacity-40' : 'opacity-100'}
              `}
            >
              {/* 歌词主文本 */}
              <p
                className={`
                  text-lg leading-relaxed transition-all duration-200
                  ${isActive
                    ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                    : isPast
                      ? 'text-cyan-400/50'
                      : 'text-cyan-300/70'
                  }
                `}
              >
                {line.text || '♪'}
              </p>

              {/* 翻译（如果有且启用） */}
              {showTranslation && line.translation && (
                <p
                  className={`
                    text-sm mt-1 transition-all duration-200
                    ${isActive ? 'text-cyan-400/80' : 'text-cyan-500/40'}
                  `}
                >
                  {line.translation}
                </p>
              )}

              {/* 当前行指示器 */}
              {isActive && isPlaying && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="w-1 h-3 bg-cyan-400/60 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-5 bg-cyan-400 rounded-full animate-pulse delay-150" />
                  <span className="w-1 h-3 bg-cyan-400/60 rounded-full animate-pulse delay-225" />
                  <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse delay-300" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 底部渐变遮罩 */}
      <div className="sticky bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  )
}
