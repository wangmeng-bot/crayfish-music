import { useState } from 'react'
import { Heart, Reply, Send, Trash2 } from 'lucide-react'
import { useCommentStore } from '../store/commentStore'
import { useAuthStore } from '../store/authStore'
import type { Comment } from '../types'
import { cn, formatTimeAgo } from '../lib/utils'

interface CommentSectionProps {
  songId: string
  className?: string
}

export default function CommentSection({ songId, className }: CommentSectionProps) {
  const { getComments, addComment, addReply, deleteComment, likeComment } = useCommentStore()
  const { isAuthenticated, currentUser } = useAuthStore()
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const comments = getComments(songId)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !isAuthenticated) return

    await addComment(songId, newComment.trim())
    setNewComment('')
  }

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim() || !isAuthenticated) return

    await addReply(songId, commentId, replyContent.trim())
    setReplyContent('')
    setReplyingTo(null)
  }

  const renderComment = (comment: Comment, isReply = false) => {
    const canDelete = currentUser?.id === comment.userId

    return (
      <div key={comment.id} className={cn(isReply && 'ml-8 mt-3')}>
        <div className="flex gap-3 group">
          <img
            src={comment.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.userId}&backgroundColor=8b5cf6`}
            alt={comment.username || '用户'}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-bg-secondary"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-text-primary">{comment.username || '匿名用户'}</span>
              <span className="text-xs text-text-muted">{formatTimeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-text-secondary mt-1">{comment.content}</p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => likeComment(songId, comment.id)}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-pink transition-colors"
              >
                <Heart className="w-3.5 h-3.5" />
                {comment.likes > 0 && <span>{comment.likes}</span>}
              </button>
              {!isReply && isAuthenticated && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-purple transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  回复
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => deleteComment(songId, comment.id)}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-pink transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`回复 @${comment.username || '该用户'}...`}
                  className="flex-1 bg-bg-secondary border border-border rounded-full px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply(comment.id)}
                />
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  className="p-2 bg-accent-purple text-white rounded-full hover:bg-accent-purple/80 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 border-l-2 border-border/50 pl-3 space-y-3">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    )
  }

  // 计算总评论数（包括回复）
  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0)
  }, 0)

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-lg font-semibold text-text-primary">
        评论 {totalComments > 0 && <span className="text-text-muted font-normal">({totalComments})</span>}
      </h3>

      {/* Comment Input */}
      {isAuthenticated && currentUser ? (
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <img
            src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.id}&backgroundColor=8b5cf6`}
            alt={currentUser.username}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-bg-secondary"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="发表你的看法..."
              className="flex-1 bg-bg-secondary border border-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-5 py-2.5 bg-accent-purple text-white rounded-full text-sm font-medium hover:bg-accent-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发布
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-center py-4 bg-bg-secondary/50 rounded-xl border border-border">
          <p className="text-sm text-text-muted">
            登录后参与评论
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted">还没有评论，来抢沙发吧 🎵</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  )
}
