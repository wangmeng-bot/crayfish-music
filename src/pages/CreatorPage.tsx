import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Music, Users, Calendar, UserPlus, UserCheck } from 'lucide-react'
import { mockUsers, mockSongs } from '../data/mockData'
import { formatCount, formatDate, cn } from '../lib/utils'
import SongCard from '../components/SongCard'

export default function CreatorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isFollowing, setIsFollowing] = useState(false)

  const creator = mockUsers.find(u => u.id === id)
  if (!creator) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">404</div>
          <p className="text-text-muted mb-4">创作者不存在</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-accent-purple text-white rounded-full">返回首页</button>
        </div>
      </div>
    )
  }

  const creatorSongs = mockSongs.filter(s => s.creator.id === creator.id)
  const totalPlays = creatorSongs.reduce((acc, s) => acc + s.playCount, 0)
  const totalLikes = creatorSongs.reduce((acc, s) => acc + s.likeCount, 0)

  return (
    <div className="min-h-screen pb-24">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
      </div>

      {/* Profile Header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-accent-purple/30 via-accent-cyan/20 to-accent-purple/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.2)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
              {/* Avatar */}
              <img
                src={creator.avatar}
                alt={creator.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-bg-primary shadow-2xl"
              />

              {/* Info */}
              <div className="flex-1 text-center sm:text-left pb-4">
                <h1 className="text-3xl font-bold text-text-primary mb-1">{creator.username}</h1>
                <p className="text-text-secondary max-w-xl">{creator.bio}</p>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all hover:scale-105',
                  isFollowing
                    ? 'border border-border text-text-secondary hover:text-accent-pink hover:border-accent-pink'
                    : 'bg-accent-purple hover:bg-accent-purple/80 text-white'
                )}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" /> 已关注
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> 关注
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-bg-card border border-border">
          <div className="text-center p-3">
            <div className="flex items-center justify-center gap-2 text-text-muted mb-1">
              <Users className="w-4 h-4" /> 粉丝
            </div>
            <div className="text-2xl font-bold gradient-text">{formatCount(creator.followers + (isFollowing ? 1 : 0))}</div>
          </div>
          <div className="text-center p-3 border-l border-border">
            <div className="flex items-center justify-center gap-2 text-text-muted mb-1">
              <Music className="w-4 h-4" /> 作品
            </div>
            <div className="text-2xl font-bold gradient-text">{creatorSongs.length}</div>
          </div>
          <div className="text-center p-3 border-l border-border">
            <div className="flex items-center justify-center gap-2 text-text-muted mb-1">
              <Heart className="w-4 h-4" /> 获赞
            </div>
            <div className="text-2xl font-bold gradient-text">{formatCount(totalLikes)}</div>
          </div>
          <div className="text-center p-3 border-l border-border">
            <div className="flex items-center justify-center gap-2 text-text-muted mb-1">
              <Calendar className="w-4 h-4" /> 加入于
            </div>
            <div className="text-lg font-semibold text-text-primary">{formatDate(creator.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Songs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">全部作品 ({creatorSongs.length})</h2>
        </div>

        {creatorSongs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {creatorSongs.map((song, i) => (
              <SongCard key={song.id} song={song} queue={creatorSongs} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-bg-card flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">暂无作品</h3>
            <p className="text-text-muted">该创作者还没有上传作品</p>
          </div>
        )}
      </div>
    </div>
  )
}
