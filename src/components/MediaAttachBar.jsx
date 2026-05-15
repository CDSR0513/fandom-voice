import { Image, Mic, Video } from 'lucide-react'

/** 사진·영상·음성 첨부 UI (로컬 미리보기 시뮬레이션) */
export default function MediaAttachBar({ onFilesSelected, compact = false }) {
  const handlePick = (accept, label) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = accept.startsWith('image')
    input.onchange = (e) => {
      const files = Array.from(e.target.files ?? [])
      if (files.length) onFilesSelected?.(files, label)
    }
    input.click()
  }

  const btnClass = compact
    ? 'p-2 rounded-lg text-gray-400 hover:text-accent-glow hover:bg-accent/10 transition'
    : 'p-2.5 rounded-xl text-gray-400 hover:text-accent-glow hover:bg-accent/10 border border-transparent hover:border-accent/20 transition'

  return (
    <div className={`flex items-center gap-1 ${compact ? '' : 'pt-2'}`}>
      <button
        type="button"
        title="사진 첨부"
        className={btnClass}
        onClick={() => handlePick('image/*', '사진')}
      >
        <Image className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="영상 첨부"
        className={btnClass}
        onClick={() => handlePick('video/*', '영상')}
      >
        <Video className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="음성 첨부"
        className={btnClass}
        onClick={() => handlePick('audio/*', '음성')}
      >
        <Mic className="w-4 h-4" />
      </button>
    </div>
  )
}
