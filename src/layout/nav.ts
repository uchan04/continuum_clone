export type NavItem = {
  to: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '시작하기', icon: '🏠' },
  { to: '/subscriptions', label: '구독 소프트웨어 관리', icon: '📦' },
  { to: '/devices', label: 'IT 기기 관리', icon: '💻' },
  { to: '/members', label: '구성원 관리', icon: '👥' },
  { to: '/agent', label: '심플리 에이전트', icon: '🛰️' },
  { to: '/asset-survey', label: '자산조사', icon: '📋' },
  { to: '/ai-cost', label: 'AI 비용 관리', icon: '🤖' },
]
