const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const HOURS = ['0:00', '2:00', '4:00', '6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']

// ponytail: deterministic fake pattern (business-hours-heavy) instead of a real usage query
const INTENSITY = HOURS.map((_, h) =>
  DAYS.map((_, d) => {
    const isWeekday = d >= 1 && d <= 5
    const isBusinessHour = h >= 4 && h <= 8
    if (!isWeekday) return 5 + ((h * 3 + d) % 10)
    if (isBusinessHour) return 55 + ((h * 7 + d * 13) % 40)
    return 10 + ((h * 5 + d * 3) % 25)
  }),
)

function colorFor(value: number) {
  if (value >= 80) return 'bg-blue-600'
  if (value >= 60) return 'bg-blue-500'
  if (value >= 40) return 'bg-blue-400'
  if (value >= 20) return 'bg-blue-200'
  return 'bg-blue-100'
}

export default function UsageHeatmap() {
  return (
    <div>
      <div className="grid grid-cols-[repeat(7,1fr)_auto] gap-1">
        {HOURS.map((hour, h) => (
          <div key={hour} className="contents">
            {DAYS.map((day, d) => (
              <div
                key={`${hour}-${day}`}
                className={`h-4 rounded-sm ${colorFor(INTENSITY[h][d])}`}
                title={`${day} ${hour} · ${INTENSITY[h][d]}%`}
              />
            ))}
            <span className="pl-2 text-[10px] leading-4 text-slate-400">{hour}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
        {DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <span>0%</span>
        <div className="flex h-2 flex-1 overflow-hidden rounded-full">
          <div className="flex-1 bg-blue-100" />
          <div className="flex-1 bg-blue-200" />
          <div className="flex-1 bg-blue-400" />
          <div className="flex-1 bg-blue-500" />
          <div className="flex-1 bg-blue-600" />
        </div>
        <span>100%</span>
      </div>
    </div>
  )
}
