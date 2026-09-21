const SUGGESTIONS = [
  '최윤재 인수인계 리포트를 실무자용으로 다시 생성',
  '이번 달 미회수 위험 계정 있는지 점검',
  '더존 RPA 어댑터 연동 상태 확인',
  '퇴사 예정자 3명 일괄 권한 회수 예약',
]

export default function AgentPanel({ onClose }: { onClose: () => void }) {
  return (
    <aside className="flex h-screen w-96 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          ←
        </button>
        <h2 className="text-base font-semibold text-slate-900">Continuum AI 에이전트</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
        <div className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
          최윤재 인수인계 리포트 요약해서 보여줘
        </div>

        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>🤖</span> Continuum 에이전트 · 오프보딩 워크플로우
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              🔍 분석 중
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              권한 인식(Permission-Aware) RAG
            </span>
          </div>
          <p className="leading-relaxed text-slate-700">
            최윤재님의 결제 모듈 리팩터링(PR #482)이 리뷰 대기 중이고, 장애 이슈 CONT-118은 원인 파악
            단계입니다. 이카운트 ERP 권한 회수는 아직 처리중입니다.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">요청하시면 바로 다음 작업을 이어서 실행할 수 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
            {SUGGESTIONS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="mt-3 flex gap-3 text-slate-400">
            <span>⧉</span>
            <span>↻</span>
            <span>👍</span>
            <span>👎</span>
            <span>⋯</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-500">
          <span>+</span>
          <span className="flex-1">오프보딩 대시보드 보여줘</span>
          <span>🎤</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white">
            ↑
          </span>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          실행 전 주요 작업은 관리자 확인 후 진행됩니다.
        </p>
      </div>
    </aside>
  )
}
