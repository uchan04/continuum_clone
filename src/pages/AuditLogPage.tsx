import Badge from '../components/Badge'
import DataTable, { type Column } from '../components/DataTable'
import PageHeader from '../components/PageHeader'

type LogEntry = {
  id: number
  timestamp: string
  eventType: '권한 회수' | '인수인계 생성' | '연동 변경' | '로그인'
  target: string
  actor: string
  result: '성공' | '실패'
}

const LOGS: LogEntry[] = [
  { id: 1, timestamp: '2026-09-20 14:02:11', eventType: '권한 회수', target: '최윤재 · Slack', actor: '시스템 자동', result: '성공' },
  { id: 2, timestamp: '2026-09-20 14:02:12', eventType: '권한 회수', target: '최윤재 · Notion', actor: '시스템 자동', result: '성공' },
  { id: 3, timestamp: '2026-09-20 14:02:45', eventType: '권한 회수', target: '최윤재 · 이카운트 ERP', actor: '시스템 자동(RPA)', result: '실패' },
  { id: 4, timestamp: '2026-08-31 09:15:03', eventType: '인수인계 생성', target: '한소미 리포트', actor: '시스템 자동', result: '성공' },
  { id: 5, timestamp: '2026-09-19 11:20:00', eventType: '연동 변경', target: 'Google Workspace', actor: '정다운', result: '성공' },
  { id: 6, timestamp: '2026-09-18 08:41:22', eventType: '로그인', target: '관리자 대시보드', actor: '정다운', result: '성공' },
]

const RESULT_COLOR: Record<LogEntry['result'], 'green' | 'red'> = { 성공: 'green', 실패: 'red' }

const columns: Column<LogEntry>[] = [
  { header: '일시', render: (r) => <span className="font-mono text-xs">{r.timestamp}</span> },
  { header: '이벤트', render: (r) => r.eventType },
  { header: '대상', render: (r) => r.target },
  { header: '처리자', render: (r) => r.actor },
  { header: '결과', render: (r) => <Badge color={RESULT_COLOR[r.result]}>{r.result}</Badge> },
]

export default function AuditLogPage() {
  return (
    <div>
      <PageHeader
        title="감사 로그"
        description="Zero-Retention 설계 — 메시지·문서 원문은 처리 직후 즉시 폐기되고, 최소한의 감사 로그만 보관됩니다."
      />
      <div className="px-8 py-6">
        <DataTable columns={columns} rows={LOGS} />
      </div>
    </div>
  )
}
