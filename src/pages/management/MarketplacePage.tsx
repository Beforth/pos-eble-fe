import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  ChevronLeft,
  Cpu,
  Grid,
  Home,
  Layers,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Wand2,
  Zap,
} from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
} from '../../components/menu/MenuActionButtons'

interface ProductCard {
  id: string
  name: string
  category: 'pos-plans' | 'easy-ops' | 'crm' | 'customer-acq' | 'loan'
  status?: 'Activated' | 'Inactive'
  daysLeft?: number
  shield?: boolean
  description?: string
  iconColor?: string
}

const PRODUCTS: ProductCard[] = [
  {
    id: 'p-1',
    name: 'POS Subscription - Renewal',
    category: 'pos-plans',
    status: 'Activated',
    daysLeft: 387,
    shield: false,
    description: 'Core billing POS software annual subscription',
  },
  {
    id: 'p-2',
    name: 'Petpooja - Growth Plan',
    category: 'pos-plans',
    status: 'Inactive',
    shield: true,
    description: 'Advanced analytics & multi-outlet management',
  },
  {
    id: 'p-3',
    name: 'Petpooja - Scale Plan',
    category: 'pos-plans',
    shield: true,
    description: 'Enterprise chain tools, API access & dedicated support',
  },
  {
    id: 'p-4',
    name: 'Petpooja POS + Growth Plan',
    category: 'pos-plans',
    shield: true,
    description: 'Combined POS license + Growth suite package',
  },
  {
    id: 'p-5',
    name: 'Petpooja POS + Scale Plan',
    category: 'pos-plans',
    shield: true,
    description: 'Complete all-in-one POS + Scale enterprise bundle',
  },
  {
    id: 'p-6',
    name: 'Kitchen Display System (KDS)',
    category: 'easy-ops',
    shield: true,
    description: 'Paperless kitchen order routing and status monitors',
  },
  {
    id: 'p-7',
    name: 'Waiter Captain App',
    category: 'easy-ops',
    shield: true,
    description: 'Mobile order taking app for floor stewards',
  },
  {
    id: 'p-8',
    name: 'WhatsApp Marketing & Alerts',
    category: 'crm',
    shield: true,
    description: 'Automated order status & marketing messages on WhatsApp',
  },
  {
    id: 'p-9',
    name: 'Customer Loyalty & Rewards',
    category: 'customer-acq',
    shield: true,
    description: 'Point-based cashbacks and repeat visitor rewards',
  },
  {
    id: 'p-10',
    name: 'Petpooja Business Loan',
    category: 'loan',
    shield: true,
    description: 'Collateral-free working capital loan up to ₹10 Lakhs',
  },
]

export default function MarketplacePage() {
  const navigate = useNavigate()
  const [activeMainTab, setActiveMainTab] = useState<
    'services' | 'integration' | 'subscription'
  >('services')
  const [activeSubPill, setActiveSubPill] = useState<
    'pos-plans' | 'easy-ops' | 'crm' | 'customer-acq' | 'loan'
  >('pos-plans')
  const [carouselIndex, setCarouselIndex] = useState(0)

  const SUB_PILLS = [
    { id: 'pos-plans', label: 'POS Plans' },
    { id: 'easy-ops', label: 'Easy Operations' },
    { id: 'crm', label: 'CRM' },
    { id: 'customer-acq', label: 'Customer Acquisition' },
    { id: 'loan', label: 'Petpooja Loan' },
  ] as const

  const filteredProducts = PRODUCTS.filter((p) => p.category === activeSubPill)

  return (
    <ReportsPageShell
      title="Marketplace"
      activeItem="explore-products-marketplace"
    >
      <div className="space-y-6">
        {/* Top Header / Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 hover:text-ink transition-colors"
            >
              <Home size={16} />
            </button>
            <ChevronRight size={14} className="text-muted/60" />
            <span className="text-ink font-bold">Marketplace</span>
          </div>

          <div className="flex items-center gap-3">
            <OutlineButton
              onClick={() =>
                navigate('/management/explore-products/marketplace-setting')
              }
            >
              <Settings size={15} className="text-primary" />
              <span>Marketplace Settings</span>
            </OutlineButton>
            <OutlineButton variant="gray" onClick={() => navigate(-1)}>
              <ChevronLeft size={15} />
              <span>Back</span>
            </OutlineButton>
          </div>
        </div>

        {/* Hero Promotional Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-r from-[#ffe4e6] via-[#fecdd3] to-[#fda4af] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-xl space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Find Next-Gen Tools To Revolutionize Your Restaurant Business
              </h2>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-md">
                <Sparkles size={14} className="text-amber-400" />
                <span>
                  Explore <strong className="text-amber-300">23+ services</strong> &{' '}
                  <strong className="text-amber-300">40+ integrations</strong> to
                  make your restaurant operations & lives easier
                </span>
              </div>
            </div>

            {/* Banner Vector Illustration Graphic */}
            <div className="relative flex shrink-0 items-center justify-center">
              <div className="relative flex items-center justify-center rounded-2xl bg-white/80 p-5 shadow-xl backdrop-blur-xs border border-white/60">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                    <Store size={26} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                      <Zap size={14} className="text-amber-500 fill-amber-500" />
                      <span>POS Ecosystem</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-600">
                      Sync POS, Swiggy, Zomato & Billing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Indicator Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCarouselIndex(idx)}
                className={`size-2.5 rounded-full transition-all ${
                  carouselIndex === idx
                    ? 'w-6 bg-primary'
                    : 'bg-slate-400/50 hover:bg-slate-500'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Main Category Tabs (Services / Integration / Active Subscription) */}
        <div className="border-b border-line">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => setActiveMainTab('services')}
              className={`flex items-center gap-2 border-b-2 pb-3.5 text-sm font-bold transition-colors ${
                activeMainTab === 'services'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Grid size={17} />
              <span>Services</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('integration')}
              className={`flex items-center gap-2 border-b-2 pb-3.5 text-sm font-bold transition-colors ${
                activeMainTab === 'integration'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Cpu size={17} />
              <span>Integration</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('subscription')}
              className={`flex items-center gap-2 border-b-2 pb-3.5 text-sm font-bold transition-colors ${
                activeMainTab === 'subscription'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Layers size={17} />
              <span>Active Subscription</span>
            </button>
          </div>
        </div>

        {/* Sub-Category Filter Pills */}
        <div className="flex flex-wrap gap-2.5">
          {SUB_PILLS.map((pill) => {
            const active = activeSubPill === pill.id
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveSubPill(pill.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-primary/10 text-primary border border-primary/30 shadow-xs'
                    : 'bg-card text-muted border border-line hover:bg-page hover:text-ink'
                }`}
              >
                {pill.label}
              </button>
            )
          })}
        </div>

        {/* Section Header */}
        <div className="space-y-1 pt-2">
          <h3 className="text-lg font-bold text-ink">
            {SUB_PILLS.find((p) => p.id === activeSubPill)?.label}
          </h3>
          <p className="text-xs text-muted">
            Don't miss out on all the benefits & features of your subscription.
            Renew your plan today!
          </p>
        </div>

        {/* Product Cards Horizontal Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              {/* Top Shield Badge */}
              <div className="flex items-center justify-between">
                {product.shield ? (
                  <ShieldCheck size={16} className="text-muted/60" />
                ) : (
                  <span />
                )}
              </div>

              {/* Center Logo Icon */}
              <div className="my-5 flex flex-col items-center text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs transition-transform group-hover:scale-105">
                  <Wand2 size={26} />
                </div>
                <h4 className="mt-4 text-sm font-bold text-ink leading-snug">
                  {product.name}
                </h4>
                {product.description ? (
                  <p className="mt-1 text-[11px] text-muted line-clamp-2">
                    {product.description}
                  </p>
                ) : null}
              </div>

              {/* Bottom Action / Status Footer */}
              <div className="border-t border-line/60 pt-3">
                {product.status === 'Activated' ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                      Activated
                    </span>
                    <span className="text-[11px] font-medium text-muted">
                      {product.daysLeft} days left
                    </span>
                  </div>
                ) : product.status === 'Inactive' ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-200">
                      Inactive
                    </span>
                    <button
                      type="button"
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Activate
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-1 text-xs font-bold text-primary transition-colors hover:text-primary-hover"
                  >
                    <span>Explore Now</span>
                    <ChevronRight size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ReportsPageShell>
  )
}
