import { Search } from 'lucide-react'

interface ListSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function ListSearch({
  value,
  onChange,
  placeholder = 'Search',
  className = '',
  id,
}: ListSearchProps) {
  return (
    <div className={`relative min-w-[200px] flex-1 sm:max-w-xs ${className}`}>
      <Search
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
      />
    </div>
  )
}
