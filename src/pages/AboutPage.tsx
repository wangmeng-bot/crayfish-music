import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link to="/settings" className="p-2 -ml-2 hover:bg-bg-card rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-lg font-semibold text-text-primary">关于我们</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Logo & Name */}
        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center mb-4">
            <span className="text-3xl">🎵</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">AITune</h2>
          <p className="text-sm text-text-secondary mt-1">AI 驱动的音乐创作平台</p>
          <p className="text-xs text-text-muted mt-2">版本 1.0.0</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          <div className="bg-bg-card rounded-xl border border-border p-4">
            <h3 className="text-sm font-medium text-text-primary mb-2">关于 AITune</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              AITune 是一个由 AI 驱动的音乐创作和分享平台。我们致力于为音乐创作者和爱好者提供一个便捷、创意的音乐交流空间。
            </p>
          </div>

          <div className="bg-bg-card rounded-xl border border-border p-4">
            <h3 className="text-sm font-medium text-text-primary mb-3">核心功能</h3>
            <ul className="space-y-2">
              {[
                '🎼 AI 音乐创作与生成',
                '📤 歌曲上传与分享',
                '💬 社区互动评论',
                '🏆 排行榜竞争',
                '📱 跨平台支持',
              ].map((feature, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-center gap-2">
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-bg-card rounded-xl border border-border p-4">
            <h3 className="text-sm font-medium text-text-primary mb-3">联系我们</h3>
            <p className="text-sm text-text-secondary">📧 邮箱：contact@aitune.vip</p>
            <p className="text-sm text-text-secondary">🌐 网站：https://www.aitune.vip</p>
          </div>

          <div className="bg-bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xs text-text-muted">© 2026 AITune. 保留所有权利。</p>
            <p className="text-xs text-text-muted mt-1">用 ❤️ 和 AI 技术打造</p>
          </div>
        </div>
      </div>
    </div>
  )
}
