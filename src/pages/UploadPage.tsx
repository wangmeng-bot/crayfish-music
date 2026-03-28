import { useState, useRef } from 'react'
import { Upload, Music, Image, FileText, X, Check, AlertCircle, Loader2, CloudUpload, Database, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { styleTagOptions, aiToolOptions } from '../data/mockData'
import { cn } from '../lib/utils'

// 上传阶段
type UploadStage = 'idle' | 'validating' | 'uploading' | 'processing' | 'publishing' | 'complete'

const uploadStages = [
  { key: 'validating', label: '验证文件', icon: AlertCircle },
  { key: 'uploading', label: '上传中', icon: CloudUpload },
  { key: 'processing', label: '处理中', icon: Database },
  { key: 'publishing', label: '发布中', icon: Share2 },
]

export default function UploadPage() {
  const navigate = useNavigate()
  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const lrcInputRef = useRef<HTMLInputElement>(null)

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [lrcFile, setLrcFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    title: '',
    description: '',
    aiTool: 'Suno',
    styleTags: [] as string[],
    plainLyrics: '',
    isPublic: true,
  })

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i))) {
      if (file.size > 30 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, audio: '文件大小不能超过 30MB' }))
        return
      }
      setAudioFile(file)
      setErrors(prev => { const { audio, ...rest } = prev; return rest })
    } else {
      setErrors(prev => ({ ...prev, audio: '请上传音频文件（MP3、WAV、OGG等）' }))
    }
  }

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file)
    } else {
      setErrors(prev => ({ ...prev, cover: '请上传图片文件' }))
    }
  }

  // LRC文件拖放处理（暂未使用）
  const _handleLrcDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'text/plain' || file.name.endsWith('.lrc'))) {
      setLrcFile(file)
    }
  }

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      styleTags: prev.styleTags.includes(tag)
        ? prev.styleTags.filter(t => t !== tag)
        : [...prev.styleTags, tag]
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!audioFile) newErrors.audio = '请上传音频文件'
    if (!form.title.trim()) newErrors.title = '请输入歌曲标题'
    if (form.styleTags.length === 0) newErrors.style = '请至少选择一个风格标签'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsUploading(true)
    
    // 阶段1: 验证文件
    setUploadStage('validating')
    setUploadProgress(10)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 阶段2: 上传中
    setUploadStage('uploading')
    for (let i = 10; i <= 50; i += 5) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // 阶段3: 处理中
    setUploadStage('processing')
    for (let i = 50; i <= 80; i += 5) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // 阶段4: 发布中
    setUploadStage('publishing')
    for (let i = 80; i <= 95; i += 3) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    setUploadProgress(100)
    setUploadStage('complete')
    setIsUploading(false)
    setUploadSuccess(true)
    
    // 3秒后跳转到首页
    setTimeout(() => navigate('/'), 3000)
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-accent-green" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">上传成功！</h2>
          <p className="text-text-secondary">你的歌曲已发布，正在跳转...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">上传歌曲</h1>
        <p className="text-text-secondary mb-8">分享你的 AI 创作，让更多人听到</p>

        <div className="space-y-8">
          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              音频文件 <span className="text-accent-pink">*</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleAudioDrop}
              onClick={() => audioInputRef.current?.click()}
              className={cn(
                'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
                dragOver ? 'border-accent-purple bg-accent-purple/5' : 'border-border hover:border-accent-purple/50 hover:bg-bg-card',
                errors.audio && 'border-accent-pink bg-accent-pink/5'
              )}
            >
              <input ref={audioInputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a" className="hidden" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
              {audioFile ? (
                <div className="flex items-center justify-center gap-3">
                  <Music className="w-8 h-8 text-accent-purple" />
                  <div className="text-left">
                    <p className="text-text-primary font-medium">{audioFile.name}</p>
                    <p className="text-xs text-text-muted">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setAudioFile(null) }} className="ml-2 p-1 text-text-muted hover:text-accent-pink">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-primary font-medium mb-1">拖拽音频文件到此处</p>
                  <p className="text-sm text-text-muted">支持 MP3、WAV、OGG、FLAC、M4A，不超过 30MB</p>
                </>
              )}
            </div>
            {errors.audio && <p className="text-xs text-accent-pink mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.audio}</p>}
          </div>

          {/* Cover Upload */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">封面图片</label>
            <div className="flex gap-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCoverDrop}
                onClick={() => coverInputRef.current?.click()}
                className="w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-accent-purple/50 cursor-pointer flex items-center justify-center bg-bg-card overflow-hidden transition-all"
              >
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                {coverFile ? (
                  <img src={URL.createObjectURL(coverFile)} alt="封面预览" className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-8 h-8 text-text-muted" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-muted mb-2">建议尺寸：正方形，如 1000×1000</p>
                <p className="text-xs text-text-muted">支持 JPG、PNG、WebP，建议不超过 5MB</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              歌曲标题 <span className="text-accent-pink">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="给你的歌曲起个名字..."
              className={cn('w-full px-4 py-3 bg-bg-card border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-purple transition-all', errors.title ? 'border-accent-pink' : 'border-border')}
            />
            {errors.title && <p className="text-xs text-accent-pink mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">歌曲描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="介绍一下这首歌曲的创作背景、风格特点..."
              rows={3}
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-purple transition-all resize-none"
            />
          </div>

          {/* AI Tool */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">AI 生成工具 <span className="text-accent-pink">*</span></label>
            <div className="flex flex-wrap gap-2">
              {aiToolOptions.map(tool => (
                <button
                  key={tool}
                  onClick={() => setForm(prev => ({ ...prev, aiTool: tool }))}
                  className={cn('px-4 py-2 rounded-full text-sm font-medium border transition-all', form.aiTool === tool ? 'bg-accent-purple text-white border-accent-purple' : 'bg-bg-card text-text-secondary border-border hover:border-accent-purple/50')}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {/* Style Tags */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              风格标签 <span className="text-accent-pink">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {styleTagOptions.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn('px-3 py-1.5 rounded-full text-sm border transition-all', form.styleTags.includes(tag) ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30' : 'bg-bg-card text-text-muted border-border hover:border-accent-cyan/30')}
                >
                  {tag}
                </button>
              ))}
            </div>
            {errors.style && <p className="text-xs text-accent-pink mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.style}</p>}
          </div>

          {/* Lyrics */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">歌词</label>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-4 h-4 text-text-muted" />
              <span className="text-xs text-text-muted">上传 .lrc 文件实现歌词同步</span>
              <input ref={lrcInputRef} type="file" accept=".lrc,.txt" className="hidden" onChange={(e) => setLrcFile(e.target.files?.[0] || null)} />
              <button onClick={() => lrcInputRef.current?.click()} className="text-xs text-accent-purple hover:underline">上传LRC</button>
              {lrcFile && <span className="text-xs text-accent-cyan">✓ {lrcFile.name}</span>}
            </div>
            <textarea
              value={form.plainLyrics}
              onChange={(e) => setForm(prev => ({ ...prev, plainLyrics: e.target.value }))}
              placeholder="或者直接粘贴歌词文本..."
              rows={6}
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-purple transition-all resize-none font-mono text-sm"
            />
          </div>

          {/* Submit */}
          {isUploading ? (
            <div className="py-6 bg-bg-card rounded-2xl border border-border">
              {/* Progress Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent-purple/10 flex items-center justify-center mx-auto mb-3">
                  {uploadStage === 'complete' ? (
                    <Check className="w-8 h-8 text-accent-green" />
                  ) : (
                    <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {uploadStage === 'validating' && '正在验证文件...'}
                  {uploadStage === 'uploading' && '正在上传...'}
                  {uploadStage === 'processing' && '正在处理音频...'}
                  {uploadStage === 'publishing' && '即将完成...'}
                  {uploadStage === 'complete' && '上传成功！'}
                </h3>
                <p className="text-sm text-text-muted mt-1">请勿关闭页面</p>
              </div>
              
              {/* Progress Bar */}
              <div className="px-6">
                <div className="h-2 bg-bg-secondary rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-purple to-accent-cyan transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>{uploadProgress}%</span>
                  <span>{(uploadProgress / 100 * audioFile!.size / 1024 / 1024).toFixed(1)} MB / {(audioFile!.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </div>
              
              {/* Stage Steps */}
              <div className="px-6 mt-6">
                <div className="flex justify-between">
                  {uploadStages.map((stage, index) => {
                    const Icon = stage.icon
                    const isComplete = uploadProgress > (index + 1) * 25
                    const isCurrent = uploadStage === stage.key
                    return (
                      <div key={stage.key} className="flex flex-col items-center">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                          isComplete ? 'bg-accent-purple text-white' : 
                          isCurrent ? 'bg-accent-purple/20 text-accent-purple' : 
                          'bg-bg-secondary text-text-muted'
                        )}>
                          {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span className={cn('text-xs mt-1', isCurrent ? 'text-accent-purple' : 'text-text-muted')}>
                          {stage.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 py-3 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" /> 发布歌曲
              </button>
              <button onClick={() => navigate('/')} className="px-6 py-3 border border-border text-text-secondary rounded-xl hover:bg-bg-card transition-all">
                取消
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
