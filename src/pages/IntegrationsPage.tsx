import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'

type Integration = {
  name: string
  method: 'API' | 'Headless RPA'
  status: '연동됨' | '미연동'
  detail: string
}

const API_INTEGRATIONS: Integration[] = [
  { name: 'Slack', method: 'API', status: '연동됨', detail: '워크스페이스 관리자 권한으로 계정 비활성화/삭제' },
  { name: 'Notion', method: 'API', status: '연동됨', detail: '멤버 제거 및 워크스페이스 접근 권한 회수' },
  { name: 'Google Workspace', method: 'API', status: '연동됨', detail: '계정 정지, 라이선스 회수, 데이터 위임' },
]

const RPA_INTEGRATIONS: Integration[] = [
  { name: '이카운트 ERP', method: 'Headless RPA', status: '연동됨', detail: '관리자 페이지를 백그라운드에서 자동 조작해 계정 비활성화' },
  { name: '더존', method: 'Headless RPA', status: '미연동', detail: '폐쇄형 API 미제공 — RPA 어댑터로 로그인/권한 해제 자동화' },
]

const STATUS_COLOR = { 연동됨: 'green', 미연동: 'gray' } as const

function IntegrationCard({ item }: { item: Integration }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-gray-900">{item.name}</span>
        <Badge color={STATUS_COLOR[item.status]}>{item.status}</Badge>
      </div>
      <p className="text-xs text-gray-500">{item.detail}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">{item.method}</span>
        <button type="button" className="text-sm font-medium text-violet-600 hover:underline">
          {item.status === '연동됨' ? '연동 해제하기' : '연동하기'}
        </button>
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader
        title="연동 관리"
        description="글로벌 SaaS는 API로 즉시 제어하고, 국내 폐쇄형 ERP는 Headless RPA 어댑터로 백그라운드 처리합니다."
      />
      <div className="px-8 py-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">글로벌 SaaS (API)</h2>
        <div className="grid grid-cols-3 gap-4">
          {API_INTEGRATIONS.map((item) => (
            <IntegrationCard key={item.name} item={item} />
          ))}
        </div>

        <h2 className="mb-3 mt-8 text-sm font-semibold text-gray-700">국내 폐쇄형 ERP (Headless RPA)</h2>
        <div className="grid grid-cols-3 gap-4">
          {RPA_INTEGRATIONS.map((item) => (
            <IntegrationCard key={item.name} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
