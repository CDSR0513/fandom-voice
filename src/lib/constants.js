/** 아이유 전용 여론 수집 플랫폼 */
export const DEFAULT_ARTIST = '아이유'
export const SERVICE_NAME = '아이유 팬덤 보이스'
export const SERVICE_TAGLINE = '아이유 전용 여론 수집 플랫폼'

/** DB posts.category 값 ↔ UI 탭 */
export const TABS = [
  { id: 'all', label: '전체' },
  { id: 'agency', label: '소속사 피드백' },
  { id: 'goods', label: '굿즈/공연' },
]

export const CATEGORY_LABELS = {
  all: '전체',
  agency: '소속사 피드백',
  goods: '굿즈/공연',
}

export const URGENCY_LABELS = {
  urgent: '매우 긴급',
  hot: 'HOT',
  normal: '',
}
