const COLORS: Record<string, string> = {
  green: 'bg-green-50 text-green-700',
  gray: 'bg-gray-100 text-gray-600',
  yellow: 'bg-yellow-50 text-yellow-700',
  red: 'bg-red-50 text-red-700',
  violet: 'bg-violet-50 text-violet-700',
}

export default function Badge({
  children,
  color = 'gray',
}: {
  children: React.ReactNode
  color?: keyof typeof COLORS
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[color]}`}
    >
      {children}
    </span>
  )
}
