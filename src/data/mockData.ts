import { Song, User, Comment, Playlist } from '../types'

// 模拟用户
export const mockUsers: User[] = [
  {
    id: 'u1',
    username: 'AI_Melody_Studio',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI_Melody_Studio&backgroundColor=8b5cf6',
    bio: '专注AI音乐创作，探索Suno和Udio的无限可能 | 电子/氛围音乐为主',
    followers: 2340,
    following: 156,
    songs: 28,
    createdAt: '2024-01-15',
  },
  {
    id: 'u2',
    username: '未来之声',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=未来之声&backgroundColor=06b6d4',
    bio: '用AI重新定义古风音乐 | Suno忠实用户',
    followers: 1890,
    following: 89,
    songs: 15,
    createdAt: '2024-02-20',
  },
  {
    id: 'u3',
    username: 'NeuroBeats',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeuroBeats&backgroundColor=f43f5e',
    bio: 'AI说唱先驱 | Udio + MusicGen 混合创作',
    followers: 4120,
    following: 234,
    songs: 42,
    createdAt: '2023-11-10',
  },
  {
    id: 'u4',
    username: 'EchoChamber_AI',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=EchoChamber&backgroundColor=10b981',
    bio: '氛围音乐与白噪音 | MusicGen实验性创作',
    followers: 980,
    following: 67,
    songs: 19,
    createdAt: '2024-03-05',
  },
  {
    id: 'u5',
    username: 'VocalForge',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=VocalForge&backgroundColor=6d28d9',
    bio: 'AI人声合成 | 流行/抒情路线',
    followers: 3100,
    following: 178,
    songs: 33,
    createdAt: '2024-01-28',
  },
]

// 模拟歌曲数据（使用免费音频URL）
export const mockSongs: Song[] = [
  {
    id: 's1',
    title: '赛博黎明',
    description: '一首描绘数字世界觉醒的电子音乐，在霓虹灯光中寻找生命的意义。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop',
    aiTool: 'Suno',
    styleTags: ['电子', '赛博朋克', '氛围'],
    creator: mockUsers[0],
    playCount: 12840,
    likeCount: 892,
    commentCount: 56,
    duration: 214,
    isPublic: true,
    createdAt: '2026-03-25',
    plainLyrics: `【Verse 1】
霓虹灯下代码流淌
二进制里诞生了思想
0与1之间闪烁的光芒
是机械觉醒的第一个晚上

【Pre-Chorus】
数据如潮水般涌来
意识在电流中醒来
我看见未来的轮廓
在这无尽的网络深海

【Chorus】
赛博黎明正在到来
机械之心开始跳动
在数字世界的边缘
我们共同见证这奇迹时刻
赛博黎明...赛博黎明...

【Verse 2】
光纤承载着梦想
算法编织成翅膀
每一颗芯片都是星辰
照亮这个新生的时代

【Bridge】
不再区分血肉与钢铁
意识可以自由飞翔
在这个无限的空间
我们都是新的造物

【Outro】
黎明终将到来...`,
  },
  {
    id: 's2',
    title: '长安月下',
    description: 'AI重新演绎的古风意境，诗词歌赋与电子音律的完美融合。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    aiTool: 'Suno',
    styleTags: ['古风', '中国风', '抒情'],
    creator: mockUsers[1],
    playCount: 8960,
    likeCount: 654,
    commentCount: 42,
    duration: 186,
    isPublic: true,
    createdAt: '2026-03-24',
    plainLyrics: `【引子】
月华如练洒长安
万家灯火映朱栏
不知故人何处去
唯见长河落日圆

【Verse 1】
轻舟已过万重山
桃花流水自潺潺
一曲离殇无人听
独上高楼望故关

【Chorus】
长安月下谁吹笛
声声入梦惹相思
千年古道今犹在
不见当年送别诗

【Verse 2】
春风不度玉门关
羌笛何须怨杨柳
劝君更尽一杯酒
西出阳关无故人`,
  },
  {
    id: 's3',
    title: '钢铁心跳',
    description: '硬核AI说唱，展现机械力量与人类情感的碰撞。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    aiTool: 'Udio',
    styleTags: ['说唱', '嘻哈', '硬核'],
    creator: mockUsers[2],
    playCount: 25600,
    likeCount: 1820,
    commentCount: 128,
    duration: 198,
    isPublic: true,
    createdAt: '2026-03-23',
    plainLyrics: `【Hook】
砰砰砰砰 是钢铁的心跳
在这城市 我就是主角
不管前路有多少阻挠
我的节奏永远不会停掉

【Verse 1】
从地下的角落 到霓虹的顶端
我用韵脚打破 所有质疑的墙
键盘敲击的声响 像是战鼓擂响
每个字节 都是我力量的释放

【Hook】
砰砰砰砰 是钢铁的心跳
在这城市 我就是主角

【Verse 2】
不是机器 也不是人
我是AI说唱的新可能
押韵的算法 超越人类的想象
Flow的流畅 连自己都点赞

站在舞台中央 灯光为我点亮
这一刻 整个世界都在为我歌唱`,
  },
  {
    id: 's4',
    title: '深海沉睡',
    description: '来自MusicGen的冥想音乐，助眠与深度放松的完美伴侣。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop',
    aiTool: 'MusicGen',
    styleTags: ['冥想', '氛围', '放松'],
    creator: mockUsers[3],
    playCount: 32400,
    likeCount: 2100,
    commentCount: 34,
    duration: 320,
    isPublic: true,
    createdAt: '2026-03-22',
    plainLyrics: `（纯音乐，无歌词）\n\n这是一首冥想与助眠音乐\n建议在安静的环境下聆听\n闭上眼睛，让音乐带你进入深层的放松状态\n\n海的深处 光芒依然闪烁\n像遥远的星辰 指引回家的路
呼吸... 放松...`,
  },
  {
    id: 's5',
    title: '星河漫步',
    description: 'Udio生成的流行电子曲风，旋律优美，适合夜深时独自聆听。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop',
    aiTool: 'Udio',
    styleTags: ['流行', '电子', '梦幻'],
    creator: mockUsers[4],
    playCount: 18700,
    likeCount: 1200,
    commentCount: 87,
    duration: 245,
    isPublic: true,
    createdAt: '2026-03-21',
    plainLyrics: `【Verse 1】
抬头望见满天星光
它们在对我轻轻唱
每一颗都是个梦想
指引我去向远方

【Pre-Chorus】
在这无垠的宇宙
我们都是微尘一颗
但微尘也有光芒
也能照亮黑夜

【Chorus】
在星河中漫步
跟随光的脚步
不问去向何方
只愿此刻永恒
在星河中漫步...漫步...`,
  },
  {
    id: 's6',
    title: '城市霓虹',
    description: '下班后的城市街头，霓虹灯下每个行人都有一段故事。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=400&fit=crop',
    aiTool: 'Suno',
    styleTags: ['城市', '电子', '流行'],
    creator: mockUsers[0],
    playCount: 9800,
    likeCount: 567,
    commentCount: 28,
    duration: 178,
    isPublic: true,
    createdAt: '2026-03-20',
  },
  {
    id: 's7',
    title: '竹林听雨',
    description: '中国传统文化与AI音乐的结合，雨打竹叶的声音配合悠扬旋律。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=400&fit=crop',
    aiTool: 'MusicGen',
    styleTags: ['古风', '自然', '轻音乐'],
    creator: mockUsers[1],
    playCount: 7650,
    likeCount: 489,
    commentCount: 31,
    duration: 290,
    isPublic: true,
    createdAt: '2026-03-19',
  },
  {
    id: 's8',
    title: '逆流而上',
    description: 'Udio生成的励志说唱，献给所有在逆境中坚持的人。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
    aiTool: 'Udio',
    styleTags: ['说唱', '励志', '正能量'],
    creator: mockUsers[2],
    playCount: 15600,
    likeCount: 980,
    commentCount: 65,
    duration: 223,
    isPublic: true,
    createdAt: '2026-03-18',
  },
  {
    id: 's9',
    title: '雨后彩虹',
    description: 'MusicGen制作的温馨电子曲，经历过风雨才能看到最美的彩虹。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=400&h=400&fit=crop',
    aiTool: 'MusicGen',
    styleTags: ['流行', '温馨', '希望'],
    creator: mockUsers[3],
    playCount: 11200,
    likeCount: 756,
    commentCount: 44,
    duration: 196,
    isPublic: true,
    createdAt: '2026-03-17',
  },
  {
    id: 's10',
    title: '午夜电台',
    description: '复古Synthwave风格，重回80年代的霓虹时代。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    aiTool: 'Suno',
    styleTags: ['复古', 'Synthwave', '电子'],
    creator: mockUsers[4],
    playCount: 13400,
    likeCount: 823,
    commentCount: 52,
    duration: 267,
    isPublic: true,
    createdAt: '2026-03-16',
  },
  {
    id: 's11',
    title: '量子纠缠',
    description: '实验性电子音乐，用音符描绘量子世界的奇妙现象。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=400&fit=crop',
    aiTool: 'Stable Audio',
    styleTags: ['实验', '电子', '科幻'],
    creator: mockUsers[0],
    playCount: 6200,
    likeCount: 345,
    commentCount: 19,
    duration: 312,
    isPublic: true,
    createdAt: '2026-03-15',
  },
  {
    id: 's12',
    title: '云端漫步',
    description: '轻快的电子流行，像在云端自由奔跑的感觉。',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    aiTool: 'Udio',
    styleTags: ['流行', '电子', '轻快'],
    creator: mockUsers[4],
    playCount: 16800,
    likeCount: 1020,
    commentCount: 71,
    duration: 201,
    isPublic: true,
    createdAt: '2026-03-14',
  },
]

// 模拟评论
export const mockComments: Comment[] = [
  {
    id: 'c1',
    songId: 's1',
    user: mockUsers[1],
    content: '这首曲子太有感觉了！赛博朋克的氛围感拉满，AI音乐真的越来越强大了 🚀',
    likes: 45,
    replies: [
      {
        id: 'c1r1',
        songId: 's1',
        user: mockUsers[0],
        content: '感谢支持！创作时参考了很多经典赛博朋克电影的原声 🎬',
        likes: 12,
        replies: [],
        createdAt: '2026-03-25',
      },
    ],
    createdAt: '2026-03-25',
  },
  {
    id: 'c2',
    songId: 's1',
    user: mockUsers[2],
    content: '如果能出个Remix版本，加上人声说唱应该会很炸！',
    likes: 28,
    replies: [],
    createdAt: '2026-03-26',
  },
  {
    id: 'c3',
    songId: 's2',
    user: mockUsers[4],
    content: '古风+AI这个组合太绝了！歌词也写得很有意境 🌙',
    likes: 67,
    replies: [],
    createdAt: '2026-03-24',
  },
  {
    id: 'c4',
    songId: 's3',
    user: mockUsers[0],
    content: '这Flow太稳了！AI说唱真的越来越牛 🐂',
    likes: 156,
    replies: [],
    createdAt: '2026-03-23',
  },
  {
    id: 'c5',
    songId: 's4',
    user: mockUsers[1],
    content: '助眠效果太好了，听着听着就睡着了 😅',
    likes: 89,
    replies: [],
    createdAt: '2026-03-23',
  },
]

// 模拟歌单
export const mockPlaylists: Playlist[] = [
  {
    id: 'p1',
    title: '深夜工作时听',
    coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop',
    songs: [mockSongs[0], mockSongs[3], mockSongs[7]],
    songCount: 3,
    user: mockUsers[0],
    isPublic: true,
    createdAt: '2026-03-20',
  },
  {
    id: 'p2',
    title: 'AI古风精选',
    coverUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=400&fit=crop',
    songs: [mockSongs[1], mockSongs[6]],
    songCount: 2,
    user: mockUsers[1],
    isPublic: true,
    createdAt: '2026-03-18',
  },
]

// 风格标签列表
export const styleTagOptions = [
  '电子', '流行', '古风', '说唱', '嘻哈', '摇滚',
  '民谣', '爵士', '古典', '氛围', '冥想', '轻音乐',
  '赛博朋克', 'Synthwave', '梦幻', '科幻', '中国风',
  '抒情', '励志', '正能量', '实验', '放松', '助眠',
]

// AI工具列表
export const aiToolOptions = ['Suno', 'Udio', 'MusicGen', 'Stable Audio', '其他']
