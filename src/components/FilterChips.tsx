export default function FilterChips({
  options,
  active,
  onChange,
}: {
  options: string[]
  active: string
  onChange: (option: string) => void
}) {
  return (
    <div className="flex gap-2 px-8 pt-4">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            active === option
              ? 'bg-violet-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
