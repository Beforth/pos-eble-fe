import type { ReactNode } from 'react'
import {
  ChefHat,
  HandPlatter,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
} from 'lucide-react'

export type LiveBoardKind = 'running' | 'pending'

/** Plain-language names for the two boards (the API calls them running / pending). */
export const LIVE_BOARD_TITLES: Record<LiveBoardKind, string> = {
  running: 'Bills waiting for payment',
  pending: 'Food in the kitchen',
}

export const LIVE_CHANNEL_ICONS: Record<string, ReactNode> = {
  dineIn: <UtensilsCrossed size={18} />,
  pickup: <HandPlatter size={18} />,
  delivery: <Truck size={18} />,
  prep: <ChefHat size={18} />,
  waiting: <ShoppingBag size={18} />,
  out: <Truck size={18} />,
}
