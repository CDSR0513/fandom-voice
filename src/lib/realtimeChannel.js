import { supabase } from './supabase'

/**
 * postgres_changes 리스너를 먼저 등록한 뒤 subscribe() 호출.
 * Realtime 오류가 나도 렌더링이 중단되지 않도록 try/catch 처리.
 */
export function subscribePostgresChanges({
  channelName,
  table,
  filter,
  onChange,
}) {
  try {
    const channel = supabase.channel(channelName)

    const config = { event: '*', schema: 'public', table }
    if (filter) config.filter = filter

    channel.on('postgres_changes', config, (payload) => {
      try {
        onChange(payload)
      } catch (err) {
        console.warn(`[Realtime] ${channelName} 콜백 오류:`, err)
      }
    })

    channel.subscribe((status, err) => {
      if (err) {
        console.warn(`[Realtime] ${channelName} 구독 오류:`, err)
        return
      }
      if (status === 'CHANNEL_ERROR') {
        console.warn(`[Realtime] ${channelName} 채널 오류`)
      }
    })

    return channel
  } catch (err) {
    console.warn(`[Realtime] ${channelName} 설정 실패:`, err)
    return null
  }
}

export function unsubscribeChannel(channel) {
  if (!channel) return
  try {
    supabase.removeChannel(channel)
  } catch (err) {
    console.warn('[Realtime] 채널 해제 실패:', err)
  }
}
