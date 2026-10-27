import { createLucideIcon } from 'lucide-react'

/**
 * The "Hold" icon: a clock face (an L-shaped pair of hands) with the lower-right
 * of the circle opened up and a pause mark in the gap. Drawn like the lucide
 * icons so it takes the same `size` / `className` props as the other header icons.
 */
export const HoldIcon = createLucideIcon('HoldClock', [
  ['path', { d: 'M21 12a9 9 0 1 0-9 9', key: 'ring' }],
  ['path', { d: 'M12 7v5h3.5', key: 'hands' }],
  ['path', { d: 'M16 15v5', key: 'pause-left' }],
  ['path', { d: 'M20 15v5', key: 'pause-right' }],
])
