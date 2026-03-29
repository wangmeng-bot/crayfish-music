import { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronUp, Mail, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: '如何注册 AITune 账号？',
    answer: '点击首页的"登录"按钮，进入登录页面后点击"立即注册"，填写邮箱、用户名和密码即可完成注册。',
  },
  {
    question: '如何上传自己的歌曲？',
    answer: '登录后，点击底部导航栏的"上传"按钮（圆形+图标），选择要上传的音频文件，填写歌曲信息后即可发布。',
  },
  {
    question: '如何删除已发布的歌曲？',
    answer: '进入个人主页，点击歌曲右下角的"..."按钮，选择"删除"即可删除已发布的歌曲。删除后无法恢复。',
  },
  {
    question: '如何修改个人资料？',
    answer: '进入"设置"页面，点击"编辑个人资料"，可以修改头像、用户名和个人简介。',
  },
  {
    question: '如何联系客服？',
    answer: '您可以通过邮箱 contact@aitune.vip 联系我们，我们会在24小时内回复您。',
  },
  {
    question: '上传的歌曲有格式要求吗？',
    answer: '目前支持 MP3、WAV、OGG 等常见音频格式。文件大小建议不超过 50MB。',
  },
  {
    question: '如何参与排行榜竞争？',
    answer: '排行榜根据歌曲的播放量、点赞数和评论数自动计算。您发布歌曲后自动参与排名。',
  },
]

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const handleSubmitFeedback = () => {
    if (feedbackText.trim()) {
      setFeedbackSubmitted(true)
      setFeedbackText('')
      setTimeout(() => setFeedbackSubmitted(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link to="/settings" className="p-2 -ml-2 hover:bg-bg-card rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-lg font-semibold text-text-primary">帮助与反馈</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* FAQ Section */}
        <div>
          <h2 className="text-base font-medium text-text-primary mb-3">常见问题</h2>
          <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
            {faqData.map((item, index) => (
              <div key={index} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-bg-secondary/50 transition-colors"
                >
                  <span className="text-sm text-text-primary pr-2">{item.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-4 pb-3">
                    <p className="text-sm text-text-secondary leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div>
          <h2 className="text-base font-medium text-text-primary mb-3">意见反馈</h2>
          <div className="bg-bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3 mb-3">
              <MessageCircle className="w-5 h-5 text-accent-purple flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-text-primary font-medium">提交反馈</p>
                <p className="text-xs text-text-muted mt-0.5">告诉我们您的建议或遇到的问题</p>
              </div>
            </div>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="请输入您的反馈内容..."
              className="w-full h-24 bg-bg-secondary rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-purple/50"
            />
            <button
              onClick={handleSubmitFeedback}
              disabled={!feedbackText.trim()}
              className={`mt-3 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                feedbackText.trim()
                  ? 'bg-accent-purple text-white hover:bg-accent-purple/90'
                  : 'bg-bg-secondary text-text-muted cursor-not-allowed'
              }`}
            >
              {feedbackSubmitted ? '✓ 反馈已提交' : '提交反馈'}
            </button>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-medium text-text-primary mb-3">其他联系方式</h3>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Mail className="w-4 h-4" />
            <span>contact@aitune.vip</span>
          </div>
        </div>
      </div>
    </div>
  )
}
