import Badge from '../components/Badge'
import DataTable, { type Column } from '../components/DataTable'
import PageHeader from '../components/PageHeader'

type Campaign = {
  id: number
  name: string
  progress: number
  total: number
  deadline: string
  status: '초안' | '준비완료' | '진행중' | '완료' | '취소'
}

const CAMPAIGNS: Campaign[] = [
  { id: 1, name: '2026년 하반기 자산조사', progress: 82, total: 118, deadline: '2026-09-30', status: '진행중' },
  { id: 2, name: '2026년 상반기 자산조사', progress: 118, total: 118, deadline: '2026-03-31', status: '완료' },
  { id: 3, name: '신규 입사자 기기 확인', progress: 0, total: 12, deadline: '2026-10-15', status: '준비완료' },
]

const STATUS_COLOR: Record<Campaign['status'], 'gray' | 'violet' | 'yellow' | 'green' | 'red'> = {
  초안: 'gray',
  준비완료: 'violet',
  진행중: 'yellow',
  완료: 'green',
  취소: 'red',
}

const columns: Column<Campaign>[] = [
  { header: '캠페인', render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  {
    header: '응답 현황',
    render: (r) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-violet-600"
            style={{ width: `${(r.progress / r.total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">
          {r.progress} / {r.total}
        </span>
      </div>
    ),
  },
  { header: '마감일', render: (r) => r.deadline },
  { header: '상태', render: (r) => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge> },
]

export default function AssetSurveyPage() {
  return (
    <div>
      <PageHeader
        title="자산조사"
        description="캠페인 기반으로 구성원과 협업해 자산 현황을 업데이트합니다. 초안 → 준비완료 → 진행중 → 완료 순서로 진행됩니다."
      />
      <div className="px-8 py-6">
        <div className="mb-3 flex justify-end">
          <button type="button" className="rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white">
            캠페인 생성하기
          </button>
        </div>
        <DataTable columns={columns} rows={CAMPAIGNS} />
      </div>
    </div>
  )
}
