import { supabase } from './supabase'
import { DEFAULT_ARTIST } from './constants'

/** posts 테이블 실제 컬럼 */
export const POST_COLUMNS =
  'id, title, content, artist_name, category, urgency_level, empathy_count, comment_count, created_at'

/** comments 테이블 실제 컬럼 */
export const COMMENT_COLUMNS =
  'id, post_id, content, author_name, empathy_count, created_at'

export function buildPostInsertPayload({ title, content, category, urgency_level }) {
  return {
    title,
    content,
    artist_name: DEFAULT_ARTIST,
    category,
    urgency_level,
    empathy_count: 0,
    comment_count: 0,
  }
}

export function buildCommentInsertPayload({ post_id, content, author_name = '팬' }) {
  return {
    post_id,
    content,
    author_name,
  }
}

/** comments 실제 개수로 posts.comment_count 동기화 */
export async function syncCommentCount(postId) {
  const { count, error: countError } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId)

  if (countError) throw countError

  const nextCount = count ?? 0

  const { error: updateError } = await supabase
    .from('posts')
    .update({ comment_count: nextCount })
    .eq('id', postId)

  if (updateError) throw updateError

  return nextCount
}
