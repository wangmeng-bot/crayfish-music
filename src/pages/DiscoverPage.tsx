import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal } from 'lucide-react'
import SongCard from '../components/SongCard'
import { mockSongs, styleTagOptions, aiToolOptions } from '../data/mockData'
import { cn } from '../lib/utils'

export default function DiscoverPage() {
  const [searchParams] = useSearchParams()
  const [selectedTool, setSelectedTool] = useState<string>(searchParams.get('tool') || '全部')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'random'>('latest')
  const [showFilters, setShowFilters] = useState(false)

  const filteredSongs = useMemo(() => {
    let songs = [...mockSongs]

    if (selectedTool !== '全部') {
      songs = songs.filter(s => s.aiTool === selectedTool)
    }

    if (selectedStyles.length > 0) {
      songs = songs.filter(s => selectedStyles.some(tag => s.styleTags.includes(tag)))
    }

    if (sortBy === 'popular') {
      songs.sort((a, b) => b.playCount - a.playCount)
    } else if (sortBy === 'latest') {
      songs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else {
      songs.sort(() => Math.random() - 0.5)
    }

    return songs
  }, [selectedTool, selectedStyles, sortBy])

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">发现</h1>
          <p className="text-text-secondary">探索 AI 创作的无限可能</p>
        </div>

        {/* Filter Bar */}
        <div className="sticky top-16 z-30 bg-bg-primary/80 backdrop-blur-lg py-4 -mx-4 px-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6 border-b border-border">
          <div className="flex items-center gap-3 flex-wrap">
            {/* AI工具筛选 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['全部', ...aiToolOptions].map(tool => (
                <button
                  key={tool}
                  onClick={() => setSelectedTool(tool)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                    selectedTool === tool
                      ? 'bg-accent-purple text-white'
                      : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border hover:border-accent-purple/30'
                  )}
                >
                  {tool}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              {[
                { key: 'latest', label: '最新' },
                { key: 'popular', label: '最热' },
                { key: 'random', label: '随机' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key as typeof sortBy)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-all',
                    sortBy === s.key
                      ? 'bg-bg-hover text-text-primary border border-border'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Toggle Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all',
                showFilters || selectedStyles.length > 0
                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                  : 'bg-bg-card text-text-secondary border border-border hover:text-text-primary'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              风格
              {selectedStyles.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-accent-cyan text-white text-xs flex items-center justify-center">{selectedStyles.length}</span>
              )}
            </button>
          </div>

          {/* Style Tags Expandable */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {styleTagOptions.map(style => (
                  <button
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm transition-all',
                      selectedStyles.includes(style)
                        ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                        : 'bg-bg-secondary text-text-muted hover:text-text-secondary border border-transparent'
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
              {selectedStyles.length > 0 && (
                <button
                  onClick={() => setSelectedStyles([])}
                  className="mt-3 text-xs text-accent-pink hover:underline"
                >
                  清除全部筛选
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <span className="text-sm text-text-muted">
            共找到 <span className="text-accent-purple font-medium">{filteredSongs.length}</span> 首歌曲
            {selectedTool !== '全部' && ` · ${selectedTool}作品`}
            {selectedStyles.length > 0 && ` · ${selectedStyles.join(', ')}`}
          </span>
        </div>

        {filteredSongs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">没有找到匹配的歌曲</h3>
            <p className="text-text-muted">试试调整筛选条件</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredSongs.map((song, i) => (
              <SongCard
                key={song.id}
                song={song}
                queue={filteredSongs}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
