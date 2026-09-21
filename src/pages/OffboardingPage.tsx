import { useState } from 'react'
import Badge from '../components/Badge'
import BulkActionBar from '../components/BulkActionBar'
import DataTable, { type Column } from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'

type Employee = {
  id: number
  name: string
  team: string
  lastWorkDay: string
  status: '재직중' | '퇴사 예정' | '처리중' | '완료'
}

const EMPLOYEES: Employee[] = [
  { id: 1, name: '정다운', team: '경영지원팀', lastWorkDay: '2026-09-25', status: '퇴사 예정' },
  { id: 2, name: '최윤재', team: '개발팀', lastWorkDay: '2026-09-20', status: '처리중' },
  { id: 3, name: '한소미', team: '마케팅팀', lastWorkDay: '2026-08-31', status: '완료' },
  { id: 4, name: '오세훈', team: '영업팀', lastWorkDay: '2026-09-30', status: '재직중' },
]

const STATUS_COLOR: Record<Employee['status'], 'gray' | 'yellow' | 'violet' | 'green'> = {
  재직중: 'gray',
  '퇴사 예정': 'yellow',
  처리중: 'violet',
  완료: 'green',
}

type SystemRevoke = {
  system: string
  method: 'API' | 'Headless RPA'
  status: '완료' | '처리중' | '대기'
  elapsed: string
}

const REVOKE_DETAIL: SystemRevoke[] = [
  { system: 'Slack', method: 'API', status: '완료', elapsed: '0.4초' },
  { system: 'Notion', method: 'API', status: '완료', elapsed: '0.6초' },
  { system: 'Google Workspace', method: 'API', status: '완료', elapsed: '0.5초' },
  { system: '이카운트 ERP', method: 'Headless RPA', status: '처리중', elapsed: '진행 중' },
  { system: '더존', method: 'Headless RPA', status: '대기', elapsed: '대기 중' },
]

const REVOKE_STATUS_COLOR: Record<SystemRevoke['status'], 'green' | 'violet' | 'gray'> = {
  완료: 'green',
  처리중: 'violet',
  대기: 'gray',
}

export default function OffboardingPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [detailOpenId, setDetailOpenId] = useState<number | null>(2)

  const toggle = (id: number | string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id as number) ? next.delete(id as number) : next.add(id as number)
      return next
    })

  const columns: Column<Employee>[] = [
    { header: '이름', render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
    { header: '팀', render: (r) => r.team },
    { header: '최종 근무일', render: (r) => r.lastWorkDay },
    { header: '상태', render: (r) => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge> },
    {
      header: '',
      render: (r) => (
        <button
          type="button"
          onClick={() => setDetailOpenId(r.id)}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          disabled={r.status === '완료'}
        >
          권한 회수
        </button>
      ),
    },
  ]

  const detailEmployee = EMPLOYEES.find((e) => e.id === detailOpenId)

  return (
    <div>
      <PageHeader
        title="오프보딩"
        description="원클릭 중앙 통제 스위치 — 글로벌 SaaS는 API, 국내 폐쇄형 ERP는 Headless RPA로 권한을 일괄 회수합니다."
      />
      <div className="grid grid-cols-3 gap-4 px-8 pb-2 pt-6">
        <StatCard label="이번 달 처리 건수" value="3건" />
        <StatCard label="평균 처리 시간" value="1.2초" hint="API 연동 기준" />
        <StatCard label="미회수 위험 계정" value="0건" hint="전월 2건 → 개선" />
      </div>

      <div className="grid grid-cols-3 gap-4 p-8">
        <div className="col-span-2">
          <BulkActionBar count={selected.size} actions={['일괄 권한 회수']} />
          <DataTable columns={columns} rows={EMPLOYEES} selected={selected} onToggle={toggle} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          {detailEmployee ? (
            <>
              <h2 className="mb-1 text-sm font-semibold text-gray-900">
                {detailEmployee.name} · 권한 회수 현황
              </h2>
              <p className="mb-3 text-xs text-gray-400">
                버튼 클릭 시 연쇄적으로 각 시스템 권한이 차단됩니다.
              </p>
              <ul className="space-y-2">
                {REVOKE_DETAIL.map((r) => (
                  <li
                    key={r.system}
                    className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{r.system}</div>
                      <div className="text-xs text-gray-400">{r.method}</div>
                    </div>
                    <div className="text-right">
                      <Badge color={REVOKE_STATUS_COLOR[r.status]}>{r.status}</Badge>
                      <div className="mt-1 text-[11px] text-gray-400">{r.elapsed}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              좌측 목록에서 "권한 회수" 버튼을 눌러 진행 현황을 확인하세요.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
