import { useState } from 'react'
import Badge from '../components/Badge'
import FilterChips from '../components/FilterChips'
import PageHeader from '../components/PageHeader'

type Report = {
  id: number
  employee: string
  team: string
  generatedAt: string
  audience: '팀장용' | '실무자용'
  summary: string
  points: { text: string; source: string }[]
}

const REPORTS: Report[] = [
  {
    id: 1,
    employee: '한소미',
    team: '마케팅팀',
    generatedAt: '2026-08-31',
    audience: '팀장용',
    summary:
      '9월 캠페인 집행 예산과 외부 대행사 계약 현황, 진행 중이던 콘텐츠 일정이 정리되어 있습니다.',
    points: [
      { text: '9월 캠페인 최종 예산안 (2,400만원, 대행사 A와 협의 완료)', source: 'Notion · 마케팅 캠페인 기획' },
      { text: '외부 대행사 계약서 최종본 위치', source: 'Google Drive · 계약서 폴더' },
      { text: '진행 중인 협업 요청 3건 (디자인팀 2건, 개발팀 1건)', source: 'Slack · #marketing-team' },
    ],
  },
  {
    id: 2,
    employee: '최윤재',
    team: '개발팀',
    generatedAt: '2026-09-20',
    audience: '실무자용',
    summary: '담당하던 결제 모듈 리팩터링 진행 상황과 미해결 이슈, 배포 히스토리가 정리되어 있습니다.',
    points: [
      { text: '결제 모듈 리팩터링 PR #482 리뷰 대기 중', source: 'GitHub · PR #482' },
      { text: '장애 대응 중이던 이슈 CONT-118 (원인 파악 단계)', source: 'Notion · 이슈 트래커' },
      { text: '스테이징 배포 계정/환경변수 인수 필요', source: 'Slack · #dev-infra' },
    ],
  },
]

const AUDIENCE_LABEL: Record<Report['audience'], 'violet' | 'gray'> = { 팀장용: 'violet', 실무자용: 'gray' }

export default function HandoverPage() {
  const [audience, setAudience] = useState('전체')
  const [openId, setOpenId] = useState<number | null>(REPORTS[0].id)

  const rows = REPORTS.filter((r) => audience === '전체' || r.audience === audience)

  return (
    <div>
      <PageHeader
        title="AI 인수인계 리포트"
        description="권한 인식(Permission-Aware) RAG로 후임자 직급에 맞게 필터링된 브리핑입니다. 모든 항목에 원본 출처가 태깅됩니다."
      />
      <FilterChips options={['전체', '팀장용', '실무자용']} active={audience} onChange={setAudience} />

      <div className="grid grid-cols-3 gap-4 p-8">
        <div className="col-span-1 space-y-2">
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setOpenId(r.id)}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                openId === r.id ? 'border-slate-900 bg-slate-50' : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{r.employee}</span>
                <Badge color={AUDIENCE_LABEL[r.audience]}>{r.audience}</Badge>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {r.team} · {r.generatedAt}
              </div>
            </button>
          ))}
        </div>

        <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-5">
          {(() => {
            const report = REPORTS.find((r) => r.id === openId)
            if (!report) return <p className="text-sm text-gray-400">리포트를 선택하세요.</p>
            return (
              <>
                <h2 className="text-base font-semibold text-gray-900">
                  {report.employee} 인수인계 브리핑
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{report.summary}</p>
                <ul className="mt-4 space-y-2">
                  {report.points.map((p) => (
                    <li key={p.text} className="rounded-md border border-gray-100 px-3 py-2 text-sm">
                      <div className="text-gray-800">{p.text}</div>
                      <div className="mt-1 text-xs text-violet-600">🔗 {p.source}</div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-gray-400">
                  원문은 처리 직후 즉시 폐기됩니다 (Zero-Retention). 위 출처 링크는 원본 시스템으로 연결됩니다.
                </p>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
