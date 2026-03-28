import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import SongCard from '../components/SongCard'
import { mockSongs, mockUsers } from '../data/mockData'
import { formatCount } from '../lib/utils'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const results = useMemo(() => {
    if (!query.trim()) return { songs: [], users: [] }
    const q = query.toLowerCase()
    const songs = mockSongs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.aiTool.toLowerCase().includes(q) ||
      s.creator.username.toLowerCase().includes(q) ||
      s.styleTags.some(tag => tag.toLowerCase().includes(q))
    )
    const users = mockUsers.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q)
    )
    return { songs, users }
  }, [query])

  if (!query.trim()) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="text-center">
          <Search className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">开始搜索</h2>
          <p className="text-text-muted">输入关键词，搜索歌曲、创作者或 AI 工具</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          搜索结果：<span className="gradient-text">"{query}"</span>
        </h1>
        <p className="text-sm text-text-muted mb-8">
          找到 {results.songs.length} 首歌曲，{results.users.length} 位创作者
        </p>

        {results.songs.length === 0 && results.users.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">没有找到相关内容</h3>
            <p className="text-text-muted">试试其他关键词</p>
          </div>
        ) : (
          <div className="space-y-10">
            {results.users.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4">创作者</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.users.map(user => (
                    <Link
                      key={user.id}
                      to={`/creator/${user.id}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-bg-card border border-border hover:border-accent-purple/30 transition-all group"
                    >
                      <img src={user.avatar} alt={user.username} className="w-14 h-14 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary group-hover:text-accent-purple transition-colors truncate">{user.username}</h3>
                        <p className="text-xs text-text-muted truncate mt-0.5">{user.bio}</p>
                        <div className="flex gap-3 text-xs text-text-muted mt-1">
                          <span>{formatCount(user.followers)} 粉丝</span>
                          <span>{user.songs} 首歌曲</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.songs.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4">歌曲</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {results.songs.map((song, i) => (
                    <SongCard key={song.id} song={song} queue={results.songs} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
