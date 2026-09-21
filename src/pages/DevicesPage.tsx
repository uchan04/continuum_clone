import { useState } from 'react'
import Badge from '../components/Badge'
import BulkActionBar from '../components/BulkActionBar'
import DataTable, { type Column } from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import Tabs from '../components/Tabs'

type Device = {
  id: number
  managementNumber: string
  category: string
  model: string
  assignee: string
  ownership: '구매' | '렌탈'
  status: '사용중' | '보관중' | '수리중'
}

const DEVICES: Device[] = [
  { id: 1, managementNumber: 'IT-0031', category: '노트북', model: 'MacBook Pro 14" M3', assignee: '김서연', ownership: '구매', status: '사용중' },
  { id: 2, managementNumber: 'IT-0032', category: '노트북', model: 'MacBook Air 13" M2', assignee: '이도윤', ownership: '렌탈', status: '사용중' },
  { id: 3, managementNumber: 'IT-0033', category: '노트북', model: 'Dell XPS 15', assignee: '미할당', ownership: '구매', status: '보관중' },
  { id: 4, managementNumber: 'IT-0034', category: '모바일', model: 'iPhone 15 Pro', assignee: '박지훈', ownership: '구매', status: '수리중' },
]

const STATUS_COLOR: Record<Device['status'], 'green' | 'gray' | 'yellow'> = {
  사용중: 'green',
  보관중: 'gray',
  수리중: 'yellow',
}

const WORKFLOW_ITEMS = [
  { id: 1, type: '이전 요청', device: 'IT-0033', requester: '박지훈', status: '승인 대기' },
  { id: 2, type: '반출·반납', device: 'IT-0034', requester: '박지훈', status: '진행중' },
  { id: 3, type: '수리·AS', device: 'IT-0034', requester: 'IT팀', status: '진행중' },
]

const HOSTS = [
  { id: 1, hostname: 'DESKTOP-K9SEO', device: 'IT-0031', agent: '정상' as const },
  { id: 2, hostname: 'MBP-DOYOON', device: 'IT-0032', agent: '정상' as const },
  { id: 3, hostname: 'WIN-UNLINKED-04', device: '미연결', agent: '연결 대기' as const },
]

const HOST_STATUS_COLOR: Record<string, 'green' | 'yellow' | 'gray'> = {
  정상: 'green',
  '연결 대기': 'yellow',
  오프라인: 'gray',
}

const columns: Column<Device>[] = [
  { header: '관리번호', render: (r) => <span className="font-mono text-xs">{r.managementNumber}</span> },
  { header: '카테고리', render: (r) => r.category },
  { header: '기기', render: (r) => <span className="font-medium text-gray-900">{r.model}</span> },
  { header: '사용자', render: (r) => r.assignee },
  { header: '소유구분', render: (r) => r.ownership },
  { header: '상태', render: (r) => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge> },
]

export default function DevicesPage() {
  const [tab, setTab] = useState('기기 목록')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const toggle = (id: number | string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id as number) ? next.delete(id as number) : next.add(id as number)
      return next
    })

  return (
    <div>
      <PageHeader
        title="IT 기기 관리"
        description="기기 등록, QR코드 관리, 이전/할당 워크플로우를 관리합니다."
      />
      <Tabs tabs={['기기 목록', '워크플로우', '호스트 관리']} active={tab} onChange={setTab} />

      {tab === '기기 목록' && (
        <div className="p-8">
          <BulkActionBar count={selected.size} actions={['QR 다운로드', '이전하기', '내보내기']} />
          <DataTable columns={columns} rows={DEVICES} selected={selected} onToggle={toggle} />
        </div>
      )}

      {tab === '워크플로우' && (
        <div className="p-8">
          <p className="mb-3 text-sm text-gray-500">자산조사 · 이전요청 · 반출/반납 · 수리/AS 요청을 한 곳에서 처리합니다.</p>
          <DataTable
            columns={[
              { header: '유형', render: (r) => r.type },
              { header: '대상 기기', render: (r) => <span className="font-mono text-xs">{r.device}</span> },
              { header: '요청자', render: (r) => r.requester },
              { header: '상태', render: (r) => <Badge color="yellow">{r.status}</Badge> },
            ]}
            rows={WORKFLOW_ITEMS}
          />
        </div>
      )}

      {tab === '호스트 관리' && (
        <div className="p-8">
          <p className="mb-3 text-sm text-gray-500">에이전트가 설치된 PC(호스트)를 기기 자산과 연결합니다.</p>
          <DataTable
            columns={[
              { header: '호스트명', render: (r) => <span className="font-mono text-xs">{r.hostname}</span> },
              { header: '연결된 기기', render: (r) => r.device },
              {
                header: '에이전트 상태',
                render: (r) => <Badge color={HOST_STATUS_COLOR[r.agent]}>{r.agent}</Badge>,
              },
            ]}
            rows={HOSTS}
          />
        </div>
      )}
    </div>
  )
}
