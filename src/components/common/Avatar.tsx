type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

interface AvatarProps {
  src?: string
  name: string
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
}

/** Deterministic background from the palette, keyed off the name. */
const avatarPalette = [
  'bg-primary',
  'bg-accent',
  'bg-deep',
  'bg-success',
  'bg-[#7c3aed]',
  'bg-[#0e7490]',
]

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function colorOf(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return avatarPalette[hash % avatarPalette.length]
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    )
  }
  return (
    <span
      aria-label={name}
      title={name}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white ${colorOf(name)} ${sizeClasses[size]} ${className}`}
    >
      {initialsOf(name)}
    </span>
  )
}
