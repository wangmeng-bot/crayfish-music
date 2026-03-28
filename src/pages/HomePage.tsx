import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, TrendingUp, Clock, ChevronRight, Sparkles, Loader2 } from 'lucide-react'
import SongCard from '../components/SongCard'
import { HorizontalScroll, HorizontalScrollItem } from '../components/HorizontalScroll'
import { mockSongs, mockUsers } from '../data/mockData'
import { formatCount } from '../lib/utils'
import { songService, userService, isSupabaseConfigured } from '../lib/services'
import { transformSong } from '../lib/database.types'
import type { Song, User } from '../types'

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [hotSongs, setHotSongs] = useState<Song[]>([])
  const [latestSongs, setLatestSongs] = useState<Song[]>([])
  const [sunoSongs, setSunoSongs] = useState<Song[]>([])
  const [topCreators, setTopCreators] = useState<User[]>([])
  const [stats, setStats] = useState({
    songsCount: '2,340+',
    creatorsCount: '890+',
    toolsCount: '5种',
    todayPlays: '15,000+'
  })

  // 加载真实数据
  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured()) {
        // 使用 mock 数据
        setHotSongs([...mockSongs].sort((a, b) => b.playCount - a.playCount).slice(0, 6))
        setLatestSongs([...mockSongs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6))
        setSunoSongs(mockSongs.filter(s => s.aiTool === 'Suno').slice(0, 6))
        setTopCreators([...mockUsers].sort((a, b) => b.followers - a.followers).slice(0, 5))
        return
      }

      setLoading(true)
      try {
        // 并行加载数据
        const [popularSongs, latest, suno] = await Promise.all([
          songService.getSongs({ sort: 'popular', limit: 10 }),
          songService.getSongs({ sort: 'latest', limit: 10 }),
          songService.getSongs({ aiTool: 'Suno', limit: 10 }),
        ])

        // 转换数据
        const transformedHot = popularSongs.map(transformSong)
        const transformedLatest = latest.map(transformSong)
        const transformedSuno = suno.map(transformSong)

        setHotSongs(transformedHot)
        setLatestSongs(transformedLatest)
        setSunoSongs(transformedSuno)

        // 更新统计数据
        const totalSongs = popularSongs.reduce((sum, s) => sum + s.play_count, 0)
        setStats({
          songsCount: `${popularSongs.length}+`,
          creatorsCount: `${new Set(popularSongs.map(s => s.creator_id)).size}+`,
          toolsCount: '5种',
          todayPlays: formatCount(totalSongs)
        })
      } catch (error) {
        console.error('加载数据失败:', error)
        // 失败时使用 mock 数据
        setHotSongs([...mockSongs].sort((a, b) => b.playCount - a.playCount).slice(0, 6))
        setLatestSongs([...mockSongs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6))
        setSunoSongs(mockSongs.filter(s => s.aiTool === 'Suno').slice(0, 6))
        setTopCreators([...mockUsers].sort((a, b) => b.followers - a.followers).slice(0, 5))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 如果没有真实数据，使用 mock 数据
  const displayHotSongs = hotSongs.length > 0 ? hotSongs : [...mockSongs].sort((a, b) => b.playCount - a.playCount).slice(0, 6)
  const displayLatestSongs = latestSongs.length > 0 ? latestSongs : [...mockSongs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)
  const displaySunoSongs = sunoSongs.length > 0 ? sunoSongs : mockSongs.filter(s => s.aiTool === 'Suno').slice(0, 6)
  const displayTopCreators = topCreators.length > 0 ? topCreators : [...mockUsers].sort((a, b) => b.followers - a.followers).slice(0, 5)

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto text-center space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs md:text-sm text-purple-400">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            AI 音乐创作正在改变世界
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              发现 AI 创作的
            </span>
            <br />
            <span className="text-white">无限可能</span>
          </h1>
          <p className="text-sm md:text-base text-cyan-400/70 max-w-2xl mx-auto px-4">
            在这里，创作者分享用 Suno、Udio、MusicGen 等工具生成的原创音乐，
            每一首歌都是人类想象力与 AI 技术的结晶。
          </p>
          <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
            <Link
              to="/discover"
              className="px-6 py-2.5 md:px-8 md:py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white rounded-full font-medium transition-all active:scale-95"
            >
              开始探索
            </Link>
            <Link
              to="/upload"
              className="px-6 py-2.5 md:px-8 md:py-3 bg-white/5 hover:bg-white/10 border border-cyan-500/30 text-white rounded-full font-medium transition-all active:scale-95"
            >
              上传作品
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-14">
        {/* Stats Bar - 移动端2列，桌面端4列 */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: '收录歌曲', value: stats.songsCount, emoji: '🎵' },
            { label: '创作者', value: stats.creatorsCount, emoji: '👤' },
            { label: 'AI工具', value: stats.toolsCount, emoji: '🤖' },
            { label: '今日播放', value: stats.todayPlays, emoji: '▶️' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.03] border border-cyan-500/10 text-center active:bg-cyan-500/5 transition-colors"
            >
              <div className="text-xl md:text-2xl mb-1">{stat.emoji}</div>
              <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : stat.value}
              </div>
              <div className="text-xs md:text-sm text-cyan-400/50">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* 热门歌曲 - 横向滚动（移动端）/ 网格（桌面端） */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />
              <h2 className="text-base md:text-xl font-bold text-white">热门歌曲</h2>
            </div>
            <Link
              to="/discover?sort=popular"
              className="flex items-center gap-1 text-xs md:text-sm text-cyan-400/50 hover:text-cyan-400 transition-colors"
            >
              查看更多 <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </div>

          {/* 加载状态 */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* 移动端：横向滚动 */}
              <div className="md:hidden -mx-4 px-4">
                <HorizontalScroll>
                  {displayHotSongs.map((song) => (
                    <HorizontalScrollItem key={song.id} width="w-36">
                      <SongCard
                        song={song}
                        queue={displayHotSongs}
                        index={displayHotSongs.indexOf(song)}
                        variant="compact"
                      />
                    </HorizontalScrollItem>
                  ))}
                </HorizontalScroll>
              </div>

              {/* 桌面端：网格 */}
              <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {displayHotSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    queue={displayHotSongs}
                    index={displayHotSongs.indexOf(song)}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* 最新上传 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
              <h2 className="text-base md:text-xl font-bold text-white">最新上传</h2>
            </div>
            <Link
              to="/discover?sort=latest"
              className="flex items-center gap-1 text-xs md:text-sm text-cyan-400/50 hover:text-cyan-400 transition-colors"
            >
              查看更多 <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </div>

          {/* 移动端：横向滚动 */}
          <div className="md:hidden -mx-4 px-4">
            <HorizontalScroll>
              {displayLatestSongs.map((song) => (
                <HorizontalScrollItem key={song.id} width="w-36">
                  <SongCard
                    song={song}
                    queue={displayLatestSongs}
                    index={displayLatestSongs.indexOf(song)}
                    variant="compact"
                  />
                </HorizontalScrollItem>
              ))}
            </HorizontalScroll>
          </div>

          {/* 桌面端：网格 */}
          <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {displayLatestSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                queue={displayLatestSongs}
                index={displayLatestSongs.indexOf(song)}
              />
            ))}
          </div>
        </section>

        {/* Suno 专区 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-[#6d28d9] flex items-center justify-center text-white text-xs md:text-sm font-bold">S</div>
              <h2 className="text-base md:text-xl font-bold text-white">Suno 专区</h2>
            </div>
            <Link
              to="/discover?tool=Suno"
              className="flex items-center gap-1 text-xs md:text-sm text-cyan-400/50 hover:text-cyan-400 transition-colors"
            >
              查看更多 <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </div>

          {/* 移动端：横向滚动 */}
          <div className="md:hidden -mx-4 px-4">
            <HorizontalScroll>
              {displaySunoSongs.map((song) => (
                <HorizontalScrollItem key={song.id} width="w-36">
                  <SongCard
                    song={song}
                    queue={displaySunoSongs}
                    index={displaySunoSongs.indexOf(song)}
                    variant="compact"
                  />
                </HorizontalScrollItem>
              ))}
            </HorizontalScroll>
          </div>

          {/* 桌面端：网格 */}
          <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {displaySunoSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                queue={displaySunoSongs}
                index={displaySunoSongs.indexOf(song)}
              />
            ))}
          </div>
        </section>

        {/* AI工具横滑区 */}
        <section>
          <h2 className="text-base md:text-xl font-bold text-white mb-4">探索不同的 AI 工具</h2>

          {/* 移动端：横向滚动 */}
          <div className="md:hidden -mx-4 px-4">
            <HorizontalScroll>
              {[
                { name: 'Suno', color: '#6d28d9', desc: '全能音乐创作', count: 890 },
                { name: 'Udio', color: '#0e7490', desc: '高保真音乐生成', count: 456 },
                { name: 'MusicGen', color: '#047857', desc: '文本到音乐', count: 234 },
                { name: 'Stable Audio', color: '#dc2626', desc: '专业级音频', count: 123 },
                { name: '其他工具', color: '#7c3aed', desc: '更多创新工具', count: 89 },
              ].map((tool) => (
                <HorizontalScrollItem key={tool.name} width="w-32">
                  <Link
                    to={`/discover?tool=${tool.name}`}
                    className="block p-4 rounded-xl bg-white/[0.03] border border-cyan-500/10 hover:border-cyan-500/30 transition-all active:scale-95"
                  >
                    <div
                      className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white font-bold mb-2"
                      style={{ backgroundColor: tool.color }}
                    >
                      {tool.name[0]}
                    </div>
                    <h3 className="font-semibold text-white text-sm">{tool.name}</h3>
                    <p className="text-xs text-cyan-400/50 mt-1">{tool.desc}</p>
                    <p className="text-xs text-cyan-400/30 mt-2">{formatCount(tool.count)} 首</p>
                  </Link>
                </HorizontalScrollItem>
              ))}
            </HorizontalScroll>
          </div>

          {/* 桌面端：网格 */}
          <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Suno', color: '#6d28d9', desc: '全能音乐创作', count: 890 },
              { name: 'Udio', color: '#0e7490', desc: '高保真音乐生成', count: 456 },
              { name: 'MusicGen', color: '#047857', desc: '文本到音乐', count: 234 },
              { name: 'Stable Audio', color: '#dc2626', desc: '专业级音频', count: 123 },
              { name: '其他工具', color: '#7c3aed', desc: '更多创新工具', count: 89 },
            ].map((tool) => (
              <Link
                key={tool.name}
                to={`/discover?tool=${tool.name}`}
                className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/[0.03] border border-cyan-500/10 hover:border-cyan-500/30 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold mb-3"
                  style={{ backgroundColor: tool.color }}
                >
                  {tool.name[0]}
                </div>
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{tool.name}</h3>
                <p className="text-xs md:text-sm text-cyan-400/50 mt-1">{tool.desc}</p>
                <p className="text-xs md:text-sm text-cyan-400/30 mt-2">{formatCount(tool.count)} 首歌曲</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Top 创作者 */}
        <section>
          <h2 className="text-base md:text-xl font-bold text-white mb-4">热门创作者</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {displayTopCreators.map((user, i) => (
              <Link
                key={user.id}
                to={`/creator/${user.id}`}
                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/[0.03] border border-cyan-500/10 hover:border-cyan-500/30 transition-all active:scale-[0.98]"
              >
                <span className="text-lg md:text-2xl font-bold text-cyan-400/30 w-6 md:w-8 text-center">
                  {i + 1}
                </span>
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {user.username}
                  </h3>
                  <div className="flex items-center gap-2 md:gap-3 text-xs text-cyan-400/50 mt-0.5">
                    <span>{formatCount(user.followers)} 粉丝</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">{user.songs} 首歌曲</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
