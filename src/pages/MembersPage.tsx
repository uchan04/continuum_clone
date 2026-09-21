import { useState } from 'react'
import Badge from '../components/Badge'
import DataTable, { type Column } from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import Tabs from '../components/Tabs'

type Member = {
  id: number
  name: string
  email: string
  team: string
  role: '관리자' | '멤버'
  status: '활성' | '초대됨' | '비활성화'
}

const MEMBERS: Member[] = [
  { id: 1, name: '김서연', email: 'seoyeon.kim@company.com', team: '디자인팀', role: '관리자', status: '활성' },
  { id: 2, name: '이도윤', email: 'doyoon.lee@company.com', team: '개발팀', role: '멤버', status: '활성' },
  { id: 3, name: '박지훈', email: 'jihoon.park@company.com', team: '마케팅팀', role: '멤버', status: '초대됨' },
]

const ROLE_COLOR: Record<Member['role'], 'violet' | 'gray'> = { 관리자: 'violet', 멤버: 'gray' }
const STATUS_COLOR: Record<Member['status'], 'green' | 'yellow' | 'gray'> = {
  활성: 'green',
  초대됨: 'yellow',
  비활성화: 'gray',
}

const ORG_TREE = [
  { name: '회사 전체', depth: 0, count: 42 },
  { name: '디자인팀', depth: 1, count: 6 },
  { name: '개발팀', depth: 1, count: 18 },
  { name: '마케팅팀', depth: 1, count: 9 },
]

const ROLES = [
  { id: 1, name: '관리자', description: '전체 자산/구성원 관리 권한', memberCount: 3 },
  { id: 2, name: '일반', description: '본인 기기/소프트웨어만 조회', memberCount: 36 },
  { id: 3, name: 'IT 담당자', description: '기기 등록/이전 처리 권한', memberCount: 2 },
]

const TEAMS = [
  { id: 1, name: '디자인팀', memberCount: 6 },
  { id: 2, name: '개발팀', memberCount: 18 },
  { id: 3, name: '마케팅팀', memberCount: 9 },
]

const memberColumns: Column<Member>[] = [
  { header: '이름', render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { header: '이메일', render: (r) => r.email },
  { header: '팀', render: (r) => r.team },
  { header: '역할', render: (r) => <Badge color={ROLE_COLOR[r.role]}>{r.role}</Badge> },
  { header: '상태', render: (r) => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge> },
]

export default function MembersPage() {
  const [tab, setTab] = useState('목록')

  return (
    <div>
      <PageHeader
        title="구성원 관리"
        description="구성원 초대, 조직도, 역할/권한, 팀 설정을 관리합니다."
      />
      <Tabs tabs={['목록', '조직도', '역할', '팀']} active={tab} onChange={setTab} />

      {tab === '목록' && (
        <div className="p-8">
          <div className="mb-3 flex justify-end">
            <button type="button" className="rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white">
              구성원 추가하기
            </button>
          </div>
          <DataTable columns={memberColumns} rows={MEMBERS} />
        </div>
      )}

      {tab === '조직도' && (
        <div className="p-8">
          <div className="rounded-lg border border-gray-200 bg-white">
            {ORG_TREE.map((node) => (
              <div
                key={node.name}
                className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-sm last:border-0"
                style={{ paddingLeft: `${16 + node.depth * 24}px` }}
              >
                <span className={node.depth === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                  {node.name}
                </span>
                <span className="text-gray-400">{node.count}명</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === '역할' && (
        <div className="p-8">
          <DataTable
            columns={[
              { header: '역할', render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
              { header: '설명', render: (r) => r.description },
              { header: '배정 인원', render: (r) => `${r.memberCount}명` },
            ]}
            rows={ROLES}
          />
        </div>
      )}

      {tab === '팀' && (
        <div className="p-8">
          <DataTable
            columns={[
              { header: '팀', render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
              { header: '인원', render: (r) => `${r.memberCount}명` },
            ]}
            rows={TEAMS}
          />
        </div>
      )}
    </div>
  )
}
