import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link to="/settings" className="p-2 -ml-2 hover:bg-bg-card rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-lg font-semibold text-text-primary">隐私政策</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="bg-bg-card rounded-xl border border-border p-4 space-y-4">
          <p className="text-xs text-text-muted text-center">最后更新日期：2026年3月1日</p>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-2">1. 信息收集</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              AITune 不会收集您的个人信息。您注册时提供的邮箱地址和用户名仅用于账号管理和社区互动功能。
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-2">2. 本地存储</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              我们使用浏览器的本地存储（LocalStorage）来保存您的偏好设置、播放历史等数据。这些数据仅存储在您的设备上。
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-2">3. 第三方服务</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              AITune 使用 Supabase 作为后端服务提供商。您的账号信息和发布内容存储在 Supabase 的服务器上。
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-2">4. Cookie 使用</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              我们使用必要的 Cookie 来维持您的登录状态和记住您的偏好设置。
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-2">5. 数据安全</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              我们采用行业标准的安全措施来保护您的数据。所有数据传输使用 HTTPS 加密。
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-text-primary mb-2">6. 联系我们</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              如对本隐私政策有任何疑问，请联系：contact@aitune.vip
            </p>
          </section>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-text-muted text-center">© 2026 AITune. 保留所有权利。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
