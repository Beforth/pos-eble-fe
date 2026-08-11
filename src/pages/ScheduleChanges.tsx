import { type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bike,
  ClipboardList,
  ShoppingBag,
  Utensils,
} from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { MenuSectionNav } from '../components/menu/MenuSectionNav'

interface ChannelCard {
  id: string
  label: string
  icon: ReactNode
}

function AggregatorLogo({ name }: { name: 'Zomato' | 'Swiggy' }) {
  const isSwiggy = name === 'Swiggy'
  return (
    <span className="relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-page">
      <img
        src={isSwiggy ? '/swiggy.png' : '/zomato.png'}
        alt={`${name} logo`}
        width={isSwiggy ? 36 : 28}
        height={isSwiggy ? 36 : 28}
        className={
          isSwiggy
            ? 'absolute size-9 max-w-none scale-110 object-cover'
            : 'size-7 object-contain'
        }
      />
    </span>
  )
}

const CHANNELS: ChannelCard[] = [
  {
    id: 'base-menu',
    label: 'Base Menu',
    icon: <ClipboardList size={22} className="text-primary" />,
  },
  {
    id: 'home-delivery',
    label: 'Home Delivery',
    icon: <Bike size={22} className="text-accent" />,
  },
  {
    id: 'parcel',
    label: 'Parcel',
    icon: <ShoppingBag size={22} className="text-deep" />,
  },
  {
    id: 'dine-in',
    label: 'Dine In',
    icon: <Utensils size={22} className="text-success" />,
  },
  {
    id: 'zomato',
    label: 'Zomato',
    icon: <AggregatorLogo name="Zomato" />,
  },
  {
    id: 'swiggy',
    label: 'Swiggy',
    icon: <AggregatorLogo name="Swiggy" />,
  },
]

export default function ScheduleChanges() {
  const navigate = useNavigate()

  return (
    <MenuPageShell
      backTo="/menu"
      activeItem="schedule-changes"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link
            to="/menu"
            className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Menu Scheduling</span>
        </span>
      }
    >
      <MenuSectionNav activeTab="items" />

      <div className="mb-5 rounded-lg border border-secondary/50 bg-secondary/25 px-4 py-2.5 text-sm text-deep">
        Enjoy maximum flexibility and control over your menu with Schedule Menu
        Changes.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CHANNELS.map((channel) => {
          const isLogo =
            channel.id === 'zomato' || channel.id === 'swiggy'
          return (
            <button
              key={channel.id}
              type="button"
              onClick={() =>
                navigate(`/menu/schedule-changes/${channel.id}`)
              }
              className="flex min-h-[88px] cursor-pointer items-center gap-4 rounded-xl border border-line bg-card px-5 py-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {isLogo ? (
                channel.icon
              ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-page">
                  {channel.icon}
                </span>
              )}
              <span className="text-sm font-semibold text-ink sm:text-base">
                {channel.label}
              </span>
            </button>
          )
        })}
      </div>
    </MenuPageShell>
  )
}
