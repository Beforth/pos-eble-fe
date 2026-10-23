import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, FileX, LayoutGrid, Search } from 'lucide-react'
import { BillingHeader } from '../components/billing/BillingHeader'
import { useNewOrder } from '../state/useNewOrder'
import { showToast } from '../utils/toast'

type FeedbackTab = 'complaints' | 'ratings'

interface SourceOption {
  id: string
  label: string
  logo?: string
}

const TABS: { id: FeedbackTab; label: string }[] = [
  { id: 'complaints', label: 'Complaints' },
  { id: 'ratings', label: 'Ratings' },
]

const SOURCES: Record<FeedbackTab, SourceOption[]> = {
  complaints: [
    { id: 'all', label: 'All' },
    { id: 'zomato', label: 'zomato', logo: '/zomato.png' },
    { id: 'swiggy', label: 'swiggy', logo: '/swiggy.png' },
  ],
  ratings: [{ id: 'zomato', label: 'zomato', logo: '/zomato.png' }],
}

export default function Feedback() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')
  const [tab, setTab] = useState<FeedbackTab>('complaints')
  const [source, setSource] = useState('all')
  const [search, setSearch] = useState('')

  const sources = SOURCES[tab]

  function selectTab(next: FeedbackTab) {
    setTab(next)
    setSource(SOURCES[next][0].id)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3">
        <h1 className="text-lg font-semibold text-ink">Feedback</h1>
        <button
          type="button"
          onClick={() => navigate('/configuration')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      </div>

      <div className="flex gap-1 border-b border-line bg-page px-5 pt-3">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectTab(item.id)}
            className={`rounded-t-lg px-8 py-3 text-sm font-medium ${
              tab === item.id
                ? 'bg-card text-primary'
                : 'text-ink hover:text-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex border-b border-line bg-card">
        {sources.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSource(item.id)}
            className={`flex w-[126px] flex-col items-center gap-1 border-b-2 px-4 py-3 text-sm text-ink ${
              source === item.id
                ? 'border-primary bg-primary/10'
                : 'border-transparent hover:bg-page'
            }`}
          >
            {item.logo ? (
              <img src={item.logo} alt="" className="size-9 rounded-lg object-contain" />
            ) : (
              <LayoutGrid size={30} strokeWidth={1.5} />
            )}
            {item.label}
          </button>
        ))}
      </div>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-56">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-lg border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink focus:border-primary"
            />
          </div>
          {tab === 'complaints' && (
            <button
              type="button"
              onClick={() => showToast('No records to export')}
              className="h-10 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
            >
              Export
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-card px-6 py-6 text-sm text-muted shadow-sm">
          <FileX size={72} strokeWidth={1.25} className="text-line" />
          There is no record available.
        </div>
      </main>
    </div>
  )
}
