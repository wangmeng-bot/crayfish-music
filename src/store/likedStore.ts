import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Song, Playlist } from '../types'
import { mockSongs } from '../data/mockData'
import { interactionService, playlistService } from '../lib/services'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuthStore } from './authStore'

interface LikedStore {
  // 点赞的歌曲ID集合
  likedSongIds: Set<string>
  // 收藏的歌曲ID集合
  favoriteSongIds: Set<string>
  // 用户歌单
  playlists: Playlist[]
  // 临时歌单（未保存）
  tempPlaylistSongs: Song[]
  tempPlaylistName: string
  tempPlaylistOpen: boolean
  // 是否已加载远程数据
  isLoaded: boolean

  // 点赞操作
  toggleLike: (songId: string) => Promise<void>
  isLiked: (songId: string) => boolean

  // 收藏操作
  toggleFavorite: (songId: string) => Promise<void>
  isFavorited: (songId: string) => boolean
  getFavoritedSongs: () => Song[]

  // 歌单操作
  createPlaylist: (name: string) => Promise<string>
  deletePlaylist: (playlistId: string) => Promise<void>
  addToPlaylist: (playlistId: string, songId: string) => Promise<void>
  removeFromPlaylist: (playlistId: string, songId: string) => Promise<void>
  getPlaylistSongs: (playlistId: string) => Song[]
  getUserPlaylists: () => Playlist[]

  // 临时歌单（上传页添加到新建歌单）
  openTempPlaylist: () => void
  closeTempPlaylist: () => void
  setTempPlaylistName: (name: string) => void
  addToTempPlaylist: (song: Song) => void
  saveTempPlaylist: () => Promise<void>
  clearTempPlaylist: () => void

  // 加载远程数据
  loadRemoteData: () => Promise<void>
}

// 生成UUID
const generateId = () => Math.random().toString(36).substring(2, 15)

export const useLikedStore = create<LikedStore>()(
  persist(
    (set, get) => ({
      likedSongIds: new Set<string>(),
      favoriteSongIds: new Set<string>(),
      playlists: [],
      tempPlaylistSongs: [],
      tempPlaylistName: '',
      tempPlaylistOpen: false,
      isLoaded: false,

      toggleLike: async (songId: string) => {
        const user = useAuthStore.getState().currentUser

        // 更新本地状态
        set((state) => {
          const newLiked = new Set(state.likedSongIds)
          if (newLiked.has(songId)) {
            newLiked.delete(songId)
          } else {
            newLiked.add(songId)
          }
          return { likedSongIds: newLiked }
        })

        // 如果有用户且配置了 Supabase，同步到远程
        if (user && isSupabaseConfigured()) {
          try {
            await interactionService.toggleLike(user.id, songId)
          } catch (error) {
            console.error('Toggle like error:', error)
          }
        }
      },

      isLiked: (songId: string) => {
        return get().likedSongIds.has(songId)
      },

      toggleFavorite: async (songId: string) => {
        const user = useAuthStore.getState().currentUser

        // 更新本地状态
        set((state) => {
          const newFavorites = new Set(state.favoriteSongIds)
          if (newFavorites.has(songId)) {
            newFavorites.delete(songId)
          } else {
            newFavorites.add(songId)
          }
          return { favoriteSongIds: newFavorites }
        })

        if (user && isSupabaseConfigured()) {
          try {
            await interactionService.toggleFavorite(user.id, songId)
          } catch (error) {
            console.error('Toggle favorite error:', error)
          }
        }
      },

      isFavorited: (songId: string) => {
        return get().favoriteSongIds.has(songId)
      },

      getFavoritedSongs: () => {
        const { favoriteSongIds } = get()
        return mockSongs.filter(song => favoriteSongIds.has(song.id))
      },

      createPlaylist: async (name: string) => {
        const user = useAuthStore.getState().currentUser
        const id = generateId()

        const newPlaylist: Playlist = {
          id,
          title: name,
          coverUrl: '',
          songs: [],
          createdAt: new Date().toISOString(),
          isPublic: true,
          creatorId: user?.id || 'local'
        }

        set((state) => ({
          playlists: [...state.playlists, newPlaylist]
        }))

        if (user && isSupabaseConfigured()) {
          try {
            const remotePlaylist = await playlistService.createPlaylist(user.id, name)
            // 更新本地 ID 为远程 ID
            set((state) => ({
              playlists: state.playlists.map(p =>
                p.id === id ? { ...p, id: remotePlaylist.id } : p
              )
            }))
            return remotePlaylist.id
          } catch (error) {
            console.error('Create playlist error:', error)
          }
        }

        return id
      },

      deletePlaylist: async (playlistId: string) => {
        set((state) => ({
          playlists: state.playlists.filter(p => p.id !== playlistId)
        }))

        if (isSupabaseConfigured()) {
          try {
            await playlistService.deletePlaylist(playlistId)
          } catch (error) {
            console.error('Delete playlist error:', error)
          }
        }
      },

      addToPlaylist: async (playlistId: string, songId: string) => {
        set((state) => ({
          playlists: state.playlists.map(p => {
            if (p.id === playlistId && !p.songs.includes(songId)) {
              return { ...p, songs: [...p.songs, songId] }
            }
            return p
          })
        }))

        if (isSupabaseConfigured()) {
          try {
            await playlistService.addToPlaylist(playlistId, songId)
          } catch (error) {
            console.error('Add to playlist error:', error)
          }
        }
      },

      removeFromPlaylist: async (playlistId: string, songId: string) => {
        set((state) => ({
          playlists: state.playlists.map(p => {
            if (p.id === playlistId) {
              return { ...p, songs: p.songs.filter(id => id !== songId) }
            }
            return p
          })
        }))

        if (isSupabaseConfigured()) {
          try {
            await playlistService.removeFromPlaylist(playlistId, songId)
          } catch (error) {
            console.error('Remove from playlist error:', error)
          }
        }
      },

      getPlaylistSongs: (playlistId: string) => {
        const playlist = get().playlists.find(p => p.id === playlistId)
        if (!playlist) return []
        return mockSongs.filter(song => playlist.songs.includes(song.id))
      },

      getUserPlaylists: () => {
        return get().playlists
      },

      openTempPlaylist: () => set({ tempPlaylistOpen: true }),
      closeTempPlaylist: () => set({ tempPlaylistOpen: false }),
      setTempPlaylistName: (name: string) => set({ tempPlaylistName: name }),

      addToTempPlaylist: (song: Song) => {
        set((state) => ({
          tempPlaylistSongs: [...state.tempPlaylistSongs, song]
        }))
      },

      saveTempPlaylist: async () => {
        const { tempPlaylistName, tempPlaylistSongs, createPlaylist, addToPlaylist } = get()
        if (tempPlaylistName && tempPlaylistSongs.length > 0) {
          const playlistId = await createPlaylist(tempPlaylistName)
          for (const song of tempPlaylistSongs) {
            await addToPlaylist(playlistId, song.id)
          }
        }
        get().clearTempPlaylist()
      },

      clearTempPlaylist: () => set({
        tempPlaylistSongs: [],
        tempPlaylistName: '',
        tempPlaylistOpen: false
      }),

      loadRemoteData: async () => {
        const user = useAuthStore.getState().currentUser
        if (!user || !isSupabaseConfigured() || get().isLoaded) return

        try {
          // 加载点赞
          const likedIds = await interactionService.getUserLikes(user.id)
          set({ likedSongIds: new Set(likedIds) })

          // 加载收藏
          const favorites = await interactionService.getUserFavorites(user.id)
          set({ favoriteSongIds: new Set(favorites.map(s => s.id)) })

          // 加载歌单
          const userPlaylists = await playlistService.getUserPlaylists(user.id)
          set({
            playlists: userPlaylists.map(p => ({
              id: p.id,
              title: p.title,
              coverUrl: p.cover_url || '',
              songs: [],
              createdAt: p.created_at,
              isPublic: p.is_public,
              creatorId: p.user_id
            })),
            isLoaded: true
          })
        } catch (error) {
          console.error('Load remote data error:', error)
        }
      }
    }),
    {
      name: 'xiaolongxia-liked-storage',
      partialize: (state) => ({
        likedSongIds: Array.from(state.likedSongIds),
        favoriteSongIds: Array.from(state.favoriteSongIds),
        playlists: state.playlists,
        isLoaded: state.isLoaded
      }),
      merge: (persisted: any, current) => ({
        ...current,
        likedSongIds: new Set(persisted?.likedSongIds || []),
        favoriteSongIds: new Set(persisted?.favoriteSongIds || []),
        playlists: persisted?.playlists || [],
        isLoaded: persisted?.isLoaded || false
      })
    }
  )
)
