import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import logo from '../assets/logo.png'
import AgentPanel from '../components/AgentPanel'
import { NAV_ITEMS } from './nav'

export type LayoutContext = {
  openAgent: () => void
}

export default function AppLayout() {
  const [agentOpen, setAgentOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center border-b border-slate-200 px-5 py-6">
          <img src={logo} alt="Continuum" className="h-10 w-auto object-contain" />
        </div>

        <div className="px-4 pt-4">
          <button
            type="button"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-50"
          >
            검색... <span className="float-right text-xs">⌘K</span>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 text-xs text-slate-400">
          UI/UX 참고 클론 · 실제 데이터 아님
        </div>
      </aside>

      <main className="relative flex-1 overflow-y-auto">
        <Outlet context={{ openAgent: () => setAgentOpen(true) } satisfies LayoutContext} />

        {!agentOpen && (
          <button
            type="button"
            onClick={() => setAgentOpen(true)}
            className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl text-white shadow-lg shadow-slate-400/50 hover:bg-slate-800"
            aria-label="AI 에이전트 열기"
          >
            ✨
          </button>
        )}
      </main>

      {agentOpen && <AgentPanel onClose={() => setAgentOpen(false)} />}
    </div>
  )
}
