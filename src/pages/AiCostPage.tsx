import { useState } from 'react'
import Badge from '../components/Badge'
import DataTable, { type Column } from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Tabs from '../components/Tabs'

type AiTool = {
  id: number
  tool: string
  user: string
  account: string
  monthlyCost: string
}

const AI_TOOLS: AiTool[] = [
  { id: 1, tool: 'Anthropic Claude', user: '이도윤', account: '팀 계정', monthlyCost: '₩120,000' },
  { id: 2, tool: 'Anthropic Claude', user: '박지훈', account: '팀 계정', monthlyCost: '₩120,000' },
  { id: 3, tool: 'OpenAI ChatGPT', user: '김서연', account: 'ChatGPT Workspace', monthlyCost: '₩30,000' },
  { id: 4, tool: 'Gemini Code Assist', user: '이도윤', account: 'GCP 프로젝트', monthlyCost: '₩24,000' },
]

const OBSERVATIONS = [
  { id: 1, alert: '사용자 불일치', device: 'IT-0032', detail: '호스트 사용자와 AI 계정 소유자 불일치', lastSeen: '2026-09-20 09:12' },
  { id: 2, alert: '명부밖 계정', device: 'IT-0034', detail: '개인 이메일로 로그인된 AI 도구 감지', lastSeen: '2026-09-19 18:44' },
]

const columns: Column<AiTool>[] = [
  { header: 'AI 도구', render: (r) => <span className="font-medium text-gray-900">{r.tool}</span> },
  { header: '사용자', render: (r) => r.user },
  { header: '결제 계정', render: (r) => r.account },
  { header: '월 비용', render: (r) => r.monthlyCost },
]

export default function AiCostPage() {
  const [tab, setTab] = useState('벤더 연동')

  return (
    <div>
      <PageHeader
        title="AI 비용 관리"
        description="AI 도구를 누가, 어떤 계정으로, 얼마나 쓰는지 추적합니다."
      />
      <div className="grid grid-cols-3 gap-4 px-8 pb-2 pt-6">
        <StatCard label="이번 달 AI 비용" value="₩294,000" />
        <StatCard label="미해결 관측 경고" value="2건" hint="확인 필요" />
        <StatCard label="사용 중인 AI 도구" value="3개" />
      </div>

      <Tabs tabs={['벤더 연동', '에이전트 관측']} active={tab} onChange={setTab} />

      {tab === '벤더 연동' && (
        <div className="p-8">
          <p className="mb-3 text-sm text-gray-500">
            Anthropic / OpenAI / Gemini 공식 API를 연동해 공식 청구 비용과 좌석 사용률을 가져옵니다. 매일 새벽 4~5시 자동 동기화됩니다.
          </p>
          <DataTable columns={columns} rows={AI_TOOLS} />
        </div>
      )}

      {tab === '에이전트 관측' && (
        <div className="p-8">
          <p className="mb-3 text-sm text-gray-500">
            심플리 에이전트가 기기에서 관측한 개인 계정 포함 AI 사용 현황입니다. (대화 내용은 수집하지 않습니다)
          </p>
          <DataTable
            columns={[
              { header: '경고 유형', render: (r) => <Badge color="red">{r.alert}</Badge> },
              { header: '기기', render: (r) => <span className="font-mono text-xs">{r.device}</span> },
              { header: '상세', render: (r) => r.detail },
              { header: '마지막 확인', render: (r) => r.lastSeen },
            ]}
            rows={OBSERVATIONS}
          />
        </div>
      )}
    </div>
  )
}
