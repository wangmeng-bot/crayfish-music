import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Music2, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, register, isLoading, error, clearError } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    let success: boolean
    if (isLogin) {
      success = await login(form.email, form.password)
    } else {
      success = await register(form.email, form.username, form.password)
    }

    if (success) {
      navigate('/')
    }
  }

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (error) clearError()
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
              <Music2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">AITune</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-1">
              {isLogin ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-sm text-text-muted">
              {isLogin ? '登录以继续探索 AI 音乐世界' : '加入小龙虾音乐创作者社区'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-bg-secondary p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); clearError() }}
              className={cn('flex-1 py-2 text-sm font-medium rounded-md transition-all', isLogin ? 'bg-bg-card text-text-primary shadow' : 'text-text-muted hover:text-text-secondary')}
            >
              登录
            </button>
            <button
              onClick={() => { setIsLogin(false); clearError() }}
              className={cn('flex-1 py-2 text-sm font-medium rounded-md transition-all', !isLogin ? 'bg-bg-card text-text-primary shadow' : 'text-text-muted hover:text-text-secondary')}
            >
              注册
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-purple transition-all"
                  required
                />
              </div>
            </div>

            {/* Username (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">用户名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={updateField('username')}
                    placeholder="选择一个用户名"
                    className="w-full pl-10 pr-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-purple transition-all"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={updateField('password')}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-purple transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  {isLogin ? '登录中...' : '注册中...'}
                </>
              ) : (
                <>
                  {isLogin ? '登录' : '注册'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Hint */}
          <div className="mt-6 p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
            <p className="text-xs text-accent-cyan text-center">
              💡 演示模式：输入任意邮箱和密码即可登录
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-text-muted mt-6">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button
            onClick={() => { setIsLogin(!isLogin); clearError() }}
            className="text-accent-purple hover:underline ml-1"
          >
            {isLogin ? '立即注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  )
}
