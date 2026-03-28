// 歌词类型定义
export interface LyricLine {
  time: number // 秒
  text: string
  translation?: string // 翻译（可选）
}

// 解析 LRC 格式歌词
export function parseLRC(lrc: string): { lyrics: LyricLine[]; album?: string; artist?: string; title?: string } {
  const lines = lrc.split('\n')
  const lyrics: LyricLine[] = []
  let album: string | undefined
  let artist: string | undefined
  let title: string | undefined

  // 解析时间格式: [mm:ss.xx] 或 [mm:ss:xx]
  const timeRegex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // 元数据行
    if (trimmed.startsWith('[ti:')) {
      title = trimmed.slice(4, -1)
      continue
    }
    if (trimmed.startsWith('[ar:')) {
      artist = trimmed.slice(4, -1)
      continue
    }
    if (trimmed.startsWith('[al:')) {
      album = trimmed.slice(4, -1)
      continue
    }
    if (trimmed.startsWith('[by:')) continue
    if (trimmed.startsWith('[offset:')) continue
    if (trimmed.startsWith('[la:')) continue // 语言标签

    // 解析多行歌词（可能有多个时间戳对应同一行）
    // 例如: [00:01.00][00:02.00]歌词内容
    const matches = trimmed.matchAll(/\[(\d{2}):(\d{2})[.:](\d{2,3})\]/g)
    const times: number[] = []

    let match
    let lastIndex = 0

    while ((match = matches.next()) && !match.done) {
      const [_, min, sec, ms] = match.value
      const time = parseInt(min) * 60 + parseInt(sec) + parseInt(ms) / (ms.length === 3 ? 1000 : 100)
      times.push(time)
      lastIndex = match.value[0].length + match.value.index
    }

    // 提取歌词文本（去掉所有时间标签）
    const text = trimmed.slice(lastIndex).trim()

    // 解析翻译（如果有）
    let translation: string | undefined
    if (text.includes('/')) {
      const parts = text.split('/')
      const mainText = parts[0].trim()
      translation = parts.slice(1).map(t => t.trim()).join('/')
      times.forEach(time => {
        lyrics.push({ time, text: mainText, translation })
      })
    } else {
      times.forEach(time => {
        lyrics.push({ time, text })
      })
    }
  }

  // 按时间排序
  lyrics.sort((a, b) => a.time - b.time)

  return { lyrics, album, artist, title }
}

// 查找当前应该高亮的行
export function getCurrentLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (lyrics.length === 0) return -1

  let index = -1
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= currentTime) {
      index = i
    } else {
      break
    }
  }
  return index
}

// 格式化时间（秒 -> mm:ss）
export function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

// 估算歌词总时长
export function estimateLyricsDuration(lyrics: LyricLine[]): number {
  if (lyrics.length === 0) return 0
  const lastLine = lyrics[lyrics.length - 1]
  return lastLine.time + 30 // 预留30秒
}

// 示例歌词（用于演示）
export const DEMO_LYRICS = `[ti:夜曲]
[ar:周杰伦]
[al:十一月的萧邦]
[00:00.00]
[00:00.00]夜曲 - 周杰伦
[00:04.00]词：方文山  曲：周杰伦
[00:08.00]
[00:16.00]一群嗜血的蚂蚁 被腐肉所吸引
[00:20.00]我面无表情 看孤独的风景
[00:24.00]失去你 爱恨开始分明
[00:28.00]失去你 还有什么事好关心
[00:32.00]
[00:34.00]那鸽子不再象征和平
[00:38.00]我终于被提醒
[00:40.00]广场酒吧 剥削的委屈
[00:44.00]我在哪里
[00:48.00]我亲爱的 你在哪里
[00:52.00]
[00:54.00]冰冷的月光被乌鸦挡住
[01:00.00]而我就埋葬在 你的体温
[01:06.00]
[01:08.00]一群嗜血的蚂蚁 被腐肉所吸引
[01:12.00]我面无表情 看孤独的风景
[01:16.00]失去你 爱恨开始分明
[01:20.00]失去你 还有什么事好关心
[01:24.00]
[01:26.00]我优雅的扮演 消失的神秘
[01:30.00]我愤怒的和平 剥削的委屈
[01:34.00]我在哪里
[01:38.00]我亲爱的 你在哪里
[01:42.00]
[01:44.00]冰冷的月光被乌鸦挡住
[01:50.00]而我就埋葬在 你的体温
[01:56.00]
[01:58.00]而你却不相信
[02:02.00]而你却不相信
[02:06.00]
[02:08.00]而你却不相信
[02:12.00]而你却不相信
[02:16.00]你只相信
[02:20.00]夜曲
[02:24.00]夜曲
[02:28.00]夜曲
[02:32.00]夜曲`
