import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { subscribePostgresChanges, unsubscribeChannel } from '../lib/realtimeChannel'
import {
  COMMENT_COLUMNS,
  buildCommentInsertPayload,
  syncCommentCount,
} from '../lib/db'

export function useComments(postId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComments = useCallback(async () => {
    if (!postId) {
      setComments([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(COMMENT_COLUMNS)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
        setComments([])
      } else {
        setComments(data ?? [])
      }
    } catch (err) {
      setError(err.message ?? '달글을 불러오지 못했습니다.')
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (!postId) return undefined

    let cancelled = false

    fetchComments().catch(() => {
      if (!cancelled) setLoading(false)
    })

    const channel = subscribePostgresChanges({
      channelName: `comments-${postId}`,
      table: 'comments',
      filter: `post_id=eq.${postId}`,
      onChange: () => {
        if (!cancelled) fetchComments()
      },
    })

    return () => {
      cancelled = true
      unsubscribeChannel(channel)
    }
  }, [postId, fetchComments])

  const addComment = async ({ content, author_name = '팬' }) => {
    const payload = buildCommentInsertPayload({
      post_id: postId,
      content,
      author_name,
    })

    const { data, error: insertError } = await supabase
      .from('comments')
      .insert([payload])
      .select(COMMENT_COLUMNS)
      .single()

    if (insertError) throw insertError

    await syncCommentCount(postId)

    return data
  }

  const incrementEmpathy = async (commentId, currentCount) => {
    const { error: updateError } = await supabase
      .from('comments')
      .update({ empathy_count: (currentCount ?? 0) + 1 })
      .eq('id', commentId)

    if (updateError) throw updateError
    fetchComments()
  }

  return { comments, loading, error, addComment, incrementEmpathy, fetchComments }
}
