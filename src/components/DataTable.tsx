export type Column<T> = {
  header: string
  render: (row: T) => React.ReactNode
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  selected,
  onToggle,
}: {
  columns: Column<T>[]
  rows: T[]
  selected?: Set<string | number>
  onToggle?: (id: string | number) => void
}) {
  const selectable = selected !== undefined && onToggle !== undefined
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            {selectable && <th className="w-10 px-4 py-3" />}
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-3 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {selectable && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected!.has(row.id)}
                    onChange={() => onToggle!(row.id)}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.header} className="px-4 py-3 text-gray-700">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
