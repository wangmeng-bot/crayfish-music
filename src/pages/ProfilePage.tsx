import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Settings, Heart, Music, Users, LogOut, Plus, FolderOpen, Edit3, Trash2, Check, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useLikedStore } from '../store/likedStore'
import { mockSongs } from '../data/mockData'
import { formatCount, formatDate, cn } from '../lib/utils'
import SongCard from '../components/SongCard'

type TabType = 'songs' | 'liked' | 'playlists' | 'following'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { currentUser, isAuthenticated, logout } = useAuthStore()
  const { getFavoritedSongs, playlists, createPlaylist, deletePlaylist, getPlaylistSongs } = useLikedStore()
  const [activeTab, setActiveTab] = useState<TabType>('songs')
  const [isEditing, setIsEditing] = useState(false)
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [editForm, setEditForm] = useState({
    username: currentUser?.username || '',
    bio: currentUser?.bio || '',
  })

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-bg-card flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">请先登录</h2>
          <p className="text-text-muted">登录后查看您的个人主页</p>
          <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-2 bg-accent-purple text-white rounded-full font-medium hover:bg-accent-purple/80 transition-all">
            去登录
          </Link>
        </div>
      </div>
    )
  }

  // 获取真实数据
  const mySongs = mockSongs.filter(s => s.creator.id === currentUser.id)
  const likedSongs = getFavoritedSongs()
  const userPlaylists = playlists
  const following = mockSongs.slice(2, 5).map(s => s.creator)

  const tabs: { key: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'songs', label: '我的作品', icon: <Music className="w-4 h-4" />, count: mySongs.length || 0 },
    { key: 'liked', label: '收藏', icon: <Heart className="w-4 h-4" />, count: likedSongs.length },
    { key: 'playlists', label: '歌单', icon: <FolderOpen className="w-4 h-4" />, count: userPlaylists.length },
    { key: 'following', label: '关注', icon: <Users className="w-4 h-4" />, count: following.length },
  ]

  const handleSaveEdit = () => {
    // 实际项目中这里应该调用 API 保存
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim())
      setNewPlaylistName('')
      setShowCreatePlaylist(false)
    }
  }

  const handleDeletePlaylist = (playlistId: string) => {
    if (confirm('确定要删除这个歌单吗？')) {
      deletePlaylist(playlistId)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-bg-card rounded-2xl border border-border p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-bg-secondary"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">用户名</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:border-accent-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">简介</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:border-accent-purple resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="px-4 py-1.5 bg-accent-purple text-white rounded-lg text-sm">保存</button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 border border-border text-text-secondary rounded-lg text-sm">取消</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-text-primary">{currentUser.username}</h1>
                    <button onClick={() => setIsEditing(true)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-text-secondary mb-4">{currentUser.bio}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-6 text-sm text-text-muted">
                    <span><strong className="text-text-primary">{formatCount(currentUser.followers)}</strong> 粉丝</span>
                    <span><strong className="text-text-primary">{currentUser.following}</strong> 关注</span>
                    <span><strong className="text-text-primary">{currentUser.songs || mySongs.length}</strong> 首作品</span>
                    <span>加入于 {formatDate(currentUser.createdAt)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                to="/upload"
                className="flex items-center gap-2 px-4 py-2 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-full text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" /> 上传歌曲
              </Link>
              <Link to="/settings" className="p-2 border border-border text-text-secondary hover:text-text-primary rounded-full transition-colors">
                <Settings className="w-4 h-4" />
              </Link>
              <button onClick={handleLogout} className="p-2 border border-border text-text-secondary hover:text-accent-pink rounded-full transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all',
                activeTab === tab.key
                  ? 'text-accent-purple border-accent-purple'
                  : 'text-text-muted border-transparent hover:text-text-primary'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full bg-bg-secondary text-xs">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'songs' && (
            <div>
              {mySongs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {mySongs.map((song, i) => (
                    <SongCard key={song.id} song={song} queue={mySongs} index={i} showFavorite={false} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-bg-card flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8 text-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">还没有上传作品</h3>
                  <p className="text-text-muted mb-4">上传你的第一首 AI 创作吧</p>
                  <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-2 bg-accent-purple text-white rounded-full text-sm font-medium hover:bg-accent-purple/80 transition-all">
                    <Plus className="w-4 h-4" /> 上传歌曲
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'liked' && (
            <div>
              {likedSongs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {likedSongs.map((song, i) => (
                    <SongCard key={song.id} song={song} queue={likedSongs} index={i} showFavorite={false} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-bg-card flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">还没有收藏</h3>
                  <p className="text-text-muted mb-4">在歌曲详情页点击收藏按钮添加</p>
                  <Link to="/discover" className="inline-flex items-center gap-2 px-6 py-2 bg-accent-purple text-white rounded-full text-sm font-medium hover:bg-accent-purple/80 transition-all">
                    去发现
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div>
              {/* Create Playlist */}
              {showCreatePlaylist ? (
                <div className="flex items-center gap-3 mb-6 p-4 bg-bg-card rounded-xl border border-border">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="输入歌单名称..."
                    className="flex-1 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:border-accent-purple"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                  />
                  <button onClick={handleCreatePlaylist} className="p-2 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/80">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => { setShowCreatePlaylist(false); setNewPlaylistName('') }} className="p-2 border border-border rounded-lg hover:bg-bg-hover">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreatePlaylist(true)}
                  className="flex items-center gap-2 px-4 py-3 mb-6 border border-dashed border-border rounded-xl text-text-muted hover:text-accent-purple hover:border-accent-purple transition-all"
                >
                  <Plus className="w-4 h-4" /> 创建新歌单
                </button>
              )}

              {userPlaylists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userPlaylists.map(playlist => {
                    const playlistSongs = getPlaylistSongs(playlist.id)
                    return (
                      <div key={playlist.id} className="flex gap-4 p-4 rounded-xl bg-bg-card border border-border hover:border-accent-purple/30 transition-all group relative">
                        <div className="w-20 h-20 rounded-lg bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                          {playlistSongs.length > 0 ? (
                            <img src={playlistSongs[0].coverUrl} alt={playlist.title} className="w-full h-full rounded-lg object-cover" />
                          ) : (
                            <FolderOpen className="w-8 h-8 text-accent-purple" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-text-primary group-hover:text-accent-purple transition-colors truncate">{playlist.title}</h4>
                          <p className="text-sm text-text-muted mt-1">{playlistSongs.length} 首歌曲</p>
                          <p className="text-xs text-text-muted mt-1">{formatDate(playlist.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => handleDeletePlaylist(playlist.id)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-bg-secondary/80 text-text-muted opacity-0 group-hover:opacity-100 hover:text-accent-pink transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-bg-card flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-8 h-8 text-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">还没有歌单</h3>
                  <p className="text-text-muted">创建你的第一个歌单吧</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'following' && (
            <div>
              {following.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {following.map(user => (
                    <Link key={user.id} to={`/creator/${user.id}`} className="flex items-center gap-4 p-4 rounded-xl bg-bg-card border border-border hover:border-accent-purple/30 transition-all group">
                      <img src={user.avatar} alt={user.username} className="w-14 h-14 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text-primary group-hover:text-accent-purple transition-colors truncate">{user.username}</h4>
                        <p className="text-sm text-text-muted truncate">{user.bio}</p>
                        <p className="text-xs text-text-muted mt-1">{formatCount(user.followers)} 粉丝</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-bg-card flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">还没有关注</h3>
                  <p className="text-text-muted mb-4">去发现喜欢的创作者吧</p>
                  <Link to="/discover" className="inline-flex items-center gap-2 px-6 py-2 bg-accent-purple text-white rounded-full text-sm font-medium hover:bg-accent-purple/80 transition-all">
                    去发现
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
