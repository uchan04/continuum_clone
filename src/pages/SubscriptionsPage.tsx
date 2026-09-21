import { useState } from 'react'
import Badge from '../components/Badge'
import BulkActionBar from '../components/BulkActionBar'
import DataTable, { type Column } from '../components/DataTable'
import FilterChips from '../components/FilterChips'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Tabs from '../components/Tabs'

type Subscription = {
  id: number
  name: string
  category: string
  status: '사용중' | '미사용' | '미확인'
  owner: string
  users: number
  plan: string
  discoveredVia: string
}

const SUBSCRIPTIONS: Subscription[] = [
  { id: 1, name: 'Figma', category: '디자인', status: '사용중', owner: '디자인팀', users: 12, plan: 'Organization', discoveredVia: '카드결제' },
  { id: 2, name: 'Notion', category: '생산성', status: '사용중', owner: '전사', users: 38, plan: 'Business', discoveredVia: 'GWS SSO' },
  { id: 3, name: 'Anthropic Claude', category: 'AI', status: '사용중', owner: '개발팀', users: 8, plan: 'Team', discoveredVia: 'Anthropic 연동' },
  { id: 4, name: 'Canva Pro', category: '디자인', status: '미확인', owner: '마케팅팀', users: 3, plan: 'Pro', discoveredVia: '카드결제' },
  { id: 5, name: 'JetBrains All Products', category: '개발도구', status: '미사용', owner: '개발팀', users: 0, plan: 'Team', discoveredVia: '이메일 인보이스' },
]

const STATUS_COLOR: Record<Subscription['status'], 'green' | 'gray' | 'yellow'> = {
  사용중: 'green',
  미사용: 'gray',
  미확인: 'yellow',
}

const DISCOVERY_QUEUE = [
  { id: 1, name: 'Miro', source: '카드결제', status: '대기', foundAt: '2026-09-18' },
  { id: 2, name: 'Vercel', source: 'GWS SSO', status: '대기', foundAt: '2026-09-17' },
  { id: 3, name: 'Loom', source: '계좌이체', status: '무시됨', foundAt: '2026-09-10' },
]

const UNAUTHORIZED_POLICIES = [
  { id: 1, name: '개인 결제 SaaS 금지', owner: 'IT팀', reason: '법인카드 미사용', openViolations: 3 },
  { id: 2, name: '미승인 AI 도구 금지', owner: '보안팀', reason: '데이터 유출 위험', openViolations: 2 },
]

const columns: Column<Subscription>[] = [
  { header: '소프트웨어', render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { header: '카테고리', render: (r) => r.category },
  { header: '상태', render: (r) => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge> },
  { header: '관리자', render: (r) => r.owner },
  { header: '사용자', render: (r) => `${r.users}명` },
  { header: '구독 플랜', render: (r) => r.plan },
  { header: '발견 경로', render: (r) => r.discoveredVia },
]

export default function SubscriptionsPage() {
  const [tab, setTab] = useState('소프트웨어 목록')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const toggle = (id: number | string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id as number) ? next.delete(id as number) : next.add(id as number)
      return next
    })

  const rows = SUBSCRIPTIONS.filter((s) => statusFilter === '전체' || s.status === statusFilter)

  return (
    <div>
      <PageHeader
        title="구독 소프트웨어 관리"
        description="자동 발견, 계약 관리, 사용 현황, 비인가 소프트웨어를 한 곳에서 추적합니다."
      />
      <div className="grid grid-cols-3 gap-4 px-8 pb-2 pt-6">
        <StatCard label="관리 중인 SW" value="42개" />
        <StatCard label="월 SaaS 총 비용" value="₩8,420,000" />
        <StatCard label="비인가 소프트웨어" value="5건" hint="확인 필요" />
      </div>

      <Tabs
        tabs={['소프트웨어 목록', '발견(Discovery)', '비인가 소프트웨어']}
        active={tab}
        onChange={setTab}
      />

      {tab === '소프트웨어 목록' && (
        <>
          <FilterChips
            options={['전체', '사용중', '미사용', '미확인']}
            active={statusFilter}
            onChange={setStatusFilter}
          />
          <div className="p-8 pt-4">
            <BulkActionBar count={selected.size} actions={['사용자 추가', '제외하기', '다운로드']} />
            <DataTable columns={columns} rows={rows} selected={selected} onToggle={toggle} />
          </div>
        </>
      )}

      {tab === '발견(Discovery)' && (
        <div className="p-8">
          <p className="mb-3 text-sm text-gray-500">
            카드결제 · 계좌이체 · 이메일 인보이스 · GWS SSO · AI 벤더 연동 · 에이전트에서 자동 발견된 신규 소프트웨어입니다.
          </p>
          <DataTable
            columns={[
              { header: '소프트웨어', render: (r) => r.name },
              { header: '소스', render: (r) => r.source },
              {
                header: '상태',
                render: (r) => (
                  <Badge color={r.status === '대기' ? 'yellow' : 'gray'}>{r.status}</Badge>
                ),
              },
              { header: '발견일', render: (r) => r.foundAt },
            ]}
            rows={DISCOVERY_QUEUE}
          />
        </div>
      )}

      {tab === '비인가 소프트웨어' && (
        <div className="p-8">
          <DataTable
            columns={[
              { header: '정책', render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
              { header: '담당자', render: (r) => r.owner },
              { header: '사유', render: (r) => r.reason },
              {
                header: '미처리 위반',
                render: (r) => <Badge color={r.openViolations > 0 ? 'red' : 'green'}>{r.openViolations}건</Badge>,
              },
            ]}
            rows={UNAUTHORIZED_POLICIES}
          />
        </div>
      )}
    </div>
  )
}
