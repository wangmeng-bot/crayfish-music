import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_LYRICS, parseLRC } from '../lib/lyrics'
import { songService } from '../lib/services'

interface LyricsStore {
  // 歌词来源
  currentLyrics: string | null
  originalLyrics: string | null // 原始歌词（未翻译）
  translationEnabled: boolean
  isLoading: boolean

  // 操作
  setLyrics: (lyrics: string | null) => void
  toggleTranslation: () => void
  clearLyrics: () => void
  loadLyricsForSong: (songId: string, lrcUrl?: string | null, plainLyrics?: string | null) => Promise<void>
}

export const useLyricsStore = create<LyricsStore>()(
  persist(
    (set) => ({
      currentLyrics: DEMO_LYRICS, // 默认显示示例歌词
      originalLyrics: null,
      translationEnabled: true,
      isLoading: false,

      setLyrics: (lyrics) =>
        set({
          currentLyrics: lyrics,
          originalLyrics: lyrics
        }),

      toggleTranslation: () =>
        set((state) => ({
          translationEnabled: !state.translationEnabled
        })),

      clearLyrics: () =>
        set({
          currentLyrics: null,
          originalLyrics: null
        }),

      // 从歌曲加载歌词
      loadLyricsForSong: async (songId: string, lrcUrl?: string | null, plainLyrics?: string | null) => {
        set({ isLoading: true })

        try {
          // 优先使用 LRC URL
          if (lrcUrl) {
            // 从 URL 加载 LRC 文件
            const response = await fetch(lrcUrl)
            if (response.ok) {
              const lrcText = await response.text()
              set({
                currentLyrics: lrcText,
                originalLyrics: lrcText,
                isLoading: false
              })
              return
            }
          }

          // 如果没有 LRC，尝试从 Supabase 获取纯文本歌词
          if (isSupabaseConfigured()) {
            const song = await songService.getSong(songId)
            if (song?.plain_lyrics) {
              // 如果是纯文本，直接设置
              set({
                currentLyrics: song.plain_lyrics,
                originalLyrics: song.plain_lyrics,
                isLoading: false
              })
              return
            }
            if (song?.lrc_url) {
              // 如果有 LRC URL，从 URL 加载
              try {
                const response = await fetch(song.lrc_url)
                if (response.ok) {
                  const lrcText = await response.text()
                  set({
                    currentLyrics: lrcText,
                    originalLyrics: lrcText,
                    isLoading: false
                  })
                  return
                }
              } catch (e) {
                console.error('加载歌词失败:', e)
              }
            }
          }

          // 如果传入的 plainLyrics，直接设置
          if (plainLyrics) {
            set({
              currentLyrics: plainLyrics,
              originalLyrics: plainLyrics,
              isLoading: false
            })
            return
          }

          // 没有歌词，使用示例歌词或空
          set({
            currentLyrics: DEMO_LYRICS,
            originalLyrics: DEMO_LYRICS,
            isLoading: false
          })
        } catch (error) {
          console.error('加载歌词失败:', error)
          set({
            currentLyrics: DEMO_LYRICS,
            originalLyrics: DEMO_LYRICS,
            isLoading: false
          })
        }
      }
    }),
    {
      name: 'xiaolongxia-lyrics'
    }
  )
)

// 辅助函数：获取翻译后的歌词（如果歌词支持翻译）
export function getTranslatedLyrics(lyrics: string | null, showTranslation: boolean): string | null {
  if (!lyrics || !showTranslation) return lyrics
  
  try {
    // 解析歌词（暂不处理翻译）
    return lyrics
  } catch {
    return lyrics
  }
}
