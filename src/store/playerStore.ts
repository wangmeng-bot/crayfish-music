import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Song, PlayMode } from '../types'
import { mockSongs } from '../data/mockData'
import { useLyricsStore } from './lyricsStore'

// 播放历史项
interface HistoryItem extends Song {
  playedAt: string
  lrcUrl?: string | null
  plainLyrics?: string | null
}

interface PlayerState {
  // 当前播放
  currentSong: Song | null
  queue: Song[]
  queueIndex: number

  // 播放状态
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playMode: PlayMode

  // 全屏播放
  isFullscreen: boolean

  // 播放历史
  playHistory: HistoryItem[]

  // 操作
  playSong: (song: Song, queue?: Song[], index?: number) => void
  playSongWithLyrics: (song: Song, queue: Song[], index: number, lrcUrl?: string | null, plainLyrics?: string | null) => void
  addToHistory: (song: Song) => void
  removeFromHistory: (songId: string) => void
  clearHistory: () => void
  togglePlay: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  nextSong: () => void
  prevSong: () => void
  setPlayMode: (mode: PlayMode) => void
  toggleFullscreen: () => void
  addToQueue: (song: Song) => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      queueIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      isMuted: false,
      playMode: 'order',
      isFullscreen: false,
      playHistory: [],

      playSong: (song, queue = mockSongs, index = 0) => {
        // 添加到播放历史
        const historyItem: HistoryItem = {
          ...song,
          playedAt: new Date().toISOString(),
        }
        
        set((state) => {
          // 移除相同歌曲的旧记录
          const filteredHistory = state.playHistory.filter(h => h.id !== song.id)
          // 在开头插入新记录
          const newHistory = [historyItem, ...filteredHistory].slice(0, 100) // 最多保留100条
          
          return {
            currentSong: song,
            queue,
            queueIndex: index,
            isPlaying: true,
            currentTime: 0,
            playHistory: newHistory,
          }
        })

        // 自动加载歌词
        const lyricsStore = useLyricsStore.getState()
        lyricsStore.loadLyricsForSong(song.id)
      },

      // 带歌词的播放（从 Supabase 数据）
      playSongWithLyrics: (song, queue, index, lrcUrl, plainLyrics) => {
        // 添加到播放历史
        const historyItem: HistoryItem = {
          ...song,
          playedAt: new Date().toISOString(),
          lrcUrl,
          plainLyrics,
        }
        
        set((state) => {
          // 移除相同歌曲的旧记录
          const filteredHistory = state.playHistory.filter(h => h.id !== song.id)
          // 在开头插入新记录
          const newHistory = [historyItem, ...filteredHistory].slice(0, 100)
          
          return {
            currentSong: song,
            queue,
            queueIndex: index,
            isPlaying: true,
            currentTime: 0,
            playHistory: newHistory,
          }
        })

        // 加载歌词
        const lyricsStore = useLyricsStore.getState()
        lyricsStore.loadLyricsForSong(song.id, lrcUrl, plainLyrics)
      },

      addToHistory: (song) => {
        const historyItem: HistoryItem = {
          ...song,
          playedAt: new Date().toISOString(),
        }
        
        set((state) => {
          const filteredHistory = state.playHistory.filter(h => h.id !== song.id)
          const newHistory = [historyItem, ...filteredHistory].slice(0, 100)
          return { playHistory: newHistory }
        })
      },

      removeFromHistory: (songId) => {
        set((state) => ({
          playHistory: state.playHistory.filter(h => h.id !== songId)
        }))
      },

      clearHistory: () => {
        set({ playHistory: [] })
      },

      togglePlay: () => {
        set((state) => ({ isPlaying: !state.isPlaying }))
      },

      setCurrentTime: (time) => {
        set({ currentTime: time })
      },

      setDuration: (duration) => {
        set({ duration })
      },

      setVolume: (volume) => {
        set({ volume, isMuted: volume === 0 })
      },

      toggleMute: () => {
        set((state) => ({ isMuted: !state.isMuted }))
      },

      nextSong: () => {
        const { queue, queueIndex, playMode, playHistory } = get()
        if (queue.length === 0) return

        let nextIndex: number

        if (playMode === 'shuffle') {
          nextIndex = Math.floor(Math.random() * queue.length)
        } else if (playMode === 'repeat') {
          nextIndex = (queueIndex + 1) % queue.length
        } else {
          nextIndex = queueIndex + 1
          if (nextIndex >= queue.length) {
            nextIndex = 0
          }
        }

        const nextSong = queue[nextIndex]
        // 从历史记录中获取歌词信息
        const historySong = playHistory.find(h => h.id === nextSong.id)
        const historyItem: HistoryItem = {
          ...nextSong,
          playedAt: new Date().toISOString(),
          lrcUrl: historySong?.lrcUrl,
          plainLyrics: historySong?.plainLyrics,
        }

        set((state) => {
          const filteredHistory = state.playHistory.filter(h => h.id !== nextSong.id)
          const newHistory = [historyItem, ...filteredHistory].slice(0, 100)
          return {
            queueIndex: nextIndex,
            currentSong: nextSong,
            currentTime: 0,
            isPlaying: true,
            playHistory: newHistory,
          }
        })

        // 自动加载歌词
        const lyricsStore = useLyricsStore.getState()
        lyricsStore.loadLyricsForSong(nextSong.id, historyItem.lrcUrl, historyItem.plainLyrics)
      },

      prevSong: () => {
        const { queue, queueIndex, currentTime, playHistory } = get()
        if (queue.length === 0) return

        if (currentTime > 3) {
          set({ currentTime: 0 })
          return
        }

        const prevIndex = queueIndex - 1 < 0 ? queue.length - 1 : queueIndex - 1
        const prevSong = queue[prevIndex]
        // 从历史记录中获取歌词信息
        const historySong = playHistory.find(h => h.id === prevSong.id)
        const historyItem: HistoryItem = {
          ...prevSong,
          playedAt: new Date().toISOString(),
          lrcUrl: historySong?.lrcUrl,
          plainLyrics: historySong?.plainLyrics,
        }

        set((state) => {
          const filteredHistory = state.playHistory.filter(h => h.id !== prevSong.id)
          const newHistory = [historyItem, ...filteredHistory].slice(0, 100)
          return {
            queueIndex: prevIndex,
            currentSong: prevSong,
            currentTime: 0,
            isPlaying: true,
            playHistory: newHistory,
          }
        })

        // 自动加载歌词
        const lyricsStore = useLyricsStore.getState()
        lyricsStore.loadLyricsForSong(prevSong.id, historyItem.lrcUrl, historyItem.plainLyrics)
      },

      setPlayMode: (mode) => {
        set({ playMode: mode })
      },

      toggleFullscreen: () => {
        set((state) => ({ isFullscreen: !state.isFullscreen }))
      },

      addToQueue: (song) => {
        set((state) => ({ queue: [...state.queue, song] }))
      },
    }),
    {
      name: 'xiaolongxia-player',
      partialize: (state) => ({ 
        volume: state.volume, 
        playMode: state.playMode,
        playHistory: state.playHistory,
      }),
    }
  )
)
