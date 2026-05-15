import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { subscribePostgresChanges, unsubscribeChannel } from '../lib/realtimeChannel'
import { DEFAULT_ARTIST } from '../lib/constants'
import { POST_COLUMNS, buildPostInsertPayload } from '../lib/db'

export function usePosts({ tab = 'all', realtime = true } = {}) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('posts')
        .select(POST_COLUMNS)
        .eq('artist_name', DEFAULT_ARTIST)
        .order('created_at', { ascending: false })

      if (tab && tab !== 'all') {
        query = query.eq('category', tab)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        setError(fetchError.message)
        setPosts([])
      } else {
        setPosts(data ?? [])
      }
    } catch (err) {
      setError(err.message ?? '게시글을 불러오지 못했습니다.')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    let cancelled = false

    fetchPosts().catch(() => {
      if (!cancelled) setLoading(false)
    })

    if (!realtime) {
      return () => {
        cancelled = true
      }
    }

    const channel = subscribePostgresChanges({
      channelName: `posts-iu-${tab}`,
      table: 'posts',
      onChange: () => {
        if (!cancelled) fetchPosts()
      },
    })

    return () => {
      cancelled = true
      unsubscribeChannel(channel)
    }
  }, [fetchPosts, tab, realtime])

  const createPost = async (fields) => {
    const payload = buildPostInsertPayload(fields)
    const { data, error: insertError } = await supabase
      .from('posts')
      .insert([payload])
      .select(POST_COLUMNS)
      .single()

    if (insertError) throw insertError
    return data
  }

  const incrementEmpathy = async (postId, currentCount) => {
    const { error: updateError } = await supabase
      .from('posts')
      .update({ empathy_count: (currentCount ?? 0) + 1 })
      .eq('id', postId)

    if (updateError) throw updateError
  }

  return { posts, loading, error, fetchPosts, createPost, incrementEmpathy }
}

export function usePost(postId) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPost = useCallback(async () => {
    if (!postId) {
      setLoading(false)
      return
    }
    setLoading(true)

    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(POST_COLUMNS)
        .eq('id', postId)
        .eq('artist_name', DEFAULT_ARTIST)
        .single()

      if (fetchError) {
        setError(fetchError.message)
        setPost(null)
      } else {
        setPost(data)
        setError(null)
      }
    } catch (err) {
      setError(err.message ?? '게시글을 불러오지 못했습니다.')
      setPost(null)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (!postId) return undefined

    let cancelled = false

    fetchPost().catch(() => {
      if (!cancelled) setLoading(false)
    })

    const channel = subscribePostgresChanges({
      channelName: `post-detail-${postId}`,
      table: 'posts',
      filter: `id=eq.${postId}`,
      onChange: () => {
        if (!cancelled) fetchPost()
      },
    })

    return () => {
      cancelled = true
      unsubscribeChannel(channel)
    }
  }, [postId, fetchPost])

  const incrementEmpathy = async () => {
    if (!post) return
    await supabase
      .from('posts')
      .update({ empathy_count: (post.empathy_count ?? 0) + 1 })
      .eq('id', post.id)
    fetchPost()
  }

  return { post, loading, error, fetchPost, incrementEmpathy }
}
