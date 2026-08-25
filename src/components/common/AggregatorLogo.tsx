export type AggregatorName = 'Zomato' | 'Swiggy'
export type AggregatorSize = '2xs' | 'xs' | 'sm' | 'md'

const SIZE_STYLES: Record<
  AggregatorSize,
  {
    chip: string
    swiggyImg: string
    zomatoImg: string
    swiggyDim: number | undefined
    zomatoDim: number
  }
> = {
  '2xs': {
    chip: 'relative inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded',
    swiggyImg: 'absolute size-8 max-w-none object-cover',
    zomatoImg: 'size-5 object-contain',
    swiggyDim: undefined,
    zomatoDim: 20,
  },
  xs: {
    chip: 'relative inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded',
    swiggyImg: 'absolute size-10 max-w-none scale-110 object-cover',
    zomatoImg: 'size-6 object-contain',
    swiggyDim: 40,
    zomatoDim: 24,
  },
  sm: {
    chip: 'relative inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md',
    swiggyImg: 'absolute size-11 max-w-none scale-125 object-cover',
    zomatoImg: 'size-7 object-contain',
    swiggyDim: 44,
    zomatoDim: 28,
  },
  md: {
    chip: 'relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-page',
    swiggyImg: 'absolute size-9 max-w-none scale-110 object-cover',
    zomatoImg: 'size-7 object-contain',
    swiggyDim: 36,
    zomatoDim: 28,
  },
}

export function AggregatorLogo({
  name,
  size = 'md',
}: {
  name: AggregatorName
  size?: AggregatorSize
}) {
  const isSwiggy = name === 'Swiggy'
  const styles = SIZE_STYLES[size]
  const dim = isSwiggy ? styles.swiggyDim : styles.zomatoDim
  return (
    <span className={styles.chip}>
      <img
        src={isSwiggy ? '/swiggy.png' : '/zomato.png'}
        alt={`${name} logo`}
        width={dim}
        height={dim}
        className={isSwiggy ? styles.swiggyImg : styles.zomatoImg}
      />
    </span>
  )
}
