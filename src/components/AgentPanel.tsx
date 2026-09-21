const SUGGESTIONS = [
  '올해 3분기 SaaS / AI 지출 데이터를 기반으로 다음 분기 예산 계획 작성',
  'A사업장 노트북 대상 자산실사 실행',
  '퇴사자에게 확인할 자산 리스트 정리',
  'AI 비용만 별도 대시보드로 시각화',
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
          최근 30일 Claude 비용 추이와 사용자 리스트를 보여줘
        </div>

        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>🤖</span> Continuum 에이전트 · 관리자 워크플로우
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              🔍 분석 중
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              SaaS / AI 비용 데이터
            </span>
          </div>
          <p className="leading-relaxed text-slate-700">
            최근 30일 Claude 사용 비용은 전월 대비 13.6% 증가했습니다. 미사용자는 18명이며, 그중
            7명은 유료 시트가 유지되고 있습니다.
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
          <span className="flex-1">AI 비용 대시보드 보여줘</span>
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
