import { CATEGORY_LABELS, URGENCY_LABELS } from './constants'

/**
 * AI 오피셜 건의문 리포트 생성 시뮬레이션
 */
export function generateOfficialReport(post, comments) {
  const now = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const commentBodies = comments
    .map((c, i) => `  ${i + 1}. [${c.author_name ?? '팬'}] ${c.content}`)
    .join('\n')

  const sentimentSummary = analyzeSentiment(comments)
  const topThemes = extractThemes([post.content, ...comments.map((c) => c.content)])

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        팬덤 보이스 · 오피셜 건의문 리포트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

문서번호: FV-${post.id?.slice(0, 8).toUpperCase() ?? 'DRAFT'}-${Date.now().toString(36).toUpperCase()}
작성일시: ${now}
대상 아티스트: ${post.artist_name}
건의 유형: ${categoryLabel(post.category)}
긴급도: ${urgencyLabel(post.urgency_level)}

────────────────────────────────────────
1. 건의 개요
────────────────────────────────────────

제목: ${post.title}

[원 게시글 본문]
${post.content}

────────────────────────────────────────
2. 팬덤 달글(댓글) 종합 의견 (${comments.length}건)
────────────────────────────────────────

${comments.length > 0 ? commentBodies : '  (등록된 달글이 없습니다.)'}

────────────────────────────────────────
3. AI 인사이트 요약
────────────────────────────────────────

• 감성 분석: ${sentimentSummary}
• 핵심 키워드: ${topThemes.join(', ')}
• 누적 공감수: ${post.empathy_count ?? 0}건
• 달글 참여: ${comments.length}건 (데이터 밀도 ${comments.length >= 5 ? '높음' : comments.length >= 2 ? '보통' : '낮음 — 추가 소통 권장'})

────────────────────────────────────────
4. 소속사 건의 제안 사항
────────────────────────────────────────

본 건의는 팬덤 보이스 플랫폼을 통해 수집·집결된 팬 의견을 기반으로 작성되었습니다.
파편화된 SNS 여론 대신, 단일 게시글 내 달글 스레드로 깊이 있게 수렴된 의견을
공식 건의 채널로 전달드립니다.

[권고 조치]
1) 상기 핵심 키워드 관련 팬 우려 사항에 대한 공식 입장 또는 개선 계획 검토
2) ${post.artist_name} 팬커뮤니티 담당 부서와의 정기 소통 채널 연계 검토
3) 후속 조치 시 팬덤 보이스 플랫폼을 통한 피드백 회신 권장

────────────────────────────────────────
본 문서는 AI 분석 시뮬레이션으로 생성된 초안이며,
최종 검토 후 공식 건의 형태로 제출하시기 바랍니다.

                    — 팬덤 보이스 (Fandom Voice) —
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] ?? category ?? '일반'
}

function urgencyLabel(urgencyLevel) {
  return URGENCY_LABELS[urgencyLevel] || (urgencyLevel === 'normal' ? '일반' : urgencyLevel ?? '일반')
}

function analyzeSentiment(comments) {
  if (comments.length === 0) return '달글 데이터 부족으로 분석 제한'
  const text = comments.map((c) => c.content).join(' ')
  const positive = ['응원', '기대', '감사', '좋', '최고', '사랑'].filter((w) =>
    text.includes(w),
  ).length
  const negative = ['우려', '실망', '아쉬', '불편', '개선', '문제'].filter((w) =>
    text.includes(w),
  ).length
  if (positive > negative) return '긍정적 성향이 우세하나, 개선 요구 의견이 공존'
  if (negative > positive) return '개선·건의 요구가 주를 이루며, 건설적 비판 톤'
  return '중립~건설적 비판이 혼재, 공식 답변 시 정서적 안정 필요'
}

function extractThemes(texts) {
  const keywords = [
    '공연',
    '굿즈',
    '앨범',
    '활동',
    '소통',
    '스케줄',
    '팬미팅',
    '콘서트',
    '멤버',
    '건강',
    '안전',
    '피드백',
  ]
  const joined = texts.join(' ')
  const found = keywords.filter((k) => joined.includes(k)).slice(0, 5)
  return found.length > 0 ? found : ['팬 의견 수렴']
}
