import KpiCard from '../components/KpiCard'
import UsageHeatmap from '../components/UsageHeatmap'

type SaasRow = {
  id: number
  name: string
  category: string
  monthlyCost: string
  users: number
  initial: string
  color: string
}

const TOP_SAAS: SaasRow[] = [
  { id: 1, name: 'ChatGPT', category: 'AI', monthlyCost: '₩1,562,000', users: 65, initial: 'G', color: 'bg-emerald-500' },
  { id: 2, name: 'Microsoft 365', category: '오피스', monthlyCost: '₩1,412,000', users: 52, initial: 'M', color: 'bg-orange-500' },
  { id: 3, name: 'Figma', category: '디자인', monthlyCost: '₩1,237,000', users: 28, initial: 'F', color: 'bg-slate-900' },
  { id: 4, name: 'Dropbox', category: '유틸리티', monthlyCost: '₩1,489,000', users: 57, initial: 'D', color: 'bg-blue-500' },
  { id: 5, name: 'Slack', category: '커뮤니케이션', monthlyCost: '₩1,375,000', users: 50, initial: 'S', color: 'bg-purple-500' },
  { id: 6, name: 'Adobe', category: '디자인', monthlyCost: '₩1,823,000', users: 45, initial: 'A', color: 'bg-red-600' },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold text-slate-900">시작하기</h1>
      </div>

        <div className="grid grid-cols-4 gap-4 px-8">
          <KpiCard icon="💰" label="연간 총 비용" value="₩7,780,000" deltaLabel="전년 대비 18.5%" deltaDirection="up" />
          <KpiCard icon="🔳" label="사용 중인 SaaS" value="52개" deltaLabel="전월 대비 5" deltaDirection="up" />
          <KpiCard icon="🚫" label="미사용 사용자" value="17명" deltaLabel="전년 대비 3" deltaDirection="down" />
          <KpiCard icon="➕" label="신규 발견 앱" value="6개" deltaLabel="전월 대비 3" deltaDirection="up" />
        </div>

        <div className="grid grid-cols-2 gap-4 px-8 py-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">사용 중인 주요 SaaS</h2>
              <a href="#" className="text-xs font-medium text-violet-600 hover:underline">
                전체 앱 보기 →
              </a>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-slate-400">
                  <th className="pb-2 font-normal">앱</th>
                  <th className="pb-2 font-normal">카테고리</th>
                  <th className="pb-2 font-normal">월간 비용</th>
                  <th className="pb-2 font-normal">사용자</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TOP_SAAS.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold text-white ${row.color}`}
                        >
                          {row.initial}
                        </span>
                        <span className="font-medium text-slate-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-500">{row.category}</td>
                    <td className="py-2.5 text-slate-700">{row.monthlyCost}</td>
                    <td className="py-2.5 text-slate-500">{row.users}명</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">사용량 히트맵</h2>
              <a href="#" className="text-xs font-medium text-violet-600 hover:underline">
                자세히 보기 →
              </a>
            </div>
            <UsageHeatmap />
          </div>
        </div>
    </div>
  )
}
