export default function BulkActionBar({
  count,
  actions,
}: {
  count: number
  actions: string[]
}) {
  if (count === 0) return null
  return (
    <div className="mx-8 mb-3 flex items-center gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm">
      <span className="font-medium text-violet-700">{count}개 선택됨</span>
      <div className="flex gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            className="rounded-md border border-violet-300 bg-white px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  )
}
