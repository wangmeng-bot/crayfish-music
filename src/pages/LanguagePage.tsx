import { ArrowLeft, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useThemeStore } from '../store/themeStore'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
]

export default function LanguagePage() {
  const { language, setLanguage } = useThemeStore()
  const [currentLang, setCurrentLang] = useState(language || 'zh-CN')

  const handleSelect = (code: string) => {
    setCurrentLang(code)
    setLanguage(code as 'zh-CN' | 'en-US')
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link to="/settings" className="p-2 -ml-2 hover:bg-bg-card rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-lg font-semibold text-text-primary">语言设置</h1>
        </div>
      </header>

      <div className="p-4">
        <p className="text-sm text-text-secondary mb-4">选择您偏好的语言，设置将立即生效。</p>

        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          {languages.map((lang) => (
            <div key={lang.code} className="border-b border-border last:border-b-0">
              <button
                onClick={() => handleSelect(lang.code)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="text-sm text-text-primary">{lang.nativeName}</p>
                    <p className="text-xs text-text-muted">{lang.name}</p>
                  </div>
                </div>
                {currentLang === lang.code && (
                  <Check className="w-5 h-5 text-accent-purple" />
                )}
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-text-muted mt-4 text-center">语言切换功能正在开发中，敬请期待。</p>
      </div>
    </div>
  )
}
