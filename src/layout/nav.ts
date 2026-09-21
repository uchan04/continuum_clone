export type NavItem = {
  to: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '대시보드', icon: '🏠' },
  { to: '/offboarding', label: '오프보딩', icon: '🔌' },
  { to: '/handover', label: 'AI 인수인계 리포트', icon: '📄' },
  { to: '/integrations', label: '연동 관리', icon: '🔗' },
  { to: '/audit-log', label: '감사 로그', icon: '🛡️' },
  { to: '/members', label: '구성원 관리', icon: '👥' },
]
