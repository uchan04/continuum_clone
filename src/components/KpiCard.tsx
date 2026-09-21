export default function KpiCard({
  icon,
  label,
  value,
  deltaLabel,
  deltaDirection,
}: {
  icon: string
  label: string
  value: string
  deltaLabel: string
  deltaDirection: 'up' | 'down'
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-base">
        {icon}
      </div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      <div
        className={`mt-1 text-xs font-medium ${
          deltaDirection === 'up' ? 'text-green-600' : 'text-red-500'
        }`}
      >
        {deltaDirection === 'up' ? '↑' : '↓'} {deltaLabel}
      </div>
    </div>
  )
}
