import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'

export default function AgentPage() {
  return (
    <div>
      <PageHeader
        title="심플리 에이전트"
        description="macOS / Windows에 설치해 소프트웨어 사용 현황을 자동으로 수집합니다."
      />
      <div className="grid grid-cols-2 gap-4 p-8">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-gray-900">macOS</span>
            <Badge color="green">설치됨</Badge>
          </div>
          <p className="text-sm text-gray-500">에이전트 버전 2.4.1 · 118대 중 112대 설치 완료</p>
          <button
            type="button"
            className="mt-4 rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white"
          >
            설치 스크립트 복사
          </button>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-gray-900">Windows</span>
            <Badge color="yellow">일부 미설치</Badge>
          </div>
          <p className="text-sm text-gray-500">에이전트 버전 2.4.0 · 118대 중 6대 미설치</p>
          <button
            type="button"
            className="mt-4 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
          >
            미설치 기기 보기
          </button>
        </div>
      </div>

      <div className="px-8 pb-8">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">수집 정보</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
          <ul className="list-disc space-y-1 pl-5">
            <li>설치된 앱 사용 정보 (앱 이름, 제조사, 사용 시간대)</li>
            <li>브라우저 방문 도메인 + 탭 제목 (URL 전체 경로 미수집)</li>
            <li>AI 도구 사용량 (토큰량, 계정 유형 — 대화 내용은 수집하지 않음)</li>
            <li>기기 정보 (UUID, OS 버전, 온라인 상태)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
