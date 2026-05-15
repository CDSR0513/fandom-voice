import { Link } from 'react-router-dom'
import { Heart, MessageCircle } from 'lucide-react'
import { CategoryBadge, UrgencyBadge } from './Badges'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function PostCard({ post }) {
  return (
    <Link
      to={`/post/${post.id}`}
      className="glass-card block p-5 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition group"
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <UrgencyBadge urgencyLevel={post.urgency_level} />
        <CategoryBadge category={post.category} />
        <span className="text-xs text-gray-500 ml-auto">{formatDate(post.created_at)}</span>
      </div>

      <h3 className="font-semibold text-gray-100 group-hover:text-accent-glow transition line-clamp-2 mb-1.5">
        {post.title}
      </h3>
      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{post.content}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-accent-glow/80 bg-accent/10 px-2.5 py-1 rounded-lg">
          {post.artist_name}
        </span>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-rose-400/80" />
            {post.empathy_count ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4 text-accent/80" />
            {post.comment_count ?? 0}
            <span className="text-xs text-gray-500">달글</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
