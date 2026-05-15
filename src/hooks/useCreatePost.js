import { supabase } from '../lib/supabase'
import { POST_COLUMNS, buildPostInsertPayload } from '../lib/db'

/** Realtime 구독 없이 게시글만 생성 */
export function useCreatePost() {
  const createPost = async (fields) => {
    const payload = buildPostInsertPayload(fields)
    const { data, error } = await supabase
      .from('posts')
      .insert([payload])
      .select(POST_COLUMNS)
      .single()

    if (error) throw error
    return data
  }

  return { createPost }
}
