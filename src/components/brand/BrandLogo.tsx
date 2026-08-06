interface BrandLogoProps {
  size?: number
  className?: string
}

/**
 * Brand mark from public/logo.png — circular red badge with gold "R" monogram.
 */
export function BrandLogo({ size = 40, className }: BrandLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Annapurna's Rajubhai Dabeliwale logo"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0, objectFit: 'contain' }}
    />
  )
}
