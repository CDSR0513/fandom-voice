import { useState } from 'react'
import { Heart, Send } from 'lucide-react'
import MediaAttachBar from './MediaAttachBar'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CommentSection({
  comments,
  loading,
  onAddComment,
  onEmpathy,
}) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [attachments, setAttachments] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await onAddComment({
        content: content.trim(),
        author_name: authorName.trim() || '팬',
      })
      setContent('')
      setAttachments([])
    } catch (err) {
      setError(err.message ?? '달글 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold">달글</h2>
        <span className="text-sm text-gray-500">
          {comments.length}개 · 이 스레드에서 의견을 모아 주세요
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">달글 불러오는 중…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center glass-card">
          첫 달글을 남겨 깊은 논의를 시작해 보세요.
        </p>
      ) : (
        <ul className="space-y-3 mb-6">
          {comments.map((c) => (
            <li key={c.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-accent-glow">
                  {c.author_name ?? '팬'}
                </span>
                <span className="text-xs text-gray-500">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{c.content}</p>
              <button
                type="button"
                onClick={() => onEmpathy?.(c.id, c.empathy_count)}
                className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-rose-400 transition"
              >
                <Heart className="w-3.5 h-3.5" />
                공감 {c.empathy_count ?? 0}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-4">
        <p className="text-xs text-gray-500 mb-3">
          파편화된 대화 대신, 이 달글 스레드 안에서 의견을 이어가 주세요.
        </p>
        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="input-dark mb-2 text-sm"
          placeholder="닉네임 (선택)"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="input-dark resize-none text-sm"
          placeholder="달글을 입력하세요…"
        />
        <div className="flex items-center justify-between mt-2">
          <MediaAttachBar
            compact
            onFilesSelected={(files, label) =>
              setAttachments((prev) => [
                ...prev,
                ...files.map((f) => ({ name: f.name, type: label })),
              ])
            }
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-muted text-white text-sm font-medium disabled:opacity-50 transition"
          >
            <Send className="w-4 h-4" />
            달글 달기
          </button>
        </div>
        {attachments.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            첨부: {attachments.map((a) => a.name).join(', ')}
          </p>
        )}
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </form>
    </section>
  )
}
