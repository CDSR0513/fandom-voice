import { useState } from 'react'
import { X } from 'lucide-react'
import { DEFAULT_ARTIST, TABS } from '../lib/constants'
import MediaAttachBar from './MediaAttachBar'

export default function CreatePostModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('agency')
  const [urgencyLevel, setUrgencyLevel] = useState('normal')
  const [attachments, setAttachments] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleFiles = (files, label) => {
    setAttachments((prev) => [
      ...prev,
      ...files.map((f) => ({ name: f.name, type: label })),
    ])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('제목과 본문을 입력해 주세요.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
        urgency_level: urgencyLevel,
      })
      setTitle('')
      setContent('')
      setAttachments([])
      onClose()
    } catch (err) {
      setError(err.message ?? '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const categoryOptions = TABS.filter((t) => t.id !== 'all')

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold">새 건의 글 작성</h2>
            <p className="text-xs text-accent-glow/80 mt-0.5">
              아티스트: {DEFAULT_ARTIST} (자동 저장)
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-dark"
              >
                {categoryOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">긴급도</label>
              <select
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value)}
                className="input-dark"
              >
                <option value="normal">일반</option>
                <option value="hot">HOT</option>
                <option value="urgent">매우 긴급</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-dark"
              placeholder="건의 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">본문</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="input-dark resize-none"
              placeholder="아이유 팬덤 의견을 구체적으로 작성해 주세요."
            />
            <MediaAttachBar onFilesSelected={handleFiles} />
            {attachments.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                첨부(로컬): {attachments.map((a) => a.name).join(', ')}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-muted text-white font-medium disabled:opacity-50 transition"
          >
            {submitting ? '게시 중…' : '게시하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
